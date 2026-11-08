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
    studentIds: cleanIds(input.studentIds, db.students),
  };
  l.kind = ['group', 'individual'].includes(input.kind) ? input.kind : (l.studentIds.length > 1 ? 'group' : 'individual');
  l.attendance = cleanAttendance(input.attendance, l.studentIds);
  if (!db.teachers.some((t) => t.id === l.teacherId)) fail(400, 'Выберите учителя');
  if (!DATE.test(l.date)) fail(400, 'Неверная дата');
  if (!TIME.test(l.start) || !TIME.test(l.end)) fail(400, 'Неверное время');
  if (l.end <= l.start) fail(400, 'Конец урока должен быть позже начала');
  if (!l.title) fail(400, 'Укажите название урока');
  return l;
}

function cleanIds(ids, list) {
  const ok = new Set(list.map((x) => x.id));
  return [...new Set(Array.isArray(ids) ? ids : [])].filter((id) => ok.has(id)).slice(0, 30);
}
function cleanAttendance(att, ids) {
  const out = {};
  if (att && typeof att === 'object') for (const id of ids) if (att[id] === 'present' || att[id] === 'absent') out[id] = att[id];
  return out;
}
const money = (v) => Math.max(0, Math.round(Number(v) || 0));
const EXPENSE_CATS = ['salary', 'rent', 'ads', 'tax', 'other'];

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

  // Проверка, что база доступна (для мониторинга)
  'GET health': async () => {
    const db = await readDb();
    return { ok: true, storage: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local', updatedAt: db.updatedAt || null };
  },

  // ---------- Данные ----------
  'GET state': async (req, res, user) => {
    if (!user) fail(401, 'Нужно войти');
    const db = await readDb();
    if (user.role === 'admin') {
      return { user, settings: db.settings, teachers: db.teachers.map(publicTeacher), lessons: db.lessons, leads: db.leads, students: db.students, payments: db.payments, expenses: db.expenses };
    }
    const me = db.teachers.find((t) => t.id === user.id);
    if (!me) fail(401, 'Учётная запись не найдена');
    const lessons = db.lessons.filter((l) => l.teacherId === me.id);
    const sids = new Set(lessons.flatMap((l) => l.studentIds || []));
    db.students.forEach((st) => { if (st.teacherId === me.id) sids.add(st.id); });
    const students = db.students.filter((st) => sids.has(st.id)).map(({ id, name, group, subject }) => ({ id, name, group, subject }));
    const { rateIndividual, rateGroup, percent, ...pubMe } = publicTeacher(me); // финансы учителю не показываем
    return { user, settings: { rooms: db.settings.rooms, courses: db.settings.courses }, teachers: [pubMe], lessons, students, leads: [], payments: [], expenses: [] };
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
        percent: b.percent === '' || b.percent == null ? null : Math.min(Math.max(Number(b.percent) || 0, 0), 100),
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
    db.students.forEach((st) => { if (st.teacherId === id) st.teacherId = ''; });
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
        const next = targets.map((t) => ({ ...t, ...base, date: t === cur ? base.date : addDays(t.date, shift), status: t === cur ? base.status : t.status, note: t === cur ? base.note : t.note, attendance: t === cur ? base.attendance : (t.attendance || {}) }));
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
      if (Array.isArray(b.tariffs)) {
        db.settings.tariffs = b.tariffs.slice(0, 50).map((t) => ({
          id: str(t.id, 40) || uid('tr_'), name: str(t.name, 80) || 'Тариф', type: t.type === 'group' ? 'group' : 'individual',
          lessons: Math.min(Math.max(parseInt(t.lessons, 10) || 1, 1), 200), price: money(t.price),
        }));
      }
      if ('taxPercent' in b) db.settings.taxPercent = Math.min(Math.max(Number(b.taxPercent) || 0, 0), 50);
      if ('chargeAbsent' in b) db.settings.chargeAbsent = Boolean(b.chargeAbsent);
      if ('teacherPercent' in b) db.settings.teacherPercent = Math.min(Math.max(Number(b.teacherPercent) || 0, 0), 100);
      return { settings: db.settings };
    });
  },

  // ---------- Админ: ученики ----------
  'POST admin/student': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const name = str(b.name, 80);
      if (name.length < 2) fail(400, 'Укажите имя ученика');
      const data = {
        name, phone: str(b.phone, 30), parentName: str(b.parentName, 80), parentPhone: str(b.parentPhone, 30),
        subject: str(b.subject, 80), teacherId: db.teachers.some((t) => t.id === b.teacherId) ? b.teacherId : '',
        group: str(b.group, 40), tariffId: db.settings.tariffs.some((t) => t.id === b.tariffId) ? b.tariffId : '',
        note: str(b.note, 1000), active: b.active !== false,
      };
      let st = db.students.find((x) => x.id === b.id);
      if (st) Object.assign(st, data);
      else { st = { id: uid('st_'), createdAt: new Date().toISOString(), ...data }; db.students.push(st); }
      return { student: st };
    });
  },

  'DELETE admin/student': async (req, res, user, q) => mutate((db) => {
    const id = q.get('id');
    if (!db.students.some((s) => s.id === id)) fail(404, 'Ученик не найден');
    db.students = db.students.filter((s) => s.id !== id);
    db.payments = db.payments.filter((p) => p.studentId !== id);
    db.lessons.forEach((l) => {
      if (l.studentIds?.includes(id)) { l.studentIds = l.studentIds.filter((x) => x !== id); if (l.attendance) delete l.attendance[id]; }
    });
    return { ok: true };
  }),

  // ---------- Админ: оплаты ----------
  'POST admin/payment': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      if (!db.students.some((s) => s.id === b.studentId)) fail(400, 'Выберите ученика');
      const amount = money(b.amount);
      const lessons = Math.min(Math.max(parseInt(b.lessons, 10) || 0, 0), 500);
      if (!amount && !lessons) fail(400, 'Укажите сумму и количество занятий');
      const date = DATE.test(b.date) ? b.date : new Date().toISOString().slice(0, 10);
      const data = { studentId: b.studentId, amount, lessons, date, tariffId: str(b.tariffId, 40), method: str(b.method, 30), note: str(b.note, 300) };
      let p = db.payments.find((x) => x.id === b.id);
      if (p) Object.assign(p, data);
      else { p = { id: uid('pay_'), createdAt: new Date().toISOString(), ...data }; db.payments.push(p); }
      const st = db.students.find((s) => s.id === b.studentId);
      if (data.tariffId && db.settings.tariffs.some((t) => t.id === data.tariffId)) st.tariffId = data.tariffId;
      return { payment: p };
    });
  },

  'DELETE admin/payment': async (req, res, user, q) => mutate((db) => {
    db.payments = db.payments.filter((p) => p.id !== q.get('id'));
    return { ok: true };
  }),

  // ---------- Админ: расходы (аренда, реклама, выплаты учителям) ----------
  'POST admin/expense': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const amount = money(b.amount);
      if (!amount) fail(400, 'Укажите сумму');
      const category = EXPENSE_CATS.includes(b.category) ? b.category : 'other';
      const data = {
        amount, category, date: DATE.test(b.date) ? b.date : new Date().toISOString().slice(0, 10), note: str(b.note, 300),
        teacherId: category === 'salary' && db.teachers.some((t) => t.id === b.teacherId) ? b.teacherId : '',
      };
      if (category === 'salary' && !data.teacherId) fail(400, 'Выберите учителя');
      let ex = db.expenses.find((x) => x.id === b.id);
      if (ex) Object.assign(ex, data);
      else { ex = { id: uid('ex_'), createdAt: new Date().toISOString(), ...data }; db.expenses.push(ex); }
      return { expense: ex };
    });
  },

  'DELETE admin/expense': async (req, res, user, q) => mutate((db) => {
    db.expenses = db.expenses.filter((e) => e.id !== q.get('id'));
    return { ok: true };
  }),

  // ---------- Учитель ----------
  'POST teacher/lesson': async (req, res, user) => {
    const b = await body(req);
    return mutate((db) => {
      const l = db.lessons.find((x) => x.id === b.id);
      if (!l || (user.role === 'teacher' && l.teacherId !== user.id)) fail(404, 'Урок не найден');
      if (LESSON_STATUS.includes(b.status)) l.status = b.status;
      if ('note' in b) l.note = str(b.note, 1000);
      if (b.attendance) l.attendance = cleanAttendance(b.attendance, l.studentIds || []);
      l.markedAt = new Date().toISOString();
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
