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
  grad: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
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
  user: null, teachers: [], lessons: [], leads: [], students: [], payments: [], expenses: [], settings: { rooms: [], courses: [], tariffs: [] },
  finMonth: todayIso().slice(0, 7), studentFilter: 'all', studentQuery: '',
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
  Object.assign(S, { user: d.user, teachers: d.teachers, lessons: d.lessons, leads: d.leads, settings: d.settings, students: d.students || [], payments: d.payments || [], expenses: d.expenses || [] });
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
    ? [['dashboard', 'home', 'Обзор'], ['students', 'grad', 'Ученики', dueCount()], ['schedule', 'cal', 'Расписание'], ['finance', 'wallet', 'Финансы'], ['leads', 'inbox', 'Заявки', newLeads], ['teachers', 'users', 'Учителя'], ['settings', 'gear', 'Настройки']]
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
      ${links.slice(0, 5).map(([id, ic, label, badge]) => `<a href="#/${id}" class="${active === id ? 'is-active' : ''}">${icon(ic)}<span>${label}</span>${badge ? '<b class="dot"></b>' : ''}</a>`).join('')}
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
    <span class="lchip__meta">${showTeacher && t ? `${esc(t.name)} · ` : ''}${esc(lessonWho(l))}${l.room ? ` · ${esc(l.room)}` : ''}</span>
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
  const fin = finance(today.slice(0, 7));
  const dueList = S.students.filter((st) => st.active !== false).map((st) => ({ st, x: studentStats(st) })).filter(({ x }) => ['soon', 'zero', 'debt'].includes(x.status)).sort((a, b) => a.x.left - b.x.left);

  shell('dashboard', 'Обзор', `<button class="btn btn--primary" id="addLesson">${icon('plus')}<span>Урок</span></button>`, `
    <p class="hello">${greet()}, ${esc(S.user.name.split(' ')[0])}. Сегодня ${humanLong(today).toLowerCase()}.</p>
    <div class="kpis">
      <div class="kpi"><span>Уроков сегодня</span><b>${todays.length}</b><small>${live.length ? `${live.length} идёт сейчас` : 'сейчас занятий нет'}</small></div>
      <div class="kpi"><span>Уроков на неделе</span><b>${weekLessons.length}</b><small>${fmtH(hoursWeek)} преподавания</small></div>
      <a class="kpi kpi--accent" href="#/finance"><span>Поступило за месяц</span><b class="kpi__money">${money(fin.income)}</b><small>прибыль ${money(fin.profit)} →</small></a>
      <a class="kpi kpi--warn" href="#/students"><span>Скоро оплата</span><b>${dueList.length}</b><small>${dueList.length ? `≈ ${money(dueList.reduce((s, d) => s + (d.x.tr?.price || 0), 0))}` : 'все оплачены'}</small></a>
    </div>
    ${dueList.length ? `<section class="panel due-panel"><div class="panel__head"><h2>${icon('alert')} Нужно напомнить об оплате</h2><a class="link" href="#/finance">Финансы</a></div>
      <div class="due">${dueList.slice(0, 6).map(({ st, x }) => `<a class="due__item" href="#/student/${st.id}"><span class="tag tag--${STATUS_TAG[x.status]}">${STATUS_TXT[x.status]}</span><b>${esc(st.name)}</b><small>${x.left < 0 ? `долг ${-x.left} ур.` : `осталось ${x.left} ур.`}${x.nextPay ? ` · ≈ ${human(x.nextPay)}` : ''}</small><span>${money(x.tr?.price || 0)}</span></a>`).join('')}</div></section>` : ''}
    ${newLeads.length ? `<a class="leadbar" href="#/leads">${icon('inbox')} Новых заявок с сайта: <b>${newLeads.length}</b> — обработать →</a>` : ''}
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
        <label class="field"><span>Группа (необязательно)</span><input name="group" value="${esc(l.group || '')}" placeholder="MATH-1" list="groupList"><datalist id="groupList">${groupNames().map((g) => `<option value="${esc(g)}">`).join('')}</datalist></label>
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
        <fieldset class="field span2"><span>Ученики на уроке</span>${studentPicker(l.studentIds || [], l)}</fieldset>
        ${!isNew && (l.studentIds || []).length ? attendanceFields(l, 'Посещаемость (если урок проведён)') : ''}
        <label class="field span2"><span>Тип занятия (для зарплаты учителя)</span><select name="kind"><option value="">Определить автоматически</option><option value="individual" ${l.kind === 'individual' ? 'selected' : ''}>Индивидуальное</option><option value="group" ${l.kind === 'group' ? 'selected' : ''}>Групповое</option></select></label>
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
      const picked = readPicker(p);
      const err = $('.form-error', p); err.textContent = '';
      const btn = f.querySelector('[type=submit]'); btn.disabled = true;
      try {
        const r = await api('admin/lesson', { method: 'POST', body: { lesson: { ...fd, ...picked, attendance: readAttendance(p, l), id: l.id }, repeatWeeks: fd.repeatWeeks, scope: fd.scope, force } });
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
    bindPicker(p);
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
        <dl class="tcard__stats"><div><dt>На неделе</dt><dd>${ls.length} ур.</dd></div><div><dt>Учеников</dt><dd>${S.students.filter((st) => st.teacherId === t.id && st.active !== false).length}</dd></div><div><dt>Логин</dt><dd class="mono">${esc(t.login)}</dd></div></dl>
        <p class="tcard__next">${icon('coins')}Ставка ${money(t.rateIndividual || 0)} / ${money(t.rateGroup || 0)} (инд./группа) · за ${monthName(todayIso().slice(0, 7))}: <b>${money(payroll(t, todayIso().slice(0, 7)).earned)}</b></p>
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
        <label class="field"><span>Ставка за индивидуальный урок, ₸</span><input name="rateIndividual" type="number" min="0" step="100" inputmode="numeric" value="${esc(t.rateIndividual ?? 2000)}"></label>
        <label class="field"><span>Ставка за групповой урок, ₸</span><input name="rateGroup" type="number" min="0" step="100" inputmode="numeric" value="${esc(t.rateGroup ?? 5000)}"></label>
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
      <div class="panel__head"><h2>Тарифы и цены</h2><button class="link" id="addTr">+ Добавить тариф</button></div>
      <form id="trf">
        <div class="trows">${(S.settings.tariffs || []).map((t, i) => `<div class="trow2" data-i="${i}">
          <input type="hidden" name="id" value="${esc(t.id)}">
          <label class="field"><span>Название</span><input name="name" value="${esc(t.name)}"></label>
          <label class="field"><span>Тип</span><select name="type"><option value="individual" ${t.type !== 'group' ? 'selected' : ''}>Индивидуально</option><option value="group" ${t.type === 'group' ? 'selected' : ''}>Группа</option></select></label>
          <label class="field"><span>Уроков</span><input name="lessons" type="number" min="1" value="${esc(t.lessons)}"></label>
          <label class="field"><span>Цена, ₸</span><input name="price" type="number" min="0" step="500" value="${esc(t.price)}"></label>
          <button type="button" class="icon-btn" data-rmtr="${i}" aria-label="Удалить тариф">${icon('trash')}</button>
        </div>`).join('')}</div>
        <div class="form-grid mt">
          <label class="field"><span>Налог, % от поступлений</span><input name="taxPercent" type="number" min="0" max="50" step="0.5" value="${esc(S.settings.taxPercent || 0)}"></label>
          <label class="check"><input type="checkbox" name="chargeAbsent" ${S.settings.chargeAbsent ? 'checked' : ''}> Списывать урок, если ученик пропустил</label>
        </div>
        <button class="btn btn--primary mt" type="submit">Сохранить тарифы</button>
      </form>
    </section>
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
  const readTariffs = () => $$('.trow2').map((r) => ({ id: r.querySelector('[name=id]').value, name: r.querySelector('[name=name]').value, type: r.querySelector('[name=type]').value, lessons: +r.querySelector('[name=lessons]').value, price: +r.querySelector('[name=price]').value }));
  const saveTariffs = async (tariffs) => {
    const f = $('#trf');
    try { await api('admin/settings', { method: 'POST', body: { tariffs, taxPercent: +f.taxPercent.value, chargeAbsent: f.chargeAbsent.checked } }); await load(); viewSettings(); toast('Тарифы сохранены'); } catch (x) { toast(x.message, 'err'); }
  };
  $('#trf').onsubmit = (e) => { e.preventDefault(); saveTariffs(readTariffs()); };
  $('#addTr').onclick = () => saveTariffs([...readTariffs(), { name: 'Новый тариф', type: 'individual', lessons: 8, price: 0 }]);
  $$('[data-rmtr]').forEach((b) => b.onclick = () => { const list = readTariffs(); list.splice(+b.dataset.rmtr, 1); saveTariffs(list); });
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
    <div class="tl__body"><h3>${esc(l.title)}</h3><p>${esc(lessonWho(l))}${l.room ? ` · ${esc(l.room)}` : ''}</p>${attendanceLine(l)}${l.note ? `<p class="tl__note">${esc(l.note)}</p>` : ''}</div>
    <div class="tl__acts">
      ${l.status === 'done' ? `<span class="tag tag--enrolled">${icon('check')} Проведён</span>` : l.status === 'canceled' ? '<span class="tag tag--lost">Отменён</span>' : `<button class="btn btn--primary btn--sm" data-done="${l.id}">${icon('check')}<span>Провёл</span></button>`}
      <button class="icon-btn" data-lesson="${l.id}" aria-label="Подробнее">${icon('edit')}</button>
    </div>
  </article>`;
}
function bindTeacherCards() {
  $$('[data-done]').forEach((b) => b.onclick = () => {
    const l = S.lessons.find((x) => x.id === b.dataset.done);
    if (l) attendanceModal(l);
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
        ${attendanceFields(l)}
        <label class="field span2"><span>Заметка (тема, ДЗ)</span><textarea name="note" rows="3">${esc(l.note || '')}</textarea></label>
      </div>
      <p class="muted small">Время и дату урока меняет администратор.</p>
      <p class="form-error" role="alert"></p>
      <div class="modal__foot"><span class="grow"></span><button type="button" class="btn btn--ghost" data-close>Закрыть</button><button class="btn btn--primary" type="submit">Сохранить</button></div>
    </form>`, (p, close) => {
    $('#tlf', p).addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      try { await api('teacher/lesson', { method: 'POST', body: { id: l.id, ...fd, attendance: readAttendance(p, l) } }); await load(); close(); route(); toast('Сохранено'); } catch (x) { $('.form-error', p).textContent = x.message; }
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

// ================= УЧЕНИКИ, ОПЛАТЫ, ФИНАНСЫ =================
const money = (n) => `${Math.round(n || 0).toLocaleString('ru-RU')} ₸`;
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const monthName = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MONTHS_NOM[m - 1].toLowerCase()} ${y}`; };
const shiftMonth = (ym, d) => { const [y, m] = ym.split('-').map(Number); const x = new Date(y, m - 1 + d, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; };
const tariffById = (id) => (S.settings.tariffs || []).find((t) => t.id === id);
const studentById = (id) => S.students.find((s) => s.id === id);
const EXP_CAT = { salary: 'Зарплата учителю', rent: 'Аренда', ads: 'Реклама', tax: 'Налоги', other: 'Прочее' };
const groupNames = () => [...new Set(S.students.map((s) => s.group).filter(Boolean))].sort();

function lessonWho(l) {
  const names = (l.studentIds || []).map((id) => studentById(id)?.name).filter(Boolean);
  if (l.group) return names.length ? `${l.group} · ${names.length} уч.` : l.group;
  if (names.length === 1) return names[0];
  if (names.length) return `${names.length} учеников`;
  return '';
}
const lessonKind = (l) => l.kind || ((l.studentIds || []).length > 1 ? 'group' : 'individual');
const attended = (l, sid) => (l.attendance?.[sid] || 'present') !== 'absent';
const charged = (l, sid) => l.status === 'done' && (l.studentIds || []).includes(sid) && (attended(l, sid) || S.settings.chargeAbsent);

// Баланс ученика: оплачено занятий − списано занятий
function studentStats(st) {
  const pays = S.payments.filter((p) => p.studentId === st.id).sort((a, b) => b.date.localeCompare(a.date));
  const paid = pays.reduce((s, p) => s + (+p.lessons || 0), 0);
  const paidSum = pays.reduce((s, p) => s + (+p.amount || 0), 0);
  const lessons = S.lessons.filter((l) => (l.studentIds || []).includes(st.id));
  const used = lessons.filter((l) => charged(l, st.id)).length;
  const missed = lessons.filter((l) => l.status === 'done' && !attended(l, st.id)).length;
  const left = paid - used;
  const tr = tariffById(st.tariffId);
  const last = pays[0];
  const pack = last?.lessons || tr?.lessons || 0;
  const perLesson = tr ? tr.price / tr.lessons : (last && last.lessons ? last.amount / last.lessons : 0);
  const upcoming = lessons.filter((l) => l.status === 'planned' && (l.date > todayIso() || (l.date === todayIso() && mins(l.start) >= nowMin())))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  // дата, когда закончатся оплаченные уроки = дата урока № (left+1)
  const nextPay = left < 0 ? todayIso() : (upcoming[left]?.date || null);
  const status = st.active === false ? 'off' : left < 0 ? 'debt' : left === 0 ? 'zero' : left <= 2 ? 'soon' : 'ok';
  return { pays, paid, paidSum, used, missed, left, pack, tr, perLesson, upcoming, nextPay, status, done: lessons.filter((l) => l.status === 'done') };
}
const STATUS_TXT = { ok: 'Оплачено', soon: 'Скоро оплата', zero: 'Нужно оплатить', debt: 'Долг', off: 'Не учится' };
const STATUS_TAG = { ok: 'enrolled', soon: 'trial', zero: 'new', debt: 'lost-red', off: 'lost' };
const dueCount = () => S.students.filter((st) => st.active !== false && ['soon', 'zero', 'debt'].includes(studentStats(st).status)).length;

// Зарплата учителя за месяц
function payroll(t, ym) {
  const ls = S.lessons.filter((l) => l.teacherId === t.id && l.status === 'done' && l.date.startsWith(ym));
  const ind = ls.filter((l) => lessonKind(l) === 'individual').length;
  const grp = ls.length - ind;
  const earned = ind * (t.rateIndividual || 0) + grp * (t.rateGroup || 0);
  const paidOut = S.expenses.filter((e) => e.category === 'salary' && e.teacherId === t.id && e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
  return { ind, grp, earned, paidOut, owed: Math.max(0, earned - paidOut) };
}
function finance(ym) {
  const income = S.payments.filter((p) => p.date.startsWith(ym)).reduce((s, p) => s + (+p.amount || 0), 0);
  const pr = S.teachers.map((t) => ({ t, ...payroll(t, ym) }));
  const salaryEarned = pr.reduce((s, x) => s + x.earned, 0);
  const salaryPaid = pr.reduce((s, x) => s + x.paidOut, 0);
  const other = S.expenses.filter((e) => e.category !== 'salary' && e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
  const taxPaid = S.expenses.filter((e) => e.category === 'tax' && e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
  const taxDue = Math.round(income * (+S.settings.taxPercent || 0) / 100);
  const taxOwed = Math.max(0, taxDue - taxPaid);
  const otherNoTax = other - taxPaid;
  const profit = income - salaryEarned - otherNoTax - Math.max(taxDue, taxPaid);
  const owe = pr.reduce((s, x) => s + x.owed, 0) + taxOwed;
  return { income, pr, salaryEarned, salaryPaid, other: otherNoTax, taxDue, taxPaid, taxOwed, profit, owe };
}

// ---------- Выбор учеников в уроке ----------
function studentPicker(selected, l = {}) {
  const sel = new Set(selected);
  const list = S.students.filter((st) => st.active !== false || sel.has(st.id)).sort((a, b) => a.name.localeCompare(b.name));
  if (!list.length) return '<p class="muted small">Сначала добавьте учеников в разделе «Ученики».</p>';
  return `<div class="picker">
    ${groupNames().length ? `<div class="picker__groups">${groupNames().map((g) => `<button type="button" class="fchip" data-pick-group="${esc(g)}">+ группа ${esc(g)}</button>`).join('')}</div>` : ''}
    <div class="picker__list">${list.map((st) => `<label class="pchip"><input type="checkbox" name="sid" value="${st.id}" ${sel.has(st.id) ? 'checked' : ''}><span>${esc(st.name)}${st.group ? ` <small>${esc(st.group)}</small>` : ''}</span></label>`).join('')}</div>
  </div>`;
}
function bindPicker(root) {
  $$('[data-pick-group]', root).forEach((b) => b.addEventListener('click', () => {
    const g = b.dataset.pickGroup;
    S.students.filter((st) => st.group === g).forEach((st) => { const cb = root.querySelector(`input[name=sid][value="${st.id}"]`); if (cb) cb.checked = true; });
    const gi = root.querySelector('input[name=group]'); if (gi && !gi.value) gi.value = g;
  }));
}
const readPicker = (root) => ({ studentIds: $$('input[name=sid]:checked', root).map((c) => c.value) });

// ---------- Посещаемость ----------
function attendanceFields(l, title = 'Кто был на уроке') {
  const ids = l.studentIds || [];
  if (!ids.length) return '';
  return `<fieldset class="field span2"><span>${esc(title)}</span><div class="att">${ids.map((id) => {
    const st = studentById(id);
    return `<label class="att__row"><input type="checkbox" name="att" value="${id}" ${attended(l, id) ? 'checked' : ''}><span class="att__box">${icon('check')}</span><span>${esc(st?.name || 'Ученик')}</span></label>`;
  }).join('')}</div><small class="muted">Снимите галочку, если ученик не пришёл.</small></fieldset>`;
}
function readAttendance(root, l) {
  const ids = l.studentIds || [];
  if (!ids.length || !root.querySelector('input[name=att]')) return undefined;
  const on = new Set($$('input[name=att]:checked', root).map((c) => c.value));
  return Object.fromEntries(ids.map((id) => [id, on.has(id) ? 'present' : 'absent']));
}
function attendanceLine(l) {
  const ids = l.studentIds || [];
  if (!ids.length) return '';
  return `<p class="attline">${ids.map((id) => {
    const st = studentById(id);
    const mark = l.status === 'done' ? (attended(l, id) ? '<i class="ok">✓</i>' : '<i class="no">✗</i>') : '';
    return `<span>${mark}${esc(st?.name?.split(' ')[0] || '—')}</span>`;
  }).join('')}</p>`;
}
function attendanceModal(l) {
  if (!(l.studentIds || []).length) {
    api('teacher/lesson', { method: 'POST', body: { id: l.id, status: 'done' } }).then(load).then(() => { route(); toast('Урок отмечен проведённым'); }).catch((x) => toast(x.message, 'err'));
    return;
  }
  modal(`<form id="atf">
    <div class="modal__head"><h2>Отметить урок</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
    <p class="muted">${esc(l.title)} · ${humanLong(l.date)}, ${l.start}–${l.end}</p>
    <div class="form-grid">${attendanceFields(l)}
      <label class="field span2"><span>Тема урока / домашнее задание</span><textarea name="note" rows="2">${esc(l.note || '')}</textarea></label></div>
    <p class="form-error" role="alert"></p>
    <div class="modal__foot"><span class="grow"></span><button type="button" class="btn btn--ghost" data-close>Отмена</button><button class="btn btn--primary" type="submit">${icon('check')}<span>Урок проведён</span></button></div>
  </form>`, (p, close) => {
    $('#atf', p).addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('teacher/lesson', { method: 'POST', body: { id: l.id, status: 'done', note: e.target.note.value, attendance: readAttendance(p, l) } });
        await load(); close(); route(); toast('Урок отмечен, уроки списаны');
      } catch (x) { $('.form-error', p).textContent = x.message; }
    });
  });
}

// ---------- Список учеников ----------
function viewStudents() {
  const q = S.studentQuery.toLowerCase();
  const rows = S.students.map((st) => ({ st, x: studentStats(st) }))
    .filter(({ st, x }) => (S.studentFilter === 'all' ? st.active !== false : S.studentFilter === 'due' ? ['soon', 'zero', 'debt'].includes(x.status) : S.studentFilter === 'off' ? st.active === false : S.studentFilter === st.group)
      && (!q || `${st.name} ${st.parentName} ${st.parentPhone} ${st.phone} ${st.group} ${st.subject}`.toLowerCase().includes(q)))
    .sort((a, b) => { const o = { debt: 0, zero: 1, soon: 2, ok: 3, off: 4 }; return o[a.x.status] - o[b.x.status] || a.x.left - b.x.left || a.st.name.localeCompare(b.st.name); });
  const all = S.students.filter((st) => st.active !== false).map((st) => ({ st, x: studentStats(st) }));
  const dueList = all.filter(({ x }) => ['soon', 'zero', 'debt'].includes(x.status));
  const dueSum = dueList.reduce((s, { st, x }) => s + (x.tr?.price || x.pays[0]?.amount || 0), 0);
  const debtors = all.filter(({ x }) => x.left < 0);
  const ym = todayIso().slice(0, 7);
  shell('students', 'Ученики', `<button class="btn btn--ghost" id="addPay">${icon('coins')}<span>Оплата</span></button><button class="btn btn--primary" id="addSt">${icon('plus')}<span>Ученик</span></button>`, `
    <div class="kpis">
      <div class="kpi"><span>Учеников</span><b>${all.length}</b><small>в ${groupNames().length} группах и индивидуально</small></div>
      <a class="kpi kpi--warn" href="#/students" data-sf="due"><span>Скоро оплата</span><b>${dueList.length}</b><small>≈ ${money(dueSum)} ожидается</small></a>
      <div class="kpi ${debtors.length ? 'kpi--bad' : ''}"><span>Долги</span><b>${debtors.length}</b><small>${debtors.length ? `${debtors.reduce((s, d) => s - d.x.left, 0)} уроков без оплаты` : 'долгов нет'}</small></div>
      <a class="kpi kpi--accent" href="#/finance"><span>Оплаты за ${MONTHS_NOM[+ym.slice(5) - 1].toLowerCase()}</span><b class="kpi__money">${money(finance(ym).income)}</b><small>открыть финансы →</small></a>
    </div>
    <div class="toolbar">
      <div class="search">${icon('search')}<input id="sq" type="search" placeholder="Поиск: имя, родитель, телефон…" value="${esc(S.studentQuery)}" aria-label="Поиск учеников"></div>
      <div class="filters filters--inline">
        <button class="fchip ${S.studentFilter === 'all' ? 'is-active' : ''}" data-sf="all">Все</button>
        <button class="fchip ${S.studentFilter === 'due' ? 'is-active' : ''}" data-sf="due">К оплате (${dueList.length})</button>
        ${groupNames().map((g) => `<button class="fchip ${S.studentFilter === g ? 'is-active' : ''}" data-sf="${esc(g)}">${esc(g)}</button>`).join('')}
        <button class="fchip ${S.studentFilter === 'off' ? 'is-active' : ''}" data-sf="off">Архив</button>
      </div>
    </div>
    <div class="slist">${rows.map(({ st, x }) => {
      const t = teacherById(st.teacherId);
      const pct = x.pack ? Math.max(0, Math.min(100, (x.left / x.pack) * 100)) : 0;
      return `<a class="srow st-${x.status}" href="#/student/${st.id}">
        <span class="avatar" style="--c:${t?.color || '#7c5cff'}">${esc(initials(st.name))}</span>
        <span class="srow__who"><b>${esc(st.name)}</b><small>${esc(st.subject || '—')}${st.group ? ` · ${esc(st.group)}` : ' · индивидуально'}${t ? ` · ${esc(t.name.split(' ')[0])}` : ''}</small></span>
        <span class="srow__tariff"><small>${esc(x.tr?.name || 'Тариф не выбран')}</small><b>${x.tr ? money(x.tr.price) : '—'}</b></span>
        <span class="srow__left"><span class="meter"><i style="width:${pct}%"></i></span><small><b>${x.left}</b> из ${x.pack || '—'} уроков осталось</small></span>
        <span class="srow__pay"><span class="tag tag--${STATUS_TAG[x.status]}">${STATUS_TXT[x.status]}</span><small>${x.status === 'debt' ? `не оплачено ${-x.left} ур.` : x.nextPay ? `оплата ≈ ${human(x.nextPay)}` : ''}</small></span>
      </a>`;
    }).join('') || empty(S.students.length ? 'Никого не найдено' : 'Добавьте первого ученика')}</div>`);
  $('#addSt').onclick = () => studentModal();
  $('#addPay').onclick = () => paymentModal();
  $$('[data-sf]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); S.studentFilter = b.dataset.sf; viewStudents(); }));
  const sq = $('#sq');
  sq.oninput = () => { S.studentQuery = sq.value; clearTimeout(sq._t); sq._t = setTimeout(() => { viewStudents(); const n = $('#sq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
}

// ---------- Карточка ученика ----------
function viewStudent(id) {
  const st = studentById(id);
  if (!st) { location.hash = '#/students'; return; }
  const x = studentStats(st);
  const t = teacherById(st.teacherId);
  const phone = (v) => String(v || '').replace(/\D/g, '');
  const history = S.lessons.filter((l) => (l.studentIds || []).includes(st.id)).sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
  const past = history.filter((l) => l.status !== 'planned').slice(0, 30);
  shell('students', st.name, `<button class="btn btn--ghost" id="editSt">${icon('edit')}<span>Изменить</span></button><button class="btn btn--primary" id="paySt">${icon('coins')}<span>Принять оплату</span></button>`, `
    <a href="#/students" class="back">${icon('left')} Все ученики</a>
    <div class="cols">
      <section class="panel">
        <div class="profile"><span class="avatar avatar--xl" style="--c:${t?.color || '#7c5cff'}">${esc(initials(st.name))}</span>
          <div><h2>${esc(st.name)}</h2><p class="muted">${esc(st.subject || '—')}${st.group ? ` · группа ${esc(st.group)}` : ' · индивидуально'}</p>
          <p class="small">Учитель: <b>${esc(t?.name || 'не назначен')}</b></p></div></div>
        <dl class="details mt">
          <div><dt>Родитель</dt><dd>${esc(st.parentName || '—')}</dd></div>
          <div><dt>Телефон родителя</dt><dd>${st.parentPhone ? `<a href="tel:+${phone(st.parentPhone)}">${esc(st.parentPhone)}</a>` : '—'}</dd></div>
          <div><dt>Телефон ученика</dt><dd>${st.phone ? `<a href="tel:+${phone(st.phone)}">${esc(st.phone)}</a>` : '—'}</dd></div>
          <div><dt>Тариф</dt><dd>${esc(x.tr?.name || '—')}${x.tr ? `<br><b>${money(x.tr.price)}</b>` : ''}</dd></div>
        </dl>
        ${st.parentPhone ? `<div class="row-btns"><a class="btn btn--ghost btn--sm" href="tel:+${phone(st.parentPhone)}">${icon('phone')}<span>Позвонить</span></a><a class="btn btn--ghost btn--sm" target="_blank" rel="noopener" href="https://wa.me/${phone(st.parentPhone)}?text=${encodeURIComponent(`Здравствуйте! Напоминаем об оплате занятий ${st.name} в Hawkins Education${x.tr ? `: ${x.tr.price.toLocaleString('ru-RU')} ₸ (${x.tr.name})` : ''}.`)}">${icon('chat')}<span>Напомнить об оплате в WhatsApp</span></a></div>` : ''}
        ${st.note ? `<p class="muted small mt">${esc(st.note)}</p>` : ''}
      </section>
      <section class="panel balance st-${x.status}">
        <div class="panel__head"><h2>Баланс уроков</h2><span class="tag tag--${STATUS_TAG[x.status]}">${STATUS_TXT[x.status]}</span></div>
        <div class="balance__big"><b>${x.left}</b><span>${x.left < 0 ? 'уроков в долг' : 'уроков осталось'}</span></div>
        <div class="meter meter--lg"><i style="width:${x.pack ? Math.max(0, Math.min(100, (x.left / x.pack) * 100)) : 0}%"></i></div>
        <dl class="details mt">
          <div><dt>Оплачено уроков</dt><dd>${x.paid}</dd></div>
          <div><dt>Проведено (списано)</dt><dd>${x.used}</dd></div>
          <div><dt>Пропусков</dt><dd>${x.missed}${x.missed && !S.settings.chargeAbsent ? ' <small class="muted">(не списаны)</small>' : ''}</dd></div>
          <div><dt>Следующая оплата</dt><dd>${x.status === 'debt' ? '<b class="bad">сейчас</b>' : x.nextPay ? `≈ ${humanLong(x.nextPay)}` : '—'}</dd></div>
          <div><dt>Всего оплачено</dt><dd>${money(x.paidSum)}</dd></div>
          <div><dt>Цена урока</dt><dd>${x.perLesson ? money(x.perLesson) : '—'}</dd></div>
        </dl>
      </section>
    </div>
    <div class="cols mt">
      <section class="panel"><div class="panel__head"><h2>Уроки</h2><span class="muted small">${x.upcoming.length} впереди</span></div>
        <div class="hist">${x.upcoming.slice(0, 4).map((l) => histRow(l, st)).join('')}${past.map((l) => histRow(l, st)).join('') || (x.upcoming.length ? '' : '<p class="muted">Уроков пока нет — добавьте ученика в урок в «Расписании».</p>')}</div></section>
      <section class="panel"><div class="panel__head"><h2>Оплаты</h2><button class="link" id="paySt2">+ Принять оплату</button></div>
        <div class="hist">${x.pays.map((pm) => `<div class="hrow"><span class="hrow__date">${human(pm.date)}</span><span><b>${money(pm.amount)}</b><small>${pm.lessons} уроков${pm.method ? ` · ${esc(pm.method)}` : ''}${pm.note ? ` · ${esc(pm.note)}` : ''}</small></span><button class="icon-btn" data-delpay="${pm.id}" aria-label="Удалить оплату">${icon('trash')}</button></div>`).join('') || '<p class="muted">Оплат ещё не было</p>'}</div></section>
    </div>`);
  $('#editSt').onclick = () => studentModal(st);
  $('#paySt').onclick = $('#paySt2').onclick = () => paymentModal({ studentId: st.id });
  $$('[data-lesson]').forEach((b) => b.addEventListener('click', () => { const l = S.lessons.find((y) => y.id === b.dataset.lesson); if (l) lessonModal(l); }));
  $$('[data-delpay]').forEach((b) => b.onclick = async () => {
    if (!(await confirmBox('Удалить эту оплату? Баланс уроков ученика уменьшится.'))) return;
    try { await api(`admin/payment?id=${b.dataset.delpay}`, { method: 'DELETE' }); await load(); route(); toast('Оплата удалена'); } catch (e) { toast(e.message, 'err'); }
  });
}
function histRow(l, st) {
  const t = teacherById(l.teacherId);
  const mark = l.status === 'planned' ? '<i class="hm hm--plan">•</i>' : l.status === 'canceled' ? '<i class="hm hm--cancel">—</i>' : attended(l, st.id) ? '<i class="hm hm--ok">✓</i>' : '<i class="hm hm--no">✗</i>';
  const label = l.status === 'planned' ? 'впереди' : l.status === 'canceled' ? 'отменён' : attended(l, st.id) ? 'был' : (S.settings.chargeAbsent ? 'пропуск (списан)' : 'пропуск');
  return `<button class="hrow" data-lesson="${l.id}">${mark}<span class="hrow__date">${human(l.date)}<small>${l.start}</small></span><span><b>${esc(l.title)}</b><small>${esc(t?.name || '')} · ${label}</small></span></button>`;
}

// ---------- Модалка ученика ----------
function studentModal(st = {}) {
  const isNew = !st.id;
  const tariffs = S.settings.tariffs || [];
  modal(`<form id="sf" novalidate>
    <div class="modal__head"><h2>${isNew ? 'Новый ученик' : 'Ученик'}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
    <div class="form-grid">
      <label class="field span2"><span>Имя и фамилия ученика</span><input name="name" value="${esc(st.name || '')}" required></label>
      <label class="field"><span>Родитель</span><input name="parentName" value="${esc(st.parentName || '')}"></label>
      <label class="field"><span>Телефон родителя</span><input name="parentPhone" type="tel" value="${esc(st.parentPhone || '')}" placeholder="+7 …"></label>
      <label class="field"><span>Телефон ученика</span><input name="phone" type="tel" value="${esc(st.phone || '')}"></label>
      <label class="field"><span>Предмет</span><input name="subject" list="crs" value="${esc(st.subject || '')}"><datalist id="crs">${(S.settings.courses || []).map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
      <label class="field"><span>Учитель</span><select name="teacherId"><option value="">—</option>${S.teachers.map((t) => `<option value="${t.id}" ${t.id === st.teacherId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Группа (пусто — индивидуально)</span><input name="group" list="grp" value="${esc(st.group || '')}"><datalist id="grp">${groupNames().map((g) => `<option value="${esc(g)}">`).join('')}</datalist></label>
      <label class="field span2"><span>Тариф</span><select name="tariffId"><option value="">—</option>${tariffs.map((t) => `<option value="${t.id}" ${t.id === st.tariffId ? 'selected' : ''}>${esc(t.name)} — ${money(t.price)} за ${t.lessons} ур.</option>`).join('')}</select></label>
      <label class="field span2"><span>Заметка</span><textarea name="note" rows="2">${esc(st.note || '')}</textarea></label>
      ${isNew ? '' : `<label class="check span2"><input type="checkbox" name="active" ${st.active !== false ? 'checked' : ''}> Учится сейчас (снимите, чтобы убрать в архив)</label>`}
    </div>
    <p class="form-error" role="alert"></p>
    <div class="modal__foot">${isNew ? '' : `<button type="button" class="btn btn--danger-ghost" id="del">${icon('trash')}<span>Удалить</span></button>`}<span class="grow"></span>
      <button type="button" class="btn btn--ghost" data-close>Отмена</button><button class="btn btn--primary" type="submit">Сохранить</button></div>
  </form>`, (p, close) => {
    const f = $('#sf', p);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f));
      try {
        const r = await api('admin/student', { method: 'POST', body: { ...fd, id: st.id, active: isNew ? true : f.active.checked } });
        await load(); close();
        if (isNew) { location.hash = `#/student/${r.student.id}`; toast('Ученик добавлен. Теперь примите оплату и добавьте его в уроки.'); } else { route(); toast('Сохранено'); }
      } catch (x) { $('.form-error', p).textContent = x.message; }
    });
    $('#del', p)?.addEventListener('click', async () => {
      close();
      if (!(await confirmBox(`Удалить ${st.name} вместе с историей оплат? Если ученик просто закончил обучение — лучше уберите его в архив.`))) return;
      try { await api(`admin/student?id=${st.id}`, { method: 'DELETE' }); await load(); location.hash = '#/students'; toast('Ученик удалён'); } catch (x) { toast(x.message, 'err'); }
    });
  });
}

// ---------- Модалка оплаты ----------
function paymentModal(pm = {}) {
  const tariffs = S.settings.tariffs || [];
  const st0 = studentById(pm.studentId);
  const tr0 = tariffById(pm.tariffId || st0?.tariffId);
  modal(`<form id="pf" novalidate>
    <div class="modal__head"><h2>Принять оплату</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
    <div class="form-grid">
      <label class="field span2"><span>Ученик</span><select name="studentId" required><option value="">— выберите —</option>${S.students.filter((s) => s.active !== false || s.id === pm.studentId).sort((a, b) => a.name.localeCompare(b.name)).map((s) => `<option value="${s.id}" ${s.id === pm.studentId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
      <label class="field span2"><span>Тариф</span><select name="tariffId"><option value="">Своя сумма</option>${tariffs.map((t) => `<option value="${t.id}" ${t.id === tr0?.id ? 'selected' : ''}>${esc(t.name)} — ${money(t.price)}</option>`).join('')}</select></label>
      <label class="field"><span>Сумма, ₸</span><input name="amount" type="number" min="0" step="500" inputmode="numeric" value="${esc(pm.amount ?? tr0?.price ?? '')}" required></label>
      <label class="field"><span>Количество уроков</span><input name="lessons" type="number" min="0" step="1" inputmode="numeric" value="${esc(pm.lessons ?? tr0?.lessons ?? '')}" required></label>
      <label class="field"><span>Дата оплаты</span><input name="date" type="date" value="${esc(pm.date || todayIso())}"></label>
      <label class="field"><span>Способ</span><select name="method">${['Kaspi', 'Наличные', 'Перевод', 'Halyk', 'Другое'].map((m) => `<option ${m === (pm.method || 'Kaspi') ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
      <label class="field span2"><span>Комментарий</span><input name="note" value="${esc(pm.note || '')}" placeholder="Например: скидка 10% за второго ребёнка"></label>
    </div>
    <p class="form-error" role="alert"></p>
    <div class="modal__foot"><span class="grow"></span><button type="button" class="btn btn--ghost" data-close>Отмена</button><button class="btn btn--primary" type="submit">${icon('check')}<span>Сохранить оплату</span></button></div>
  </form>`, (p, close) => {
    const f = $('#pf', p);
    const fill = () => { const t = tariffById(f.tariffId.value); if (t) { f.amount.value = t.price; f.lessons.value = t.lessons; } };
    f.tariffId.addEventListener('change', fill);
    f.studentId.addEventListener('change', () => { const s = studentById(f.studentId.value); if (s?.tariffId) { f.tariffId.value = s.tariffId; fill(); } });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f));
      try { await api('admin/payment', { method: 'POST', body: { ...fd, id: pm.id } }); await load(); close(); route(); toast(`Оплата ${money(+fd.amount)} сохранена, +${fd.lessons} уроков`); } catch (x) { $('.form-error', p).textContent = x.message; }
    });
  });
}

// ---------- Финансы ----------
function viewFinance() {
  const ym = S.finMonth;
  const F = finance(ym);
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(ym, i - 5));
  const series = months.map((m) => ({ m, ...finance(m) }));
  const maxV = Math.max(1, ...series.map((x) => Math.max(x.income, x.income - x.profit)));
  const due = S.students.filter((st) => st.active !== false).map((st) => ({ st, x: studentStats(st) })).filter(({ x }) => ['soon', 'zero', 'debt'].includes(x.status))
    .sort((a, b) => (a.x.nextPay || '').localeCompare(b.x.nextPay || ''));
  const dueSum = due.reduce((s, { x }) => s + (x.tr?.price || x.pays[0]?.amount || 0), 0);
  const pays = S.payments.filter((pm) => pm.date.startsWith(ym)).sort((a, b) => b.date.localeCompare(a.date));
  const exps = S.expenses.filter((e) => e.date.startsWith(ym)).sort((a, b) => b.date.localeCompare(a.date));
  shell('finance', 'Финансы', `<button class="btn btn--ghost" id="addExp">${icon('plus')}<span>Расход</span></button><button class="btn btn--primary" id="addPay">${icon('coins')}<span>Оплата</span></button>`, `
    <div class="toolbar">
      <div class="weeknav"><button class="icon-btn" data-m="-1" aria-label="Предыдущий месяц">${icon('left')}</button><button class="btn btn--ghost btn--sm" data-m="0">Этот месяц</button><button class="icon-btn" data-m="1" aria-label="Следующий месяц">${icon('right')}</button><span class="weeknav__label">${MONTHS_NOM[+ym.slice(5) - 1]} ${ym.slice(0, 4)}</span></div>
    </div>
    <div class="kpis">
      <div class="kpi kpi--accent"><span>Поступило денег</span><b class="kpi__money">${money(F.income)}</b><small>${pays.length} оплат</small></div>
      <div class="kpi"><span>Расходы</span><b class="kpi__money">${money(F.salaryEarned + F.other + Math.max(F.taxDue, F.taxPaid))}</b><small>зарплаты ${money(F.salaryEarned)} · прочее ${money(F.other)}</small></div>
      <div class="kpi ${F.profit >= 0 ? 'kpi--good' : 'kpi--bad'}"><span>Чистая прибыль</span><b class="kpi__money">${money(F.profit)}</b><small>поступления − все расходы</small></div>
      <div class="kpi kpi--warn"><span>Вы должны</span><b class="kpi__money">${money(F.owe)}</b><small>учителям ${money(F.owe - F.taxOwed)}${F.taxOwed ? ` · налог ${money(F.taxOwed)}` : ''}</small></div>
    </div>
    <div class="cols">
      <section class="panel">
        <div class="panel__head"><h2>Зарплата учителей</h2><span class="muted small">за проведённые уроки</span></div>
        <div class="ptable">
          <div class="ptable__head"><span>Учитель</span><span>Уроков</span><span>Начислено</span><span>Выплачено</span><span>Долг</span><span></span></div>
          ${F.pr.map(({ t, ind, grp, earned, paidOut, owed }) => `<div class="ptable__row"><span class="ptable__who"><span class="avatar avatar--sm" style="--c:${t.color}">${esc(initials(t.name))}</span>${esc(t.name)}</span>
            <span>${ind} инд. + ${grp} гр.</span><span>${money(earned)}</span><span>${money(paidOut)}</span><span class="${owed ? 'bad' : 'good'}">${money(owed)}</span>
            <span>${owed ? `<button class="btn btn--ghost btn--sm" data-paysal="${t.id}" data-amt="${owed}">Выплатить</button>` : '<span class="tag tag--enrolled">Оплачено</span>'}</span></div>`).join('')}
        </div>
        <p class="muted small">Ставки учителей меняются в разделе «Учителя». Начисление идёт автоматически, когда урок отмечен «Проведён».</p>
      </section>
      <section class="panel">
        <div class="panel__head"><h2>Ожидаемые оплаты</h2><b>${money(dueSum)}</b></div>
        <div class="hist">${due.map(({ st, x }) => `<a class="hrow" href="#/student/${st.id}"><span class="tag tag--${STATUS_TAG[x.status]}">${STATUS_TXT[x.status]}</span><span><b>${esc(st.name)}</b><small>${x.left < 0 ? `долг ${-x.left} ур.` : `осталось ${x.left} ур.`} · ${x.nextPay ? `≈ ${human(x.nextPay)}` : ''}</small></span><b>${money(x.tr?.price || x.pays[0]?.amount || 0)}</b></a>`).join('') || '<p class="muted">Все ученики оплачены</p>'}</div>
      </section>
    </div>
    <section class="panel mt">
      <div class="panel__head"><h2>Динамика за 6 месяцев</h2><span class="legend2"><i class="lg2 lg2--in"></i>Поступления <i class="lg2 lg2--out"></i>Расходы <i class="lg2 lg2--pr"></i>Прибыль</span></div>
      <div class="chart">${series.map((x) => { const out = x.income - x.profit; return `<div class="chart__col ${x.m === ym ? 'is-cur' : ''}" title="${MONTHS_NOM[+x.m.slice(5) - 1]}: поступления ${money(x.income)}, расходы ${money(out)}, прибыль ${money(x.profit)}">
        <div class="chart__bars"><i class="b-in" style="height:${(x.income / maxV) * 100}%"></i><i class="b-out" style="height:${(out / maxV) * 100}%"></i></div>
        <b class="${x.profit >= 0 ? 'good' : 'bad'}">${x.profit >= 0 ? '+' : ''}${Math.round(x.profit / 1000)}k</b><span>${MONTHS_NOM[+x.m.slice(5) - 1].slice(0, 3)}</span></div>`; }).join('')}</div>
    </section>
    <div class="cols mt">
      <section class="panel"><div class="panel__head"><h2>Поступления</h2><span class="muted small">${money(F.income)}</span></div>
        <div class="hist">${pays.map((pm) => `<div class="hrow"><span class="hrow__date">${human(pm.date)}</span><span><b>${esc(studentById(pm.studentId)?.name || 'Удалённый ученик')}</b><small>${pm.lessons} ур. · ${esc(pm.method || '')}</small></span><b class="good">+${money(pm.amount)}</b></div>`).join('') || '<p class="muted">Оплат в этом месяце нет</p>'}</div></section>
      <section class="panel"><div class="panel__head"><h2>Расходы</h2><span class="muted small">${money(exps.reduce((s, e) => s + e.amount, 0))}</span></div>
        <div class="hist">${exps.map((e) => `<div class="hrow"><span class="hrow__date">${human(e.date)}</span><span><b>${EXP_CAT[e.category] || 'Прочее'}${e.teacherId ? ` · ${esc(teacherById(e.teacherId)?.name || '')}` : ''}</b><small>${esc(e.note || '')}</small></span><b class="bad">−${money(e.amount)}</b><button class="icon-btn" data-delexp="${e.id}" aria-label="Удалить расход">${icon('trash')}</button></div>`).join('') || '<p class="muted">Расходов нет</p>'}</div></section>
    </div>
    ${+S.settings.taxPercent ? `<p class="muted small mt">Налог ${S.settings.taxPercent}% от поступлений: ${money(F.taxDue)}, уплачено ${money(F.taxPaid)}. Ставка меняется в «Настройках».</p>` : '<p class="muted small mt">Налог не учитывается — укажите ставку в «Настройках», если нужно.</p>'}`);
  $$('[data-m]').forEach((b) => b.onclick = () => { const d = +b.dataset.m; S.finMonth = d === 0 ? todayIso().slice(0, 7) : shiftMonth(S.finMonth, d); viewFinance(); });
  $('#addPay').onclick = () => paymentModal();
  $('#addExp').onclick = () => expenseModal();
  $$('[data-paysal]').forEach((b) => b.onclick = () => expenseModal({ category: 'salary', teacherId: b.dataset.paysal, amount: +b.dataset.amt, note: `Зарплата за ${monthName(ym)}` }));
  $$('[data-delexp]').forEach((b) => b.onclick = async () => {
    if (!(await confirmBox('Удалить этот расход?'))) return;
    try { await api(`admin/expense?id=${b.dataset.delexp}`, { method: 'DELETE' }); await load(); route(); toast('Удалено'); } catch (e) { toast(e.message, 'err'); }
  });
}

function expenseModal(ex = {}) {
  const ym = S.finMonth;
  const defDate = todayIso().startsWith(ym) ? todayIso() : `${ym}-01`;
  modal(`<form id="ef" novalidate>
    <div class="modal__head"><h2>${ex.category === 'salary' ? 'Выплата учителю' : 'Новый расход'}</h2><button type="button" class="icon-btn" data-close aria-label="Закрыть">${icon('x')}</button></div>
    <div class="form-grid">
      <label class="field"><span>Категория</span><select name="category">${Object.entries(EXP_CAT).map(([k, v]) => `<option value="${k}" ${k === (ex.category || 'rent') ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="field"><span>Учитель</span><select name="teacherId"><option value="">—</option>${S.teachers.map((t) => `<option value="${t.id}" ${t.id === ex.teacherId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Сумма, ₸</span><input name="amount" type="number" min="0" step="500" inputmode="numeric" value="${esc(ex.amount ?? '')}" required></label>
      <label class="field"><span>Дата</span><input name="date" type="date" value="${esc(ex.date || defDate)}"></label>
      <label class="field span2"><span>Комментарий</span><input name="note" value="${esc(ex.note || '')}"></label>
    </div>
    <p class="form-error" role="alert"></p>
    <div class="modal__foot"><span class="grow"></span><button type="button" class="btn btn--ghost" data-close>Отмена</button><button class="btn btn--primary" type="submit">Сохранить</button></div>
  </form>`, (p, close) => {
    const f = $('#ef', p);
    const sync = () => { f.teacherId.closest('.field').style.display = f.category.value === 'salary' ? '' : 'none'; };
    f.category.addEventListener('change', sync); sync();
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(f));
      try { await api('admin/expense', { method: 'POST', body: { ...fd, id: ex.id } }); await load(); close(); route(); toast('Сохранено'); } catch (x) { $('.form-error', p).textContent = x.message; }
    });
  });
}

// ---------- Роутер ----------
const ADMIN_ROUTES = { dashboard: viewDashboard, students: viewStudents, schedule: viewSchedule, finance: viewFinance, teachers: viewTeachers, leads: viewLeads, settings: viewSettings };
const TEACHER_ROUTES = { my: viewMy, 'my-schedule': viewMySchedule, profile: viewProfile };
function route() {
  if (!S.user) return renderLogin();
  const name = location.hash.replace(/^#\/?/, '');
  const table = S.user.role === 'admin' ? ADMIN_ROUTES : TEACHER_ROUTES;
  if (S.user.role === 'admin' && name.startsWith('student/')) { viewStudent(name.slice(8)); return; }
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
