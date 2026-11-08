// ===== Hawkins Portal: админ-панель и кабинет учителя =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAYS_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const LEAD_STATUS = { new: 'Новая', contacted: 'Связались', trial: 'Пробный урок', enrolled: 'Записан', lost: 'Отказ' };
const LESSON_STATUS = { planned: 'Запланирован', done: 'Проведён', canceled: 'Отменён' };
const DAY_START = 8, DAY_END = 22, HOUR_PX = 64;

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// ---------- Даты ----------
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const dayIdx = (d) => (d.getDay() + 6) % 7;
const human = (s) => { const d = parseDate(s); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const humanLong = (s) => { const d = parseDate(s); return `${DAYS_FULL[dayIdx(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const durH = (l) => (mins(l.end) - mins(l.start)) / 60;
const todayIso = () => isoDate(new Date());
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const fmtH = (h) => `${Math.round(h * 10) / 10} ч`;

// ---------- Состояние ----------
const S = {
  user: null, teachers: [], lessons: [], leads: [], settings: { rooms: [], courses: [] },
  week: mondayOf(new Date()), filter: 'all', view: localStorage.getItem('he_view') || 'week', day: todayIso(),
  leadFilter: 'all', leadQuery: '', navOpen: false,
};
const teacherById = (id) => S.teachers.find((t) => t.id === id);

// ---------- API ----------
async function api(path, opts = {}) {
  const res = await fetch(`/api/${path}`, {
    method: opts.method || 'GET', credentials: 'same-origin',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== 'login') { S.user = null; renderLogin(); throw new Error(data.error || 'Нужно войти'); }
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}
async function load() {
  const d = await api('state');
  Object.assign(S, { user: d.user, teachers: d.teachers, lessons: d.lessons, leads: d.leads, settings: d.settings });
}

// ---------- Тосты ----------
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${icon(type === 'ok' ? 'check' : 'x')}<span>${esc(msg)}</span>`;
  $('#toasts').append(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

// ---------- Модалка ----------
function modal(html, onMount) {
  const root = $('#modalRoot');
  const prev = document.activeElement;
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal__backdrop" data-close></div><div class="modal__panel">${html}</div></div>`;
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  const first = root.querySelector('input:not([type=hidden]),select,textarea,button:not([data-close])');
  setTimeout(() => first?.focus(), 30);
  onMount?.(root.querySelector('.modal__panel'), close);
  return close;
}
function confirmBox(text, okText = 'Удалить') {
  return new Promise((resolve) => {
    modal(`<div class="modal__head"><h2>Подтвердите</h2></div><p class="muted">${esc(text)}</p>
      <div class="modal__foot"><button class="btn btn--ghost" data-close>Отмена</button><button class="btn btn--danger" id="cOk">${esc(okText)}</button></div>`,
    (p, close) => {
      $('#cOk', p).onclick = () => { close(); resolve(true); };
      p.closest('.modal').querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => resolve(false)));
    });
  });
}

// ---------- Вход ----------
function renderLogin(err = '') {
  document.title = 'Вход — Hawkins Portal';
  app.innerHTML = `
  <main class="login">
    <div class="login__bg" aria-hidden="true"></div>
    <form class="login__card" id="loginForm" novalidate>
      <a href="/" class="brand"><img src="/assets/img/logo.svg" alt="" width="40" height="40"><span>HAWKINS<small>PORTAL</small></span></a>
      <h1>Вход в кабинет</h1>
      <p class="muted">Для администратора и преподавателей школы</p>
      <label class="field"><span>Логин</span><input name="login" autocomplete="username" required autocapitalize="none" spellcheck="false" placeholder="admin или логин учителя"></label>
      <label class="field"><span>Пароль / PIN</span><input name="password" type="password" autocomplete="current-password" required></label>
      <p class="form-error" role="alert">${esc(err)}</p>
      <button class="btn btn--primary btn--block btn--lg" type="submit">Войти</button>
      <a class="login__back" href="/">${icon('left')} На сайт школы</a>
    </form>
  </main>`;
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button');
    btn.disabled = true; btn.textContent = 'Входим…';
    try {
      await api('login', { method: 'POST', body: { login: f.login.value, password: f.password.value } });
      await load();
      location.hash = S.user.role === 'admin' ? '#/dashboard' : '#/my';
      route();
    } catch (x) {
      renderLogin(x.message);
    }
  });
}

// ---------- Каркас ----------
function shell(active, title, actions, body) {
  const admin = S.user.role === 'admin';
  const newLeads = S.leads.filter((l) => l.status === 'new').length;
  const links = admin
    ? [['dashboard', 'home', 'Обзор'], ['schedule', 'cal', 'Расписание'], ['teachers', 'users', 'Учителя'], ['leads', 'inbox', 'Заявки', newLeads], ['settings', 'gear', 'Настройки']]
    : [['my', 'home', 'Мой день'], ['my-schedule', 'cal', 'Расписание'], ['profile', 'user', 'Профиль']];
  const me = admin ? null : S.teachers[0];
  document.title = `${title} — Hawkins Portal`;
  app.innerHTML = `
  <div class="layout ${S.navOpen ? 'nav-open' : ''}">
    <aside class="side">
      <a href="/" class="brand"><img src="/assets/img/logo.svg" alt="" width="34" height="34"><span>HAWKINS<small>${admin ? 'ADMIN' : 'TEACHER'}</small></span></a>
      <nav class="side__nav" aria-label="Разделы">
        ${links.map(([id, ic, label, badge]) => `<a href="#/${id}" class="${active === id ? 'is-active' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${badge ? `<b class="badge">${badge}</b>` : ''}</a>`).join('')}
      </nav>
      <div class="side__user">
        <span class="avatar" style="--c:${me?.color || '#7c5cff'}">${esc(initials(S.user.name))}</span>
        <div><b>${esc(S.user.name)}</b><small>${admin ? 'Администратор' : esc(me?.subject || 'Преподаватель')}</small></div>
        <button class="icon-btn" id="logout" aria-label="Выйти" title="Выйти">${icon('out')}</button>
      </div>
    </aside>
    <div class="side-scrim" data-nav-close></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn topbar__menu" id="navToggle" aria-label="Меню">${icon('menu')}</button>
        <h1>${esc(title)}</h1>
        <div class="topbar__actions">${actions || ''}</div>
      </header>
      <div class="content">${body}</div>
    </div>
    <nav class="tabbar" aria-label="Разделы">
      ${links.map(([id, ic, label, badge]) => `<a href="#/${id}" class="${active === id ? 'is-active' : ''}">${icon(ic)}<span>${label}</span>${badge ? '<b class="dot"></b>' : ''}</a>`).join('')}
    </nav>
  </div>`;
  $('#logout').onclick = async () => { await api('logout', { method: 'POST' }).catch(() => {}); S.user = null; location.hash = ''; renderLogin(); };
  $('#navToggle').onclick = () => { S.navOpen = !S.navOpen; $('.layout').classList.toggle('nav-open', S.navOpen); };
  $$('[data-nav-close], .side__nav a').forEach((el) => el.addEventListener('click', () => { S.navOpen = false; $('.layout').classList.remove('nav-open'); }));
}
const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// ---------- Общие куски ----------
function weekNav() {
  const end = addDays(S.week, 6);
  const label = `${S.week.getDate()} ${MONTHS[S.week.getMonth()]} — ${end.getDate()} ${MONTHS[end.getMonth()]}`;
  return `<div class="weeknav">
    <button class="icon-btn" data-week="-1" aria-label="Предыдущая неделя">${icon('left')}</button>
    <button class="btn btn--ghost btn--sm" data-week="0">Сегодня</button>
    <button class="icon-btn" data-week="1" aria-label="Следующая неделя">${icon('right')}</button>
    <span class="weeknav__label">${label}</span>
  </div>`;
}
function bindWeekNav(rerender) {
  $$('[data-week]').forEach((b) => b.addEventListener('click', () => {
    const v = +b.dataset.week;
    S.week = v === 0 ? mondayOf(new Date()) : addDays(S.week, v * 7);
    if (v === 0) S.day = todayIso();
    else S.day = isoDate(addDays(parseDate(S.day), v * 7));
    rerender();
  }));
}
const lessonsOn = (date, list = S.lessons) => list.filter((l) => l.date === date).sort((a, b) => a.start.localeCompare(b.start));
const weekDates = () => Array.from({ length: 7 }, (_, i) => isoDate(addDays(S.week, i)));
const active = (l) => l.status !== 'canceled';

function lessonChip(l, { showTeacher = true, clickable = true } = {}) {
  const t = teacherById(l.teacherId);
  const now = l.date === todayIso() && mins(l.start) <= nowMin() && nowMin() < mins(l.end);
  return `<button type="button" class="lchip st-${l.status} ${now ? 'is-now' : ''}" style="--c:${t?.color || '#7c5cff'}" ${clickable ? `data-lesson="${l.id}"` : 'disabled'}>
    <span class="lchip__time">${l.start}–${l.end}${now ? ' · <b>идёт</b>' : ''}</span>
    <span class="lchip__title">${esc(l.title)}</span>
    <span class="lchip__meta">${showTeacher && t ? `${esc(t.name)} · ` : ''}${esc(l.group || '')}${l.room ? ` · ${esc(l.room)}` : ''}</span>
  </button>`;
}

// Недельная сетка
function weekGrid(list, { showTeacher = true, editable = true } = {}) {
  const dates = weekDates();
  const today = todayIso();
  const hours = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);
  const nowTop = ((nowMin() - DAY_START * 60) / 60) * HOUR_PX;
  return `<div class="grid-wrap"><div class="wgrid" style="--hour:${HOUR_PX}px;--hours:${hours.length}">
    <div class="wgrid__corner"></div>
    ${dates.map((d, i) => `<div class="wgrid__day ${d === today ? 'is-today' : ''}"><span>${DAYS[i]}</span><b>${parseDate(d).getDate()}</b></div>`).join('')}
    <div class="wgrid__hours">${hours.map((h) => `<span>${pad(h)}:00</span>`).join('')}</div>
    ${dates.map((d) => `<div class="wgrid__col ${d === today ? 'is-today' : ''}" data-date="${d}">
      ${editable ? hours.map((h) => `<button type="button" class="slot" data-slot="${d}|${pad(h)}:00" aria-label="Добавить урок ${human(d)} в ${pad(h)}:00"></button>`).join('') : ''}
      ${d === today && nowTop > 0 && nowTop < hours.length * HOUR_PX ? `<div class="nowline" style="top:${nowTop}px"></div>` : ''}
      ${layoutDay(lessonsOn(d, list)).map(({ l, col, cols }) => {
        const top = ((mins(l.start) - DAY_START * 60) / 60) * HOUR_PX;
        const h = Math.max(((mins(l.end) - mins(l.start)) / 60) * HOUR_PX - 3, 22);
        return `<div class="ev" style="top:${top}px;height:${h}px;left:calc(${(col / cols) * 100}% + 3px);width:calc(${100 / cols}% - 6px)">${lessonChip(l, { showTeacher })}</div>`;
      }).join('')}
    </div>`).join('')}
  </div></div>`;
}
// Раскладка пересекающихся уроков в колонки
function layoutDay(ls) {
  const out = [];
  let group = [], groupEnd = -1;
  const flush = () => {
    const colsEnd = [];
    const placed = group.map((l) => {
      let c = colsEnd.findIndex((e) => e <= mins(l.start));
      if (c === -1) { c = colsEnd.length; colsEnd.push(0); }
      colsEnd[c] = mins(l.end);
      return { l, col: c };
    });
    placed.forEach((p) => out.push({ ...p, cols: colsEnd.length }));
    group = []; groupEnd = -1;
  };
  for (const l of ls) {
    if (group.length && mins(l.start) >= groupEnd) flush();
    group.push(l); groupEnd = Math.max(groupEnd, mins(l.end));
  }
  if (group.length) flush();
  return out;
}

// День по учителям (колонки = учителя)
function dayByTeacher(list) {
  const teachers = S.teachers.filter((t) => t.active !== false && (S.filter === 'all' || t.id === S.filter));
  const hours = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);
  const isToday = S.day === todayIso();
  const nowTop = ((nowMin() - DAY_START * 60) / 60) * HOUR_PX;
  const dates = weekDates();
  return `<div class="daytabs" role="tablist">${dates.map((d, i) => `<button role="tab" aria-selected="${d === S.day}" class="${d === S.day ? 'is-active' : ''}" data-day="${d}"><span>${DAYS[i]}</span><b>${parseDate(d).getDate()}</b></button>`).join('')}</div>
  <div class="grid-wrap"><div class="wgrid wgrid--teachers" style="--hour:${HOUR_PX}px;--hours:${hours.length};--cols:${teachers.length || 1}">
    <div class="wgrid__corner"></div>
    ${teachers.map((t) => `<div class="wgrid__day wgrid__teacher"><span class="avatar avatar--sm" style="--c:${t.color}">${esc(initials(t.name))}</span><b>${esc(t.name.split(' ')[0])}</b></div>`).join('') || '<div class="wgrid__day">Нет учителей</div>'}
    <div class="wgrid__hours">${hours.map((h) => `<span>${pad(h)}:00</span>`).join('')}</div>
    ${teachers.map((t) => `<div class="wgrid__col" data-teacher="${t.id}">
      ${hours.map((h) => `<button type="button" class="slot" data-slot="${S.day}|${pad(h)}:00|${t.id}" aria-label="Добавить урок ${esc(t.name)} в ${pad(h)}:00"></button>`).join('')}
      ${isToday && nowTop > 0 ? `<div class="nowline" style="top:${nowTop}px"></div>` : ''}
      ${layoutDay(lessonsOn(S.day, list).filter((l) => l.teacherId === t.id)).map(({ l, col, cols }) => {
        const top = ((mins(l.start) - DAY_START * 60) / 60) * HOUR_PX;
        const h = Math.max(((mins(l.end) - mins(l.start)) / 60) * HOUR_PX - 3, 22);
        return `<div class="ev" style="top:${top}px;height:${h}px;left:calc(${(col / cols) * 100}% + 3px);width:calc(${100 / cols}% - 6px)">${lessonChip(l, { showTeacher: false })}</div>`;
      }).join('')}
    </div>`).join('')}
  </div></div>`;
}

// Список (для телефона и «агенды»)
function agenda(list, { showTeacher = true } = {}) {
  const dates = weekDates();
  return `<div class="agenda">${dates.map((d) => {
    const ls = lessonsOn(d, list);
    return `<section class="agenda__day ${d === todayIso() ? 'is-today' : ''}"><h3>${humanLong(d)}${d === todayIso() ? ' <em>сегодня</em>' : ''}</h3>
      ${ls.length ? ls.map((l) => lessonChip(l, { showTeacher })).join('') : '<p class="muted small">Нет уроков</p>'}</section>`;
  }).join('')}</div>`;
}

// ================= АДМИН =================
function viewDashboard() {
  const today = todayIso();
  const todays = lessonsOn(today).filter(active);
  const wk = weekDates();
  const weekLessons = S.lessons.filter((l) => wk.includes(l.date) && active(l));
  const newLeads = S.leads.filter((l) => l.status === 'new');
  const hoursWeek = weekLessons.reduce((s, l) => s + durH(l), 0);
  const nowM = nowMin();
  const live = todays.filter((l) => mins(l.start) <= nowM && nowM < mins(l.end));
  const load = S.teachers.map((t) => ({ t, h: weekLessons.filter((l) => l.teacherId === t.id).reduce((s, l) => s + durH(l), 0) })).sort((a, b) => b.h - a.h);
  const maxH = Math.max(1, ...load.map((x) => x.h));

  shell('dashboard', 'Обзор', `<button class="btn btn--primary" id="addLesson">${icon('plus')}<span>Урок</span></button>`, `
    <p class="hello">${greet()}, ${esc(S.user.name.split(' ')[0])}. Сегодня ${humanLong(today).toLowerCase()}.</p>
    <div class="kpis">
      <div class="kpi"><span>Уроков сегодня</span><b>${todays.length}</b><small>${live.length ? `${live.length} идёт сейчас` : 'сейчас занятий нет'}</small></div>
      <div class="kpi"><span>Уроков на неделе</span><b>${weekLessons.length}</b><small>${fmtH(hoursWeek)} преподавания</small></div>
      <div class="kpi"><span>Учителей</span><b>${S.teachers.filter((t) => t.active !== false).length}</b><small>активных</small></div>
      <a class="kpi kpi--accent" href="#/leads"><span>Новые заявки</span><b>${newLeads.length}</b><small>${newLeads.length ? 'нужно обработать →' : 'всё обработано'}</small></a>
    </div>
    <div class="cols">
      <section class="panel">
        <div class="panel__head"><h2>Сегодня по учителям</h2><a href="#/schedule" class="link" id="toDay">Открыть расписание</a></div>
        ${S.teachers.filter((t) => t.active !== false).map((t) => {
          const ls = todays.filter((l) => l.teacherId === t.id);
          return `<div class="trow"><div class="trow__who"><span class="avatar avatar--sm" style="--c:${t.color}">${esc(initials(t.name))}</span><div><b>${esc(t.name)}</b><small>${esc(t.subject)}</small></div></div>
            <div class="trow__lessons">${ls.length ? ls.map((l) => lessonChip(l, { showTeacher: false })).join('') : '<span class="muted small">Свободен</span>'}</div></div>`;
        }).join('') || empty('Добавьте учителей', '#/teachers', 'Учителя')}
      </section>
      <section class="panel">
        <div class="panel__head"><h2>Нагрузка за неделю</h2></div>
        <div class="bars">${load.map(({ t, h }) => `<div class="bar"><span class="bar__name">${esc(t.name)}</span><span class="bar__track"><i style="width:${(h / maxH) * 100}%;background:${t.color}"></i></span><b>${fmtH(h)}</b></div>`).join('') || '<p class="muted">Нет данных</p>'}</div>
        <div class="panel__head mt"><h2>Последние заявки</h2><a href="#/leads" class="link">Все</a></div>
        <div class="mini-leads">${S.leads.slice(0, 5).map((l) => `<div class="mini-lead"><div><b>${esc(l.name)}</b><small>${esc(l.course || 'Без направления')} · ${timeAgo(l.createdAt)}</small></div><span class="tag tag--${l.status}">${LEAD_STATUS[l.status]}</span></div>`).join('') || '<p class="muted">Пока нет заявок</p>'}</div>
      </section>
    </div>`);
  $('#addLesson').onclick = () => lessonModal({ date: today });
  $('#toDay').onclick = () => { S.view = 'day'; S.day = today; S.week = mondayOf(new Date()); };
  bindLessonClicks();
}
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };
const empty = (text, href, cta) => `<div class="empty"><p>${esc(text)}</p>${href ? `<a class="btn btn--ghost btn--sm" href="${href}">${esc(cta)}</a>` : ''}</div>`;
function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function viewSchedule() {
  const list = S.lessons.filter((l) => S.filter === 'all' || l.teacherId === S.filter);
  const mobile = innerWidth < 760;
  const view = mobile && S.view !== 'list' ? 'list' : S.view;
  shell('schedule', 'Расписание', `<button class="btn btn--primary" id="addLesson">${icon('plus')}<span>Урок</span></button>`, `
    <div class="toolbar">
      ${weekNav()}
      <div class="seg" role="tablist" aria-label="Вид">
        ${[['week', 'Неделя'], ['day', 'День по учителям'], ['list', 'Список']].map(([v, n]) => `<button role="tab" aria-selected="${view === v}" class="${view === v ? 'is-active' : ''}" data-view="${v}" ${mobile && v !== 'list' ? 'hidden' : ''}>${n}</button>`).join('')}
      </div>
    </div>
    <div class="filters" role="group" aria-label="Фильтр по учителю">
      <button class="fchip ${S.filter === 'all' ? 'is-active' : ''}" data-filter="all">Все учителя</button>
      ${S.teachers.map((t) => `<button class="fchip ${S.filter === t.id ? 'is-active' : ''}" data-filter="${t.id}" style="--c:${t.color}"><i></i>${esc(t.name)}</button>`).join('')}
    </div>
    <p class="legend muted small"><span class="lg lg--planned"></span>Запланирован <span class="lg lg--done"></span>Проведён <span class="lg lg--canceled"></span>Отменён · Нажмите на пустое время, чтобы добавить урок</p>
    ${view === 'week' ? weekGrid(list) : view === 'day' ? dayByTeacher(S.lessons) : agenda(list)}
  `);
  $('#addLesson').onclick = () => lessonModal({ date: view === 'day' ? S.day : todayIso(), teacherId: S.filter !== 'all' ? S.filter : '' });
  bindWeekNav(viewSchedule);
  $$('[data-view]').forEach((b) => b.onclick = () => { S.view = b.dataset.view; localStorage.setItem('he_view', S.view); viewSchedule(); });
  $$('[data-filter]').forEach((b) => b.onclick = () => { S.filter = b.dataset.filter; viewSchedule(); });
  $$('[data-day]').forEach((b) => b.onclick = () => { S.day = b.dataset.day; viewSchedule(); });
  $$('[data-slot]').forEach((b) => b.onclick = () => {
    const [date, start, teacherId] = b.dataset.slot.split('|');
    lessonModal({ date, start, end: `${pad(+start.slice(0, 2) + 1)}:${start.slice(3)}`, teacherId: teacherId || (S.filter !== 'all' ? S.filter : '') });
  });
  bindLessonClicks();
  scrollGridToMorning();
}
function scrollGridToMorning() {
  const w = $('.grid-wrap');
  if (w) w.scrollTop = HOUR_PX * 5; // к 13:00
}
function bindLessonClicks() {
  $$('[data-lesson]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const l = S.lessons.find((x) => x.id === b.dataset.lesson);
    if (!l) return;
    if (S.user.role === 'admin') lessonModal(l); else teacherLessonModal(l);
  }));
}

function lessonModal(l = {}) {
  const isNew = !l.id;
  const opts = (arr, cur) => arr.map((v) => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const rooms = [...new Set([...(S.settings.rooms || []), ...(l.room ? [l.room] : [])])];
  const courses = S.settings.courses || [];
  modal(`
    <form id="lf" novalidate>
      <div class="modal__head"><h2>${isNew ? 'Новый урок' : 'Урок'}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
      <div class="form-grid">
        <label class="field span2"><span>Учитель</span><select name="teacherId" required><option value="">— выберите —</option>${S.teachers.map((t) => `<option value="${t.id}" ${t.id === l.teacherId ? 'selected' : ''}>${esc(t.name)} · ${esc(t.subject)}</option>`).join('')}</select></label>
        <label class="field span2"><span>Название / предмет</span><input name="title" list="courseList" value="${esc(l.title || '')}" required placeholder="Например: IELTS Intensive"><datalist id="courseList">${courses.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="field"><span>Группа / ученик</span><input name="group" value="${esc(l.group || '')}" placeholder="IELTS-7"></label>
        <label class="field"><span>Кабинет</span><select name="room"><option value="">—</option>${opts(rooms, l.room)}</select></label>
        <label class="field"><span>Дата</span><input name="date" type="date" value="${esc(l.date || todayIso())}" required></label>
        <div class="field-row">
          <label class="field"><span>Начало</span><input name="start" type="time" step="300" value="${esc(l.start || '15:00')}" required></label>
          <label class="field"><span>Конец</span><input name="end" type="time" step="300" value="${esc(l.end || '16:00')}" required></label>
        </div>
        ${isNew ? `<label class="field span2"><span>Повторять каждую неделю</span><select name="repeatWeeks">
          <option value="1">Не повторять (разовый урок)</option><option value="4">4 недели</option><option value="8">8 недель</option><option value="12">12 недель (≈ 3 месяца)</option><option value="16">16 недель</option><option value="36">36 недель (учебный год)</option></select></label>` : `
          <label class="field"><span>Статус</span><select name="status">${Object.entries(LESSON_STATUS).map(([k, v]) => `<option value="${k}" ${k === l.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          ${l.seriesId ? `<fieldset class="field scope"><span>Применить к</span><label><input type="radio" name="scope" value="one" checked> только этому</label><label><input type="radio" name="scope" value="series"> этому и следующим</label></fieldset>` : '<div></div>'}`}
        <label class="field span2"><span>Заметка</span><textarea name="note" rows="2" placeholder="Тема, домашнее задание, комментарий">${esc(l.note || '')}</textarea></label>
      </div>
      <div class="conflict" hidden></div>
      <p class="form-error" role="alert"></p>
      <div class="modal__foot">
        ${isNew ? '' : `<button type="button" class="btn btn--danger-ghost" id="del">${icon('trash')}<span>Удалить</span></button>`}
        <span class="grow"></span>
        <button type="button" class="btn btn--ghost" data-close>Отмена</button>
        <button type="submit" class="btn btn--primary">${isNew ? 'Добавить' : 'Сохранить'}</button>
      </div>
    </form>`, (p, close) => {
    const f = $('#lf', p);
    let force = false;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f));
      const err = $('.form-error', p); err.textContent = '';
      const btn = f.querySelector('[type=submit]'); btn.disabled = true;
      try {
        const r = await api('admin/lesson', { method: 'POST', body: { lesson: { ...fd, id: l.id }, repeatWeeks: fd.repeatWeeks, scope: fd.scope, force } });
        if (r.conflict) {
          const c = $('.conflict', p);
          c.hidden = false;
          c.innerHTML = `<b>Пересечение в расписании</b>${r.conflict.map((x) => `<span>${human(x.date)} ${x.start}–${x.end} · ${esc(teacherById(x.teacherId)?.name || '')} · ${esc(x.title)}${x.room ? ` · ${esc(x.room)}` : ''}</span>`).join('')}<small>Нажмите «Сохранить всё равно», если это нормально.</small>`;
          force = true; btn.textContent = 'Сохранить всё равно'; btn.disabled = false;
          return;
        }
        await load(); close(); route();
        toast(isNew ? (r.created > 1 ? `Добавлено уроков: ${r.created}` : 'Урок добавлен') : 'Сохранено');
      } catch (x) { err.textContent = x.message; btn.disabled = false; }
    });
    ['teacherId', 'date', 'start', 'end', 'room'].forEach((n) => f[n]?.addEventListener('change', () => { force = false; $('.conflict', p).hidden = true; f.querySelector('[type=submit]').textContent = isNew ? 'Добавить' : 'Сохранить'; }));
    $('#del', p)?.addEventListener('click', async () => {
      const scope = f.scope?.value || 'one';
      close();
      if (!(await confirmBox(scope === 'series' ? 'Удалить этот урок и все следующие в серии?' : 'Удалить этот урок?'))) return;
      try { await api(`admin/lesson?id=${l.id}&scope=${scope}`, { method: 'DELETE' }); await load(); route(); toast('Удалено'); } catch (x) { toast(x.message, 'err'); }
    });
  });
}

function viewTeachers() {
  const wk = weekDates();
  shell('teachers', 'Учителя', `<button class="btn btn--primary" id="addT">${icon('plus')}<span>Учитель</span></button>`, `
    <div class="tcards">${S.teachers.map((t) => {
      const ls = S.lessons.filter((l) => l.teacherId === t.id && wk.includes(l.date) && active(l));
      const next = S.lessons.filter((l) => l.teacherId === t.id && active(l) && (l.date > todayIso() || (l.date === todayIso() && mins(l.end) > nowMin()))).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
      return `<article class="tcard ${t.active === false ? 'is-off' : ''}" style="--c:${t.color}">
        <div class="tcard__top"><span class="avatar avatar--lg" style="--c:${t.color}">${esc(initials(t.name))}</span>
          <div><h3>${esc(t.name)}</h3><p>${esc(t.subject || '—')}</p></div></div>
        <dl class="tcard__stats"><div><dt>На неделе</dt><dd>${ls.length} ур.</dd></div><div><dt>Часов</dt><dd>${fmtH(ls.reduce((s, l) => s + durH(l), 0))}</dd></div><div><dt>Логин</dt><dd class="mono">${esc(t.login)}</dd></div></dl>
        <p class="tcard__next">${icon('clock')}${next ? `Следующий: ${human(next.date)}, ${next.start} · ${esc(next.title)}` : 'Нет ближайших уроков'}</p>
        <div class="tcard__actions">
          <button class="btn btn--ghost btn--sm" data-sched="${t.id}">${icon('cal')}<span>Расписание</span></button>
          <button class="btn btn--ghost btn--sm" data-edit="${t.id}">${icon('edit')}<span>Изменить</span></button>
          ${t.phone ? `<a class="icon-btn" href="tel:${esc(t.phone.replace(/[^\d+]/g, ''))}" aria-label="Позвонить">${icon('phone')}</a>` : ''}
        </div>
      </article>`;
    }).join('') || empty('Пока нет учителей. Добавьте первого.')}</div>`);
  $('#addT').onclick = () => teacherModal();
  $$('[data-edit]').forEach((b) => b.onclick = () => teacherModal(teacherById(b.dataset.edit)));
  $$('[data-sched]').forEach((b) => b.onclick = () => { S.filter = b.dataset.sched; S.view = innerWidth < 760 ? 'list' : 'week'; location.hash = '#/schedule'; });
}

const PALETTE = ['#8B5CF6', '#22D3EE', '#F472B6', '#A3E635', '#FB923C', '#FACC15', '#60A5FA', '#34D399', '#F87171', '#C084FC'];
function teacherModal(t = {}) {
  const isNew = !t.id;
  const color = t.color || PALETTE[S.teachers.length % PALETTE.length];
  modal(`
    <form id="tf" novalidate>
      <div class="modal__head"><h2>${isNew ? 'Новый учитель' : 'Учитель'}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
      <div class="form-grid">
        <label class="field span2"><span>Имя и фамилия</span><input name="name" value="${esc(t.name || '')}" required></label>
        <label class="field span2"><span>Предмет / специализация</span><input name="subject" value="${esc(t.subject || '')}" placeholder="English · IELTS"></label>
        <label class="field"><span>Телефон</span><input name="phone" type="tel" value="${esc(t.phone || '')}" placeholder="+7 …"></label>
        <label class="field"><span>Логин для входа</span><input name="login" value="${esc(t.login || '')}" required autocapitalize="none" spellcheck="false" placeholder="aigerim"></label>
        <label class="field span2"><span>${isNew ? 'PIN / пароль для входа' : 'Новый PIN / пароль (оставьте пустым, чтобы не менять)'}</span><input name="pin" type="text" autocomplete="new-password" ${isNew ? 'required' : ''} minlength="4" placeholder="минимум 4 символа"></label>
        <fieldset class="field span2"><span>Цвет в расписании</span><div class="swatches">${PALETTE.map((c) => `<label><input type="radio" name="color" value="${c}" ${c.toLowerCase() === color.toLowerCase() ? 'checked' : ''}><i style="background:${c}"></i></label>`).join('')}</div></fieldset>
        ${isNew ? '' : `<label class="check span2"><input type="checkbox" name="active" ${t.active !== false ? 'checked' : ''}> Активен (может входить, показывается в расписании)</label>`}
      </div>
      <p class="form-error" role="alert"></p>
      <div class="modal__foot">
        ${isNew ? '' : `<button type="button" class="btn btn--danger-ghost" id="del">${icon('trash')}<span>Удалить</span></button>`}
        <span class="grow"></span>
        <button type="button" class="btn btn--ghost" data-close>Отмена</button>
        <button type="submit" class="btn btn--primary">${isNew ? 'Добавить' : 'Сохранить'}</button>
      </div>
    </form>`, (p, close) => {
    const f = $('#tf', p);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f));
      const err = $('.form-error', p);
      try {
        await api('admin/teacher', { method: 'POST', body: { ...fd, id: t.id, active: isNew ? true : f.active.checked } });
        await load(); close(); route();
        toast(isNew ? `Учитель добавлен. Логин: ${fd.login}` : 'Сохранено');
      } catch (x) { err.textContent = x.message; }
    });
    $('#del', p)?.addEventListener('click', async () => {
      close();
      const n = S.lessons.filter((l) => l.teacherId === t.id).length;
      if (!(await confirmBox(`Удалить ${t.name}? Вместе с ним удалятся все его уроки (${n}). Если учитель просто ушёл в отпуск — лучше снимите галочку «Активен».`))) return;
      try { await api(`admin/teacher?id=${t.id}`, { method: 'DELETE' }); await load(); route(); toast('Учитель удалён'); } catch (x) { toast(x.message, 'err'); }
    });
  });
}

function viewLeads() {
  const q = S.leadQuery.toLowerCase();
  const list = S.leads.filter((l) => (S.leadFilter === 'all' || l.status === S.leadFilter) && (!q || `${l.name} ${l.phone} ${l.course} ${l.comment}`.toLowerCase().includes(q)));
  const counts = Object.fromEntries(Object.keys(LEAD_STATUS).map((k) => [k, S.leads.filter((l) => l.status === k).length]));
  const conv = S.leads.length ? Math.round((counts.enrolled / S.leads.length) * 100) : 0;
  shell('leads', 'Заявки', `<button class="btn btn--primary" id="addLead">${icon('plus')}<span>Заявка</span></button>`, `
    <div class="funnel">${Object.entries(LEAD_STATUS).map(([k, v]) => `<button class="funnel__step ${S.leadFilter === k ? 'is-active' : ''}" data-lf="${k}"><span>${v}</span><b>${counts[k]}</b></button>`).join('')}
      <div class="funnel__conv"><span>Конверсия в запись</span><b>${conv}%</b></div></div>
    <div class="toolbar">
      <div class="search">${icon('search')}<input id="lq" type="search" placeholder="Поиск по имени, телефону…" value="${esc(S.leadQuery)}" aria-label="Поиск заявок"></div>
      <button class="fchip ${S.leadFilter === 'all' ? 'is-active' : ''}" data-lf="all">Все (${S.leads.length})</button>
    </div>
    <div class="leads">${list.map((l) => {
      const digits = String(l.phone).replace(/\D/g, '');
      return `<article class="lead">
        <div class="lead__main"><b>${esc(l.name)}</b><a href="tel:+${digits}" class="mono">${esc(l.phone)}</a>
          <small>${esc(l.course || 'Направление не выбрано')} · ${timeAgo(l.createdAt)} · ${esc(l.source || '')}</small>
          ${l.comment ? `<p>${esc(l.comment)}</p>` : ''}${l.note ? `<p class="lead__note">${icon('edit')} ${esc(l.note)}</p>` : ''}</div>
        <div class="lead__side">
          <select data-ls="${l.id}" class="tag-select tag--${l.status}" aria-label="Статус заявки">${Object.entries(LEAD_STATUS).map(([k, v]) => `<option value="${k}" ${k === l.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <div class="lead__btns">
            <a class="icon-btn" href="tel:+${digits}" aria-label="Позвонить">${icon('phone')}</a>
            <a class="icon-btn icon-btn--wa" href="https://wa.me/${digits}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('chat')}</a>
            <button class="icon-btn" data-le="${l.id}" aria-label="Изменить">${icon('edit')}</button>
          </div>
        </div>
      </article>`;
    }).join('') || empty(S.leads.length ? 'Ничего не найдено' : 'Заявок пока нет. Они появятся здесь, когда кто-то оставит контакты на сайте.')}</div>`);
  $$('[data-lf]').forEach((b) => b.onclick = () => { S.leadFilter = S.leadFilter === b.dataset.lf ? 'all' : b.dataset.lf; viewLeads(); });
  const lq = $('#lq');
  lq.oninput = () => { S.leadQuery = lq.value; clearTimeout(lq._t); lq._t = setTimeout(() => { viewLeads(); const n = $('#lq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
  $$('[data-ls]').forEach((s) => s.onchange = async () => {
    try { await api('admin/lead', { method: 'POST', body: { id: s.dataset.ls, status: s.value } }); await load(); viewLeads(); toast('Статус обновлён'); } catch (x) { toast(x.message, 'err'); }
  });
  $$('[data-le]').forEach((b) => b.onclick = () => leadModal(S.leads.find((l) => l.id === b.dataset.le)));
  $('#addLead').onclick = () => leadModal();
}

function leadModal(l = {}) {
  const isNew = !l.id;
  modal(`
    <form id="ldf" novalidate>
      <div class="modal__head"><h2>${isNew ? 'Новая заявка' : 'Заявка'}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
      <div class="form-grid">
        <label class="field"><span>Имя</span><input name="name" value="${esc(l.name || '')}" required></label>
        <label class="field"><span>Телефон</span><input name="phone" type="tel" value="${esc(l.phone || '')}"></label>
        <label class="field"><span>Направление</span><input name="course" list="cl" value="${esc(l.course || '')}"><datalist id="cl">${(S.settings.courses || []).map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="field"><span>Статус</span><select name="status">${Object.entries(LEAD_STATUS).map(([k, v]) => `<option value="${k}" ${k === (l.status || 'new') ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="field span2"><span>Комментарий клиента</span><textarea name="comment" rows="2">${esc(l.comment || '')}</textarea></label>
        <label class="field span2"><span>Заметка менеджера</span><textarea name="note" rows="2" placeholder="Договорились на пробный в субботу 11:00…">${esc(l.note || '')}</textarea></label>
      </div>
      <p class="form-error" role="alert"></p>
      <div class="modal__foot">
        ${isNew ? '' : `<button type="button" class="btn btn--danger-ghost" id="del">${icon('trash')}<span>Удалить</span></button>`}
        <span class="grow"></span>
        <button type="button" class="btn btn--ghost" data-close>Отмена</button>
        <button type="submit" class="btn btn--primary">Сохранить</button>
      </div>
    </form>`, (p, close) => {
    $('#ldf', p).addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      try { await api('admin/lead', { method: 'POST', body: { ...fd, id: l.id } }); await load(); close(); route(); toast('Сохранено'); } catch (x) { $('.form-error', p).textContent = x.message; }
    });
    $('#del', p)?.addEventListener('click', async () => {
      close();
      if (!(await confirmBox(`Удалить заявку «${l.name}»?`))) return;
      try { await api(`admin/lead?id=${l.id}`, { method: 'DELETE' }); await load(); route(); toast('Удалено'); } catch (x) { toast(x.message, 'err'); }
    });
  });
}

function viewSettings() {
  const tagEditor = (key, title, hint) => `<section class="panel"><div class="panel__head"><h2>${title}</h2></div><p class="muted small">${hint}</p>
    <div class="tags" data-key="${key}">${(S.settings[key] || []).map((v, i) => `<span class="tagx">${esc(v)}<button data-rm="${key}|${i}" aria-label="Удалить ${esc(v)}">${icon('x')}</button></span>`).join('')}</div>
    <form class="tag-add" data-add="${key}"><input placeholder="Добавить…" aria-label="Добавить: ${title}"><button class="btn btn--ghost btn--sm" type="submit">${icon('plus')}<span>Добавить</span></button></form></section>`;
  shell('settings', 'Настройки', '', `
    <div class="cols">
      ${tagEditor('rooms', 'Кабинеты', 'Используются в расписании и для проверки пересечений по кабинетам.')}
      ${tagEditor('courses', 'Направления', 'Подсказки при создании уроков и заявок.')}
    </div>
    <section class="panel mt">
      <div class="panel__head"><h2>Как войти учителю</h2></div>
      <ol class="howto">
        <li>Добавьте учителя в разделе «Учителя» и задайте ему логин и PIN.</li>
        <li>Отправьте ему ссылку <b class="mono">${esc(location.origin)}/portal</b>, логин и PIN.</li>
        <li>Учитель видит только свои уроки, может отмечать их проведёнными и оставлять заметки.</li>
      </ol>
      <p class="muted small">Пароль администратора задаётся в переменной окружения <span class="mono">ADMIN_PASSWORD</span> в настройках проекта Vercel.</p>
    </section>`);
  const save = async (key, list) => {
    try { await api('admin/settings', { method: 'POST', body: { [key]: list } }); await load(); viewSettings(); toast('Сохранено'); } catch (x) { toast(x.message, 'err'); }
  };
  $$('[data-rm]').forEach((b) => b.onclick = () => { const [k, i] = b.dataset.rm.split('|'); const list = [...S.settings[k]]; list.splice(+i, 1); save(k, list); });
  $$('[data-add]').forEach((f) => f.onsubmit = (e) => { e.preventDefault(); const v = f.querySelector('input').value.trim(); if (v) save(f.dataset.add, [...(S.settings[f.dataset.add] || []), v]); });
}

// ================= УЧИТЕЛЬ =================
function viewMy() {
  const me = S.teachers[0];
  const today = todayIso();
  const todays = lessonsOn(today);
  const nowM = nowMin();
  const upcoming = S.lessons.filter((l) => l.date > today && active(l)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 8);
  const wk = weekDates();
  const weekL = S.lessons.filter((l) => wk.includes(l.date) && active(l));
  const month = today.slice(0, 7);
  const monthDone = S.lessons.filter((l) => l.date.startsWith(month) && l.status === 'done');
  const next = todays.find((l) => active(l) && mins(l.end) > nowM);
  shell('my', 'Мой день', '', `
    <p class="hello">${greet()}, ${esc(me.name.split(' ')[0])}! ${todays.filter(active).length ? `Сегодня у вас ${todays.filter(active).length} ${plural(todays.filter(active).length, 'урок', 'урока', 'уроков')}.` : 'Сегодня уроков нет — хорошего отдыха.'}</p>
    ${next ? `<div class="next" style="--c:${me.color}"><span class="next__label">${mins(next.start) <= nowM ? 'Идёт сейчас' : `Следующий урок через ${untilText(mins(next.start) - nowM)}`}</span>
      <h2>${esc(next.title)}</h2><p>${next.start}–${next.end}${next.group ? ` · ${esc(next.group)}` : ''}${next.room ? ` · кабинет ${esc(next.room)}` : ''}</p></div>` : ''}
    <div class="kpis kpis--3">
      <div class="kpi"><span>Сегодня</span><b>${todays.filter(active).length}</b><small>${fmtH(todays.filter(active).reduce((s, l) => s + durH(l), 0))}</small></div>
      <div class="kpi"><span>На этой неделе</span><b>${weekL.length}</b><small>${fmtH(weekL.reduce((s, l) => s + durH(l), 0))}</small></div>
      <div class="kpi"><span>Проведено в этом месяце</span><b>${monthDone.length}</b><small>${fmtH(monthDone.reduce((s, l) => s + durH(l), 0))}</small></div>
    </div>
    <div class="cols">
      <section class="panel"><div class="panel__head"><h2>Уроки сегодня</h2></div>
        <div class="tlist">${todays.map((l) => teacherLessonCard(l)).join('') || '<p class="muted">Нет уроков на сегодня</p>'}</div></section>
      <section class="panel"><div class="panel__head"><h2>Ближайшие</h2><a class="link" href="#/my-schedule">Всё расписание</a></div>
        <div class="upl">${upcoming.map((l) => `<button class="upl__row" data-lesson="${l.id}"><span class="upl__date"><b>${parseDate(l.date).getDate()}</b>${DAYS[dayIdx(parseDate(l.date))]}</span><span><b>${esc(l.title)}</b><small>${l.start}–${l.end}${l.group ? ` · ${esc(l.group)}` : ''}${l.room ? ` · ${esc(l.room)}` : ''}</small></span></button>`).join('') || '<p class="muted">Нет запланированных уроков</p>'}</div></section>
    </div>`);
  bindTeacherCards();
  bindLessonClicks();
}
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const untilText = (m) => (m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч ${m % 60 ? `${m % 60} мин` : ''}`);

function teacherLessonCard(l) {
  return `<article class="tl st-${l.status}" data-id="${l.id}">
    <div class="tl__time"><b>${l.start}</b><small>${l.end}</small></div>
    <div class="tl__body"><h3>${esc(l.title)}</h3><p>${esc(l.group || '')}${l.room ? ` · ${esc(l.room)}` : ''}</p>${l.note ? `<p class="tl__note">${esc(l.note)}</p>` : ''}</div>
    <div class="tl__acts">
      ${l.status === 'done' ? `<span class="tag tag--enrolled">${icon('check')} Проведён</span>` : l.status === 'canceled' ? '<span class="tag tag--lost">Отменён</span>' : `<button class="btn btn--primary btn--sm" data-done="${l.id}">${icon('check')}<span>Провёл</span></button>`}
      <button class="icon-btn" data-lesson="${l.id}" aria-label="Подробнее">${icon('edit')}</button>
    </div>
  </article>`;
}
function bindTeacherCards() {
  $$('[data-done]').forEach((b) => b.onclick = async () => {
    b.disabled = true;
    try { await api('teacher/lesson', { method: 'POST', body: { id: b.dataset.done, status: 'done' } }); await load(); route(); toast('Отмечено как проведённый'); } catch (x) { toast(x.message, 'err'); b.disabled = false; }
  });
}
function teacherLessonModal(l) {
  modal(`
    <form id="tlf">
      <div class="modal__head"><h2>${esc(l.title)}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
      <dl class="details">
        <div><dt>Дата</dt><dd>${humanLong(l.date)}</dd></div>
        <div><dt>Время</dt><dd>${l.start}–${l.end}</dd></div>
        <div><dt>Группа</dt><dd>${esc(l.group || '—')}</dd></div>
        <div><dt>Кабинет</dt><dd>${esc(l.room || '—')}</dd></div>
      </dl>
      <div class="form-grid">
        <label class="field span2"><span>Статус</span><select name="status">${Object.entries(LESSON_STATUS).map(([k, v]) => `<option value="${k}" ${k === l.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="field span2"><span>Заметка (тема, ДЗ, кто отсутствовал)</span><textarea name="note" rows="3">${esc(l.note || '')}</textarea></label>
      </div>
      <p class="muted small">Время и дату урока меняет администратор.</p>
      <p class="form-error" role="alert"></p>
      <div class="modal__foot"><span class="grow"></span><button type="button" class="btn btn--ghost" data-close>Закрыть</button><button class="btn btn--primary" type="submit">Сохранить</button></div>
    </form>`, (p, close) => {
    $('#tlf', p).addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      try { await api('teacher/lesson', { method: 'POST', body: { id: l.id, ...fd } }); await load(); close(); route(); toast('Сохранено'); } catch (x) { $('.form-error', p).textContent = x.message; }
    });
  });
}

function viewMySchedule() {
  const mobile = innerWidth < 760;
  shell('my-schedule', 'Моё расписание', '', `
    <div class="toolbar">${weekNav()}</div>
    ${mobile ? agenda(S.lessons, { showTeacher: false }) : weekGrid(S.lessons, { showTeacher: false, editable: false })}`);
  bindWeekNav(viewMySchedule);
  bindLessonClicks();
  scrollGridToMorning();
}

function viewProfile() {
  const me = S.teachers[0];
  shell('profile', 'Профиль', '', `
    <div class="cols">
      <section class="panel"><div class="profile"><span class="avatar avatar--xl" style="--c:${me.color}">${esc(initials(me.name))}</span><div><h2>${esc(me.name)}</h2><p class="muted">${esc(me.subject || '')}</p><p class="mono small">Логин: ${esc(me.login)}</p></div></div></section>
      <section class="panel"><div class="panel__head"><h2>Сменить пароль</h2></div>
        <form id="pwf" class="form-grid">
          <label class="field span2"><span>Текущий PIN / пароль</span><input name="current" type="password" autocomplete="current-password" required></label>
          <label class="field span2"><span>Новый PIN / пароль</span><input name="next" type="password" autocomplete="new-password" minlength="4" required></label>
          <p class="form-error span2" role="alert"></p>
          <button class="btn btn--primary span2" type="submit">${icon('key')}<span>Сохранить</span></button>
        </form></section>
    </div>`);
  $('#pwf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try { await api('teacher/password', { method: 'POST', body: fd }); e.target.reset(); toast('Пароль изменён'); } catch (x) { $('#pwf .form-error').textContent = x.message; }
  });
}

// ---------- Роутер ----------
const ADMIN_ROUTES = { dashboard: viewDashboard, schedule: viewSchedule, teachers: viewTeachers, leads: viewLeads, settings: viewSettings };
const TEACHER_ROUTES = { my: viewMy, 'my-schedule': viewMySchedule, profile: viewProfile };
function route() {
  if (!S.user) return renderLogin();
  const name = location.hash.replace(/^#\/?/, '');
  const table = S.user.role === 'admin' ? ADMIN_ROUTES : TEACHER_ROUTES;
  const fn = table[name];
  if (!fn) { location.replace(S.user.role === 'admin' ? '#/dashboard' : '#/my'); return; }
  fn();
  $('.content')?.focus?.();
}
addEventListener('hashchange', route);
let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (S.user && !$('#modalRoot').innerHTML) route(); }, 250); });

// Автообновление данных раз в минуту (новые заявки, правки администратора)
setInterval(async () => {
  if (!S.user || document.hidden || $('#modalRoot').innerHTML || document.activeElement?.matches('input,textarea,select')) return;
  try { await load(); route(); } catch {}
}, 60_000);

(async () => {
  try {
    const { user } = await api('me');
    if (!user) return renderLogin();
    await load();
    route();
  } catch { renderLogin(); }
})();
