import crypto from 'node:crypto';

const COOKIE = 'he_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 дней

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.VERCEL) throw new Error('SESSION_SECRET не задан');
  return 'dev-only-secret';
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');

export function sign(payload) {
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + MAX_AGE * 1000 }));
  const mac = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pin), salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function checkPin(pin, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const calc = crypto.scryptSync(String(pin), salt, 32);
  const target = Buffer.from(hash, 'hex');
  return calc.length === target.length && crypto.timingSafeEqual(calc, target);
}

export function safeEqual(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

export function adminPassword() {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  if (process.env.VERCEL) return null;
  return 'admin';
}

export function readCookie(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function sessionCookie(token, req) {
  const secure = (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.VERCEL;
  const parts = [`${COOKIE}=${encodeURIComponent(token)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${token ? MAX_AGE : 0}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export const uid = (p = '') => p + crypto.randomBytes(6).toString('base64url');
