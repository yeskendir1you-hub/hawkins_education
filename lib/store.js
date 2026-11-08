// Хранилище данных: один JSON-документ.
// На Vercel — приватный Vercel Blob (BLOB_READ_WRITE_TOKEN), локально — файл .data/db.json.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { seed } from './seed.js';

const BLOB_PATH = 'db/hawkins.json';
const LOCAL_FILE = path.join(process.cwd(), '.data', 'db.json');
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function streamToString(stream) {
  const reader = stream.getReader();
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

function normalize(db) {
  db.teachers ??= [];
  db.lessons ??= [];
  db.leads ??= [];
  db.settings ??= {};
  db.settings.rooms ??= [];
  db.settings.courses ??= [];
  return db;
}

export async function readDb() {
  if (useBlob()) {
    const { get } = await import('@vercel/blob');
    const res = await get(BLOB_PATH, { access: 'private', useCache: false }).catch((e) => {
      if (String(e?.message || e).toLowerCase().includes('not found')) return null;
      throw e;
    });
    if (!res || !res.stream) {
      const db = await seed();
      await writeDb(db);
      return db;
    }
    return normalize(JSON.parse(await streamToString(res.stream)));
  }
  try {
    return normalize(JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8')));
  } catch {
    const db = await seed();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db) {
  db.updatedAt = new Date().toISOString();
  const body = JSON.stringify(db);
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    await put(BLOB_PATH, body, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, body);
}

// Последовательные изменения внутри одного инстанса, чтобы не терять записи.
let chain = Promise.resolve();
export function mutate(fn) {
  const run = chain.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  chain = run.catch(() => {});
  return run;
}
