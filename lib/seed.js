// Демо-данные: учителя, 10 учеников, тарифы, расписание, оплаты и расходы.
// Всё это можно удалить/изменить в админ-панели.
import { hashPin, uid } from './auth.js';

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

export const DEFAULT_TARIFFS = [
  { id: 'tr_group', name: 'Мини-группа (3 раза в неделю)', type: 'group', lessons: 12, price: 36000 },
  { id: 'tr_ind8', name: 'Индивидуально · 8 занятий', type: 'individual', lessons: 8, price: 35000 },
  { id: 'tr_ind12', name: 'Индивидуально · 12 занятий', type: 'individual', lessons: 12, price: 55000 },
  { id: 'tr_ind24', name: 'Индивидуально · 24 занятия', type: 'individual', lessons: 24, price: 90000 },
];

const DEMO_TEACHERS = [
  { name: 'Айгерим Нурланова', subject: 'Английский · IELTS', login: 'aigerim', color: '#8B5CF6' },
  { name: 'Данияр Сапаров', subject: 'Математика', login: 'daniyar', color: '#22D3EE' },
  { name: 'Алина Ким', subject: 'Программирование', login: 'alina', color: '#F472B6' },
  { name: 'Ержан Мухтаров', subject: 'Физика · НИШ/БИЛ', login: 'erzhan', color: '#A3E635' },
];

// Расписание демо: [учитель(login), дни недели (0=Пн), начало, конец, название, группа, кабинет, тип, ученики]
const DEMO_PLAN = [
  ['daniyar', [0, 2, 4], '16:00', '17:00', 'Математика · мини-группа', 'MATH-1', 'Nova', 'group', ['Арман Сейтов', 'Дана Абдрахманова', 'Тимур Жанибеков']],
  ['aigerim', [1, 3, 5], '15:00', '16:00', 'Английский · мини-группа', 'ENG-1', 'Orbit', 'group', ['Амина Касымова', 'Нурсултан Беков', 'Алия Омарова']],
  ['alina', [0, 2, 4], '18:00', '19:00', 'Python', '', 'Lab', 'individual', ['Мирас Ахметов']],
  ['aigerim', [0, 1, 2, 3, 4, 5], '17:00', '18:00', 'IELTS интенсив', '', 'Онлайн', 'individual', ['Айша Нурпеисова']],
  ['erzhan', [1, 3], '16:00', '17:00', 'Подготовка в НИШ', '', 'Quantum', 'individual', ['Ерасыл Тулегенов']],
  ['daniyar', [1, 3], '18:00', '19:00', 'Математика', '', 'Nova', 'individual', ['Камила Серикова']],
];

const STUDENT_INFO = {
  'Арман Сейтов': { subject: 'Математика', tariffId: 'tr_group', parent: 'Сейтова Гульнара' },
  'Дана Абдрахманова': { subject: 'Математика', tariffId: 'tr_group', parent: 'Абдрахманов Ерлан' },
  'Тимур Жанибеков': { subject: 'Математика', tariffId: 'tr_group', parent: 'Жанибекова Сауле' },
  'Амина Касымова': { subject: 'Английский', tariffId: 'tr_group', parent: 'Касымова Динара' },
  'Нурсултан Беков': { subject: 'Английский', tariffId: 'tr_group', parent: 'Беков Арман', unpaid: true },
  'Алия Омарова': { subject: 'Английский', tariffId: 'tr_group', parent: 'Омарова Жанна' },
  'Мирас Ахметов': { subject: 'Программирование', tariffId: 'tr_ind12', parent: 'Ахметова Айгуль' },
  'Айша Нурпеисова': { subject: 'Английский · IELTS', tariffId: 'tr_ind24', parent: 'Нурпеисов Бауыржан' },
  'Ерасыл Тулегенов': { subject: 'Физика · НИШ', tariffId: 'tr_ind8', parent: 'Тулегенова Асель' },
  'Камила Серикова': { subject: 'Математика', tariffId: 'tr_ind8', parent: 'Серикова Мадина' },
};

function demoPhone(i) { return `+7 (701) 555-${pad(10 + i)}-${pad(20 + i)}`; }

// Строит учеников, уроки, оплаты и расходы для заданного списка учителей.
export function buildDemo(teachers, now = new Date()) {
  const byLogin = (login, i) => teachers.find((t) => t.login === login) || teachers[i % teachers.length];
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
  const start = addDays(monday, -14); // 2 недели назад
  const students = [];
  const lessons = [];
  const payments = [];
  let n = 0;
  const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const payDate = iso(start > firstOfMonth ? start : firstOfMonth);

  DEMO_PLAN.forEach(([login, days, s, e, title, group, room, kind, names], pi) => {
    const teacher = byLogin(login, pi);
    if (!teacher) return;
    const ids = names.map((name) => {
      const info = STUDENT_INFO[name];
      const st = {
        id: uid('st_'), name, phone: '', parentName: info.parent, parentPhone: demoPhone(n++),
        subject: info.subject, teacherId: teacher.id, group, tariffId: info.tariffId, note: 'Демо-ученик', active: true,
        createdAt: start.toISOString(),
      };
      students.push(st);
      if (!info.unpaid) {
        const tr = DEFAULT_TARIFFS.find((t) => t.id === info.tariffId);
        payments.push({ id: uid('pay_'), studentId: st.id, date: payDate, amount: tr.price, lessons: tr.lessons, tariffId: tr.id, method: 'Kaspi', note: '' });
      }
      return st.id;
    });
    const seriesId = uid('s_');
    for (let w = 0; w < 8; w++) {
      for (const d of days) {
        const date = addDays(start, w * 7 + d);
        const isPast = date < today;
        const attendance = {};
        if (isPast) ids.forEach((id, k) => { attendance[id] = (w === 1 && d === days[0] && k === ids.length - 1 && ids.length > 1) ? 'absent' : 'present'; });
        lessons.push({
          id: uid('l_'), seriesId, teacherId: teacher.id, date: iso(date), start: s, end: e, title, group, room, kind,
          studentIds: ids, attendance, status: isPast ? 'done' : 'planned', note: '',
        });
      }
    }
  });

  const monthStart = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-01`;
  const expenses = [
    { id: uid('ex_'), date: monthStart, category: 'rent', amount: 150000, note: 'Аренда помещения (демо)' },
    { id: uid('ex_'), date: monthStart, category: 'ads', amount: 30000, note: 'Реклама в Instagram (демо)' },
  ];
  return { students, lessons, payments, expenses };
}

export async function seed() {
  const teachers = DEMO_TEACHERS.map((t) => ({ id: uid('t_'), ...t, phone: '', pinHash: hashPin('1111'), active: true, rateIndividual: 2000, rateGroup: 5000 }));
  const demo = buildDemo(teachers);
  return {
    version: 2,
    createdAt: new Date().toISOString(),
    settings: {
      rooms: ['Orbit', 'Nova', 'Lab', 'Quantum', 'Онлайн'],
      courses: ['Математика', 'Английский', 'IELTS', 'Подготовка в НИШ / БИЛ', 'Программирование', 'Физика'],
      tariffs: DEFAULT_TARIFFS,
      taxPercent: 0,
      chargeAbsent: false,
    },
    teachers,
    ...demo,
    leads: [],
  };
}

// Миграция базы v1 → v2: добавляем учеников, тарифы, оплаты, расходы.
// Старые демо-уроки v1 заменяются новым демо-расписанием, всё созданное вручную сохраняется.
const V1_DEMO_GROUPS = new Set(['IELTS-7', 'ENG-B1', 'ENT-11A', 'OLY-8', 'PY-1', 'WEB-2', 'NIS-6']);
export function migrate(db) {
  if ((db.version || 1) >= 2) return false;
  db.settings ??= {};
  db.settings.tariffs ??= DEFAULT_TARIFFS;
  db.settings.taxPercent ??= 0;
  db.settings.chargeAbsent ??= false;
  db.teachers = (db.teachers || []).map((t) => ({ rateIndividual: 2000, rateGroup: 5000, ...t }));
  db.lessons = (db.lessons || []).filter((l) => !V1_DEMO_GROUPS.has(l.group));
  db.students ??= [];
  db.payments ??= [];
  db.expenses ??= [];
  if (!db.students.length && db.teachers.length) {
    const demo = buildDemo(db.teachers);
    db.students.push(...demo.students);
    db.lessons.push(...demo.lessons);
    db.payments.push(...demo.payments);
    db.expenses.push(...demo.expenses);
  }
  db.leads = (db.leads || []).filter((l) => l.comment !== 'Это демо — удалите');
  db.version = 2;
  return true;
}
