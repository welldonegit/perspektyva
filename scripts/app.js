// app.js — інтерактив лендингу (vanilla, без залежностей):
// галерея-слайдер, карусель планувань із табами, свайп. Плавний скрол — CSS.

const pad2 = (v) => String(v).padStart(2, '0');

/* -------------------------------- Галерея -------------------------------- */
function initGallery() {
  const root = document.querySelector('.gallery');
  if (!root) return;
  const track = root.querySelector('.gallery__track');
  const slides = track.children;
  const counter = root.querySelector('.gallery__counter');
  const arrows = root.querySelectorAll('.gallery__arrows .icon-btn');
  const viewport = root.querySelector('.gallery__viewport');
  const n = slides.length;
  if (!n) return;
  let idx = 0;

  const render = () => {
    track.style.transform = `translateX(-${idx * 100}%)`;
    if (counter) counter.textContent = `${pad2(idx + 1)} / ${pad2(n)}`;
  };
  const go = (i) => { idx = ((i % n) + n) % n; render(); };

  if (arrows[0]) arrows[0].addEventListener('click', () => go(idx - 1));
  if (arrows[1]) arrows[1].addEventListener('click', () => go(idx + 1));

  viewport.tabIndex = 0;
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
  });
  addSwipe(viewport, (dir) => go(idx + dir));

  render();
}

/* ------------------------------ Планування ------------------------------ */
const ARROW_SVG =
  '<svg class="btn__icon icon icon--20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10h13"></path><path d="m11 4.5 5.5 5.5-5.5 5.5"></path></svg>';

const PLAN_DATA = {
  amfi: [
    { id: '5-б', area: '97,7 м²', floor: '4' },
    { id: '7', area: '203,8 м²', floor: '5' },
    { id: '9-б', area: '151 м²', floor: '7' },
    { id: '13', area: '245,4 м²', floor: '3' },
    { id: '16-а', area: '86,3 м²', floor: '4' },
  ].map((c) => ({ ...c, complexShort: 'Амфітеатр', isTest: false })),
  letual: [
    { id: '2', area: '135,8 м²', floor: '2', complexShort: 'Летуаль', isTest: true },
  ],
};

function planCardHTML(c) {
  const badge = c.isTest
    ? '<span class="plan-card__badge">Дані потребують підтвердження</span>'
    : '';
  return `<li class="plan-card">
    <div class="plan-card__media"><img class="plan-card__plan" src="assets/plan-demo.jpg" alt="Схема планування квартири"></div>
    <div class="plan-card__body">
      ${badge}
      <h3 class="text-h3 plan-card__title">Квартира №${c.id}</h3>
      <dl class="plan-card__specs">
        <div class="spec"><dt class="text-sm spec__label">ЖК</dt><dd class="text-subhead spec__value">${c.complexShort}</dd></div>
        <div class="spec"><dt class="text-sm spec__label">Площа</dt><dd class="text-subhead spec__value spec__value--nowrap">${c.area}</dd></div>
        <div class="spec"><dt class="text-sm spec__label">Поверх</dt><dd class="text-subhead spec__value">${c.floor}</dd></div>
      </dl>
      <a class="btn btn--primary" href="#lead-form"><span class="btn__label">Дізнатися ціну квартири</span>${ARROW_SVG}</a>
    </div>
  </li>`;
}

function initPlanning() {
  const root = document.querySelector('.planning');
  if (!root) return;
  const track = root.querySelector('.planning__track');
  const viewport = root.querySelector('.planning__viewport');
  const tabs = Array.from(root.querySelectorAll('.tab'));
  const note = root.querySelector('.planning__note');
  const nav = root.querySelectorAll('.planning__nav .icon-btn');
  const prev = nav[0], next = nav[1];

  let tab = 'amfi';
  let idx = 0;

  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = () => {
    const card = track.querySelector('.plan-card');
    return card ? card.getBoundingClientRect().width + gap() : 0;
  };
  const fullView = () => {
    const s = step();
    if (!s) return 1;
    return Math.max(1, Math.floor((viewport.getBoundingClientRect().width + gap()) / s));
  };
  const maxIdx = () => Math.max(0, PLAN_DATA[tab].length - fullView());

  const setDisabled = (btn, off) => {
    if (!btn) return;
    btn.disabled = off;
    btn.classList.toggle('icon-btn--disabled', off);
  };

  const render = () => {
    idx = Math.min(idx, maxIdx());
    track.style.transform = `translateX(-${idx * step()}px)`;
    setDisabled(prev, idx <= 0);
    setDisabled(next, idx >= maxIdx());
  };

  const renderCards = () => {
    track.innerHTML = PLAN_DATA[tab].map(planCardHTML).join('');
  };

  const selectTab = (t) => {
    if (!PLAN_DATA[t]) return;
    tab = t;
    idx = 0;
    tabs.forEach((b) => {
      const on = b.dataset.tab === t;
      b.classList.toggle('tab--selected', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (note) note.hidden = t !== 'letual';
    renderCards();
    render();
  };

  tabs.forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  if (prev) prev.addEventListener('click', () => { idx = Math.max(0, idx - 1); render(); });
  if (next) next.addEventListener('click', () => { idx = Math.min(maxIdx(), idx + 1); render(); });
  addSwipe(viewport, (dir) => { idx = Math.max(0, Math.min(maxIdx(), idx + dir)); render(); });
  window.addEventListener('resize', render);

  selectTab('amfi');
}

/* --------------------------------- Свайп --------------------------------- */
function addSwipe(el, onSwipe) {
  if (!el) return;
  let x0 = null;
  el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) onSwipe(dx < 0 ? 1 : -1);
    x0 = null;
  });
}

/* --------------------------------- Старт --------------------------------- */
function init() {
  initGallery();
  initPlanning();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
