// Демо-данные для первого запуска. Удалите/замените их в админ-панели.
import { hashPin, uid } from './auth.js';

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export async function seed() {
  const teachers = [
    { name: 'Айгерим Нурланова', subject: 'English · IELTS', login: 'aigerim', color: '#8B5CF6', phone: '' },
    { name: 'Данияр Сапаров', subject: 'Математика · ЕНТ', login: 'daniyar', color: '#22D3EE', phone: '' },
    { name: 'Алина Ким', subject: 'Программирование', login: 'alina', color: '#F472B6', phone: '' },
    { name: 'Ержан Мухтаров', subject: 'Физика · НИШ/БИЛ', login: 'erzhan', color: '#A3E635', phone: '' },
  ].map((t) => ({ id: uid('t_'), ...t, pinHash: hashPin('1111'), active: true }));

  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));

  const plan = [
    // [teacherIdx, weekday 0=Пн, start, end, title, group, room]
    [0, 0, '15:00', '16:30', 'IELTS Intensive', 'IELTS-7', 'Orbit'],
    [0, 2, '15:00', '16:30', 'IELTS Intensive', 'IELTS-7', 'Orbit'],
    [0, 4, '17:00', '18:00', 'General English B1', 'ENG-B1', 'Orbit'],
    [1, 0, '17:00', '18:30', 'Математика ЕНТ', 'ENT-11A', 'Nova'],
    [1, 3, '17:00', '18:30', 'Математика ЕНТ', 'ENT-11A', 'Nova'],
    [1, 5, '11:00', '12:30', 'Олимпиадная математика', 'OLY-8', 'Nova'],
    [2, 1, '16:00', '17:30', 'Python с нуля', 'PY-1', 'Lab'],
    [2, 3, '16:00', '17:30', 'Python с нуля', 'PY-1', 'Lab'],
    [2, 5, '13:00', '14:30', 'Web-разработка', 'WEB-2', 'Lab'],
    [3, 1, '14:00', '15:30', 'Подготовка в НИШ', 'NIS-6', 'Quantum'],
    [3, 4, '14:00', '15:30', 'Подготовка в НИШ', 'NIS-6', 'Quantum'],
  ];

  const lessons = [];
  for (const [ti, wd, start, end, title, group, room] of plan) {
    const seriesId = uid('s_');
    for (let w = -1; w < 6; w++) {
      const d = new Date(monday);
      d.setUTCDate(d.getUTCDate() + wd + w * 7);
      lessons.push({
        id: uid('l_'), seriesId, teacherId: teachers[ti].id, date: iso(d), start, end,
        title, group, room, status: w < 0 ? 'done' : 'planned', note: '',
      });
    }
  }

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: {
      rooms: ['Orbit', 'Nova', 'Lab', 'Quantum', 'Онлайн'],
      courses: ['English · IELTS', 'Математика · ЕНТ', 'Подготовка в НИШ / БИЛ', 'Программирование', 'Физика', 'Другое'],
    },
    teachers,
    lessons,
    leads: [
      { id: uid('ld_'), name: 'Пример заявки', phone: '+7 700 000 00 00', course: 'English · IELTS', comment: 'Это демо — удалите', source: 'site', status: 'new', createdAt: new Date().toISOString() },
    ],
  };
}
