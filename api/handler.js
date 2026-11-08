// Единый API Hawkins Education. Маршрут приходит в ?route=… (см. vercel.json).
import { readDb, mutate } from '../lib/store.js';
import { sign, verify, readCookie, sessionCookie, hashPin, checkPin, safeEqual, adminPassword, uid } from '../lib/auth.js';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LESSON_STATUS = ['planned', 'done', 'canceled'];
const LEAD_STATUS = ['new', 'contacted', 'trial', 'enrolled', 'lost'];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

const publicTeacher = ({ pinHash, ...t }) => t;

// Простая защита от перебора и спама (в пределах инстанса).
const hits = new Map();
function limit(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (arr.length > max) fail(429, 'Слишком много попыток. Подождите минуту.');
}
const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();

function cleanLesson(input, db) {
  const l = {
    teacherId: str(input.teacherId, 40),
    date: str(input.date, 10),
    start: str(input.start, 5),
    end: str(input.end, 5),
    title: str(input.title, 80),
    group: str(input.group, 40),
    room: str(input.room, 40),
    note: str(input.note, 1000),
    status: LESSON_STATUS.includes(input.status) ? input.status : 'planned',
  };
  if (!db.teachers.some((t) => t.id === l.teacherId)) fail(400, 'Выберите учителя');
  if (!DATE.test(l.date)) fail(400, 'Неверная дата');
  if (!TIME.test(l.start) || !TIME.test(l.end)) fail(400, 'Неверное время');
  if (l.end <= l.start) fail(400, 'Конец урока должен быть позже начала');
  if (!l.title) fail(400, 'Укажите название урока');
  return l;
}

function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function conflicts(db, lesson, ignoreIds) {
  return db.lessons.filter((x) => !ignoreIds.has(x.id) && x.status !== 'canceled' && x.date === lesson.date
    && x.start < lesson.end && lesson.start < x.end
    && (x.teacherId === lesson.teacherId || (lesson.room && lesson.room !== 'Онлайн' && x.room === lesson.room)));
}

const routes = {
  // ---------- Публичное ----------
  'POST lead': async (req) => {
    limit(`lead:${ip(req)}`, 5, 60_000);
    const b = await body(req);
    if (b.website) return { ok: true }; // honeypot
    const name = str(b.name, 80);
    const phone = str(b.phone, 30);
    if (name.length < 2) fail(400, 'Укажите имя');
    if (phone.replace(/\D/g, '').length < 10) fail(400, 'Укажите корректный телефон');
    await mutate((db) => {
      db.leads.unshift({
        id: uid('ld_'), name, phone, course: str(b.course, 80), comment: str(b.comment, 500),
        source: str(b.source, 40) || 'site', status: 'new', createdAt: new Date().toISOString(),
      });
      db.leads = db.leads.slice(0, 5000);
    });
    return { ok: true };
  },

  // ---------- Авторизация ----------
  'POST login': async (req, res) => {
    limit(`login:${ip(req)}`, 10, 60_000);
    const b = await body(req);
    const login = str(b.login, 60).toLowerCase();
    const pass = String(b.password ?? '');
    let session;
    if (login === 'admin') {
      const expected = adminPassword();
      if (!expected) fail(500, 'ADMIN_PASSWORD не настроен');
      if (!safeEqual(pass, expected)) fail(401, 'Неверный логин или пароль');
      session = { role: 'admin', name: 'Администратор' };
    } else {
      const db = await readDb();
      const t = db.teachers.find((x) => x.login === login && x.active !== false);
      if (!t || !checkPin(pass, t.pinHash)) fail(401, 'Неверный логин или пароль');
      session = { role: 'teacher', id: t.id, name: t.name };
    }
    res.setHeader('Set-Cookie', sessionCookie(sign(session), req));
    return { ok: true, user: session };
  },

  'POST logout': async (req, res) => {
    res.setHeader('Set-Cookie', sessionCookie('', req));
    return { ok: true };
  },

  'GET me': async (req, res, user) => ({ user }),

  // ---------- Данные ----------
  'GET state': async (req, res, user) => {
    if (!user) fail(401, 'Нужно войти');
    const db = await readDb();
    if (user.role === 'admin') {
      return { user, settings: db.settings, teachers: db.teachers.map(publicTeacher), lessons: db.lessons, leads: db.leads };
    }
    const me = db.teachers.find((t) => t.id === user.id);
    if (!me) fail(401, 'Учётная запись не найдена');
    return { user, settings: db.settings, teachers: [publicTeacher(me)], lessons: db.lessons.filter((l) => l.teacherId === me.id), leads: [] };
  },

  // ---------- Админ: учителя ----------
  'POST admin/teacher': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const login = str(b.login, 40).toLowerCase().replace(/[^a-z0-9._-]/g, '');
      if (!str(b.name)) fail(400, 'Укажите имя');
      if (!login || login === 'admin') fail(400, 'Укажите логин (латиница, цифры)');
      if (db.teachers.some((t) => t.login === login && t.id !== b.id)) fail(400, 'Такой логин уже занят');
      const data = {
        name: str(b.name, 80), subject: str(b.subject, 80), login, phone: str(b.phone, 30),
        color: /^#[0-9a-f]{6}$/i.test(b.color) ? b.color : '#8B5CF6', active: b.active !== false,
      };
      let t = db.teachers.find((x) => x.id === b.id);
      if (t) Object.assign(t, data);
      else {
        if (!b.pin) fail(400, 'Задайте PIN/пароль для входа');
        t = { id: uid('t_'), ...data };
        db.teachers.push(t);
      }
      if (b.pin) {
        if (String(b.pin).length < 4) fail(400, 'PIN — минимум 4 символа');
        t.pinHash = hashPin(b.pin);
      }
      return { teacher: publicTeacher(t) };
    });
  },

  'DELETE admin/teacher': async (req, res, user, q) => mutate((db) => {
    const id = q.get('id');
    if (!db.teachers.some((t) => t.id === id)) fail(404, 'Учитель не найден');
    db.teachers = db.teachers.filter((t) => t.id !== id);
    db.lessons = db.lessons.filter((l) => l.teacherId !== id);
    return { ok: true };
  }),

  // ---------- Админ: уроки ----------
  'POST admin/lesson': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const base = cleanLesson(b.lesson || {}, db);
      const id = b.lesson?.id;
      const force = Boolean(b.force);
      if (id) {
        const cur = db.lessons.find((l) => l.id === id);
        if (!cur) fail(404, 'Урок не найден');
        const targets = b.scope === 'series' && cur.seriesId
          ? db.lessons.filter((l) => l.seriesId === cur.seriesId && l.date >= cur.date) : [cur];
        const shift = Math.round((new Date(`${base.date}T00:00:00Z`) - new Date(`${cur.date}T00:00:00Z`)) / 86400000);
        const ids = new Set(targets.map((t) => t.id));
        const next = targets.map((t) => ({ ...t, ...base, date: t === cur ? base.date : addDays(t.date, shift), status: t === cur ? base.status : t.status, note: t === cur ? base.note : t.note }));
        const clash = next.flatMap((n) => conflicts(db, n, ids));
        if (clash.length && !force) return { conflict: clash.slice(0, 5) };
        next.forEach((n, i) => Object.assign(targets[i], n));
        return { ok: true, updated: next.length };
      }
      const weeks = Math.min(Math.max(parseInt(b.repeatWeeks, 10) || 1, 1), 52);
      const seriesId = weeks > 1 ? uid('s_') : null;
      const created = [];
      for (let w = 0; w < weeks; w++) created.push({ id: uid('l_'), seriesId, ...base, date: addDays(base.date, w * 7) });
      const clash = created.flatMap((n) => conflicts(db, n, new Set()));
      if (clash.length && !force) return { conflict: clash.slice(0, 5) };
      db.lessons.push(...created);
      return { ok: true, created: created.length };
    });
  },

  'DELETE admin/lesson': async (req, res, user, q) => mutate((db) => {
    const cur = db.lessons.find((l) => l.id === q.get('id'));
    if (!cur) fail(404, 'Урок не найден');
    if (q.get('scope') === 'series' && cur.seriesId) {
      db.lessons = db.lessons.filter((l) => !(l.seriesId === cur.seriesId && l.date >= cur.date));
    } else db.lessons = db.lessons.filter((l) => l.id !== cur.id);
    return { ok: true };
  }),

  // ---------- Админ: заявки и настройки ----------
  'POST admin/lead': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      let lead = db.leads.find((l) => l.id === b.id);
      if (!lead) {
        if (!str(b.name)) fail(400, 'Укажите имя');
        lead = { id: uid('ld_'), source: 'manual', createdAt: new Date().toISOString(), status: 'new' };
        db.leads.unshift(lead);
      }
      for (const k of ['name', 'phone', 'course', 'comment', 'note']) if (k in b) lead[k] = str(b[k], k === 'comment' || k === 'note' ? 1000 : 80);
      if (LEAD_STATUS.includes(b.status)) lead.status = b.status;
      lead.updatedAt = new Date().toISOString();
      return { lead };
    });
  },

  'DELETE admin/lead': async (req, res, user, q) => mutate((db) => {
    db.leads = db.leads.filter((l) => l.id !== q.get('id'));
    return { ok: true };
  }),

  'POST admin/settings': async (req, res, user) => {
    const b = await body(req);
    const list = (v) => (Array.isArray(v) ? v : []).map((x) => str(x, 60)).filter(Boolean).slice(0, 100);
    return mutate((db) => {
      if (b.rooms) db.settings.rooms = list(b.rooms);
      if (b.courses) db.settings.courses = list(b.courses);
      return { settings: db.settings };
    });
  },

  // ---------- Учитель ----------
  'POST teacher/lesson': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const l = db.lessons.find((x) => x.id === b.id);
      if (!l || (user.role === 'teacher' && l.teacherId !== user.id)) fail(404, 'Урок не найден');
      if (LESSON_STATUS.includes(b.status)) l.status = b.status;
      if ('note' in b) l.note = str(b.note, 1000);
      return { lesson: l };
    });
  },

  'POST teacher/password': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const t = db.teachers.find((x) => x.id === user.id);
      if (!t || !checkPin(b.current, t.pinHash)) fail(400, 'Текущий пароль неверный');
      if (String(b.next || '').length < 4) fail(400, 'Новый пароль — минимум 4 символа');
      t.pinHash = hashPin(b.next);
      return { ok: true };
    });
  },
};

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    const route = (url.searchParams.get('route') || url.pathname.replace(/^\/api\/?/, '')).replace(/^\/|\/$/g, '');
    const key = `${req.method} ${route}`;
    const fn = routes[key];
    if (!fn) fail(404, 'Not found');
    const user = verify(readCookie(req));
    if (route.startsWith('admin/') && user?.role !== 'admin') fail(403, 'Только для администратора');
    if (route.startsWith('teacher/') && !user) fail(401, 'Нужно войти');
    if (route === 'teacher/password' && user?.role !== 'teacher') fail(403, 'Только для учителя');
    if (req.method !== 'GET' && route !== 'lead') {
      // CSRF: запросы на изменение — только с нашего же сайта
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) fail(403, 'Bad origin');
    }
    const data = await fn(req, res, user, url.searchParams);
    send(res, 200, data);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status === 500) console.error(e);
    send(res, status, { error: status === 500 ? 'Ошибка сервера' : e.message });
  }
}
