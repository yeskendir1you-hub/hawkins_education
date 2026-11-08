// Копирует GSAP, Lenis и Three.js из node_modules в public/assets/vendor (запускается при сборке).
import { mkdirSync, copyFileSync } from 'node:fs';
const out = 'public/assets/vendor';
mkdirSync(out, { recursive: true });
for (const f of [
  'node_modules/gsap/dist/gsap.min.js',
  'node_modules/gsap/dist/ScrollTrigger.min.js',
  'node_modules/lenis/dist/lenis.min.js',
  'node_modules/three/build/three.module.min.js',
]) copyFileSync(f, `${out}/${f.split('/').pop()}`);
console.log('vendor copied');
