// ===== Hawkins Education — интерактив лендинга =====
// Контакты школы — замените на свои:
const CONFIG = {
  whatsapp: '77000000000',          // номер для WhatsApp без «+»
  phone: '+7 700 000 00 00',        // телефон для звонка
  instagram: 'https://instagram.com/',
  waText: 'Здравствуйте! Хочу записаться на бесплатный пробный урок в Hawkins Education.',
};

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
document.documentElement.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Контакты ----------
const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waText)}`;
document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waUrl; a.target = '_blank'; a.rel = 'noopener'; });
document.querySelectorAll('[data-tel]').forEach((a) => { a.href = `tel:${CONFIG.phone.replace(/[^\d+]/g, '')}`; });
document.querySelectorAll('.js-phone').forEach((a) => { a.textContent = CONFIG.phone; });
document.querySelectorAll('[data-ig]').forEach((a) => { a.href = CONFIG.instagram; a.target = '_blank'; a.rel = 'noopener'; });

// ---------- UTM / источник ----------
const params = new URLSearchParams(location.search);
const source = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => params.get(k)).filter(Boolean).join(' / ') || document.referrer.replace(/^https?:\/\//, '').split('/')[0] || 'site';

// ---------- Навигация ----------
const nav = document.getElementById('nav');
const sticky = document.getElementById('stickyCta');
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 20);
  const apply = document.getElementById('apply').getBoundingClientRect();
  sticky.classList.toggle('is-visible', y > window.innerHeight * 0.8 && apply.top > window.innerHeight);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = document.querySelector('.nav__burger');
const menu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menu.hidden = !open;
});
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; } });

// Подставляем направление/тариф в форму по клику
const leadForm = document.getElementById('leadForm');
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-course],[data-plan]');
  if (!a) return;
  const sel = leadForm.course;
  if (a.dataset.course) sel.value = a.dataset.course;
  leadForm.dataset.plan = a.dataset.plan || '';
});

// ---------- Маска телефона ----------
function maskPhone(input) {
  input.addEventListener('input', () => {
    let d = input.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = d ? '+7' : '';
    if (p[0]) out += ` (${p[0]}`;
    if (p[0].length === 3) out += ')';
    if (p[1]) out += ` ${p[1]}`;
    if (p[2]) out += `-${p[2]}`;
    if (p[3]) out += `-${p[3]}`;
    input.value = out;
    input.removeAttribute('aria-invalid');
  });
}
document.querySelectorAll('input[type="tel"]').forEach(maskPhone);

async function sendLead(payload) {
  const res = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, source }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Не удалось отправить. Попробуйте ещё раз или напишите в WhatsApp.');
  window.dataLayer?.push({ event: 'lead', course: payload.course });
  window.fbq?.('track', 'Lead');
}

function validate(form) {
  let ok = true;
  const name = form.name, phone = form.phone;
  if (name.value.trim().length < 2) { name.setAttribute('aria-invalid', 'true'); ok = false; }
  if (phone.value.replace(/\D/g, '').length < 11) { phone.setAttribute('aria-invalid', 'true'); ok = false; }
  return ok;
}

// ---------- Основная форма ----------
leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = leadForm.querySelector('.form__error');
  err.textContent = '';
  if (!validate(leadForm)) { err.textContent = 'Проверьте имя и номер телефона'; return; }
  const btn = leadForm.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Отправляем…';
  try {
    await sendLead({
      name: leadForm.name.value, phone: leadForm.phone.value, course: leadForm.course.value, website: leadForm.website.value,
      comment: leadForm.dataset.plan ? `Тариф: ${leadForm.dataset.plan}` : '',
    });
    [...leadForm.children].forEach((c) => { if (!c.classList.contains('form__done')) c.hidden = true; });
    leadForm.querySelector('.form__done').hidden = false;
  } catch (x) {
    err.textContent = x.message;
    btn.disabled = false; btn.textContent = 'Записаться бесплатно';
  }
});

// ---------- Квиз ----------
(() => {
  const form = document.getElementById('quizForm');
  const steps = [...form.querySelectorAll('.quiz__step')];
  const bar = document.getElementById('quizBar');
  const count = document.getElementById('quizCount');
  const back = document.getElementById('quizBack');
  const err = document.getElementById('quizError');
  let i = 0;
  const show = (n) => {
    i = n;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    count.textContent = `Шаг ${i + 1} из ${steps.length}`;
    back.disabled = i === 0;
    err.textContent = '';
  };
  form.addEventListener('change', (e) => {
    if (e.target.type === 'radio' && i < steps.length - 1) setTimeout(() => show(i + 1), 260);
  });
  back.addEventListener('click', () => i > 0 && show(i - 1));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) { err.textContent = 'Проверьте имя и номер телефона'; return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Отправляем…';
    const fd = new FormData(form);
    const goal = fd.get('goal') || '';
    const course = /IELTS/.test(goal) ? 'English · IELTS' : /ЕНТ/.test(goal) ? 'Математика · ЕНТ' : /НИШ/.test(goal) ? 'Подготовка в НИШ / БИЛ' : /програм/i.test(goal) ? 'Программирование' : '';
    try {
      await sendLead({ name: fd.get('name'), phone: fd.get('phone'), website: fd.get('website'), course, comment: `Квиз: ${fd.get('age') || '—'}, ${goal || '—'}, ${fd.get('format') || '—'}` });
      steps.forEach((s) => s.classList.remove('is-active'));
      form.querySelector('.quiz__nav').hidden = true;
      form.querySelector('.quiz__done').hidden = false;
      bar.style.width = '100%'; count.textContent = 'Готово';
    } catch (x) {
      err.textContent = x.message;
      btn.disabled = false; btn.textContent = 'Получить план и пробный урок';
    }
  });
})();

// ---------- Spotlight / курсор ----------
if (fine) {
  const glow = document.querySelector('.cursor-glow');
  let gx = 0, gy = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const loop = () => { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = `translate(${gx - 280}px, ${gy - 280}px)`; requestAnimationFrame(loop); };
  if (!reduced) loop();

  document.querySelectorAll('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ---------- Анимации (GSAP + Lenis) ----------
function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger || reduced) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    }));
  }

  // Hero
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.hero__title .word', { y: 0, duration: 1.4, stagger: 0.09, delay: 0.15 })
    .to('.hero .reveal', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, '-=1.0');

  // Секции
  ScrollTrigger.batch('.section .reveal', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });

  // Hero параллакс
  gsap.to('.hero__inner', { yPercent: 18, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Счётчики
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || (String(end).includes('.') ? 1 : 0), 10);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = pre + obj.v.toFixed(dec).replace('.', dec ? '.' : '') + suf; } }),
    });
  });

  // Магнитные кнопки и 3D-наклон
  if (fine) {
    document.querySelectorAll('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, .4)' }));
    });
    document.querySelectorAll('.tilt').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: px * 6, rotateX: -py * 6, transformPerspective: 1000, duration: 0.6, ease: 'power3.out' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' }));
    });
  }
}
if (document.readyState === 'complete') initMotion(); else addEventListener('load', initMotion);

// ---------- WebGL-сфера из частиц в hero ----------
(async () => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || reduced) return;
  let THREE;
  try { THREE = await import('/assets/vendor/three.module.min.js'); } catch { return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const mobile = innerWidth < 760;
  const N = mobile ? 5000 : 11000;
  const pos = new Float32Array(N * 3);
  const rnd = new Float32Array(N);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < N; k++) {
    const y = 1 - (k / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * k;
    pos.set([Math.cos(t) * r, y, Math.sin(t) * r], k * 3);
    rnd[k] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uScale: { value: 1 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */`
      uniform float uTime; uniform vec2 uMouse; uniform float uPx;
      attribute float aRnd; varying float vMix; varying float vA;
      vec3 hash(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return -1.0+2.0*fract(sin(p)*43758.5453); }
      float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); vec3 u=f*f*(3.0-2.0*f);
        return mix(mix(mix(dot(hash(i),f),dot(hash(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(hash(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
                   mix(mix(dot(hash(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(hash(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
      void main(){
        vec3 p = position;
        float n = noise(p * 1.6 + vec3(uTime * 0.18));
        float wave = sin(p.y * 6.0 + uTime * 1.2) * 0.03;
        p *= 1.0 + n * 0.32 + wave + length(uMouse) * 0.06;
        p += normalize(position) * aRnd * 0.05;
        vMix = clamp(p.y * 0.5 + 0.5 + n * 0.4, 0.0, 1.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = smoothstep(-3.0, 1.0, mv.z + 6.0) * (0.45 + aRnd * 0.55);
        gl_PointSize = (1.4 + aRnd * 2.2) * uPx * (6.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vMix; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        vec3 a = vec3(0.49, 0.36, 1.0), b = vec3(0.24, 0.9, 1.0), c = vec3(1.0, 0.37, 0.82);
        vec3 col = mix(mix(c, a, smoothstep(0.0, 0.45, vMix)), b, smoothstep(0.55, 1.0, vMix));
        gl_FragColor = vec4(col, (1.0 - d * 2.0) * vA);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const s = w < 760 ? 1.1 : 1.45;
    points.scale.setScalar(s);
    points.position.set(w < 760 ? 0.7 : 2.2, w < 760 ? 1.3 : 0.05, 0);
  };
  resize(); addEventListener('resize', resize);

  const mouse = new THREE.Vector2(), target = new THREE.Vector2();
  addEventListener('pointermove', (e) => { target.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5); }, { passive: true });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    mouse.lerp(target, 0.05);
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.copy(mouse);
    points.rotation.y = t * 0.08 + mouse.x * 0.6;
    points.rotation.x = mouse.y * 0.4;
    renderer.render(scene, camera);
  };
  tick();
  canvas.style.opacity = 0; canvas.style.transition = 'opacity 1.6s ease'; requestAnimationFrame(() => { canvas.style.opacity = innerWidth < 760 ? 0.55 : 1; });
})();
