// popup.js — модалка у двох режимах, адаптована під дизайн-систему проєкту.
// Тригери (будь-який елемент):
//   Квартира: data-popup="presentation" data-apartment="Квартира №5-б"
//             data-complex="ЖК «Амфітеатр»" data-plan="assets/plan-demo.jpg"
//   Оплата:   data-popup="offer" data-offer="Оплата частинами"
// Відправка: window.AmfPopups.onSubmit = async (payload) => { ... } (кидайте помилку за потреби).

const PHOTO = 'assets/gallery-1.jpg';
const PLAN = 'assets/plan-demo.jpg';
const ARROW =
  '<svg class="btn__icon icon icon--20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10h13"></path><path d="m11 4.5 5.5 5.5-5.5 5.5"></path></svg>';

const TEMPLATE = `
<div class="popup" role="presentation" hidden>
  <div class="popup__dialog" role="dialog" aria-modal="true" aria-labelledby="popup-title">
    <button type="button" class="popup__close" aria-label="Закрити"><svg class="icon icon--24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>
    <div class="popup__media"><img alt=""></div>
    <div class="popup__body">
      <div class="popup__head">
        <h2 class="popup__title" id="popup-title"></h2>
        <p class="text-body popup__sub" data-only="offer">Залиште свої контакти, щоб дізнатися детальні умови оплати.</p>
      </div>
      <form class="popup__form" novalidate>
        <div class="field">
          <label class="text-label field__label" for="popup-name">Ваше ім’я</label>
          <input class="input" id="popup-name" name="name" type="text" autocomplete="name">
        </div>
        <div class="field">
          <label class="text-label field__label" for="popup-phone">Номер телефону</label>
          <input class="input" id="popup-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380" required aria-describedby="popup-phone-err">
          <span class="text-sm field__error" id="popup-phone-err" hidden>Вкажіть номер телефону</span>
        </div>
        <div class="field" data-only="presentation">
          <label class="text-label field__label" for="popup-contact">Як з вами зв’язатись?</label>
          <div class="select">
            <select class="select__control input" id="popup-contact" name="contact">
              <option value="call">Телефонний дзвінок</option>
              <option value="telegram">Telegram</option>
              <option value="viber">Viber</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <svg class="select__chevron icon icon--20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
          </div>
        </div>
        <p class="text-sm field__error" role="alert" data-send-error hidden>Не вдалося надіслати запит. Спробуйте ще раз.</p>
        <button type="submit" class="btn btn--primary popup__submit"><span class="btn__label"></span>${ARROW}</button>
      </form>
      <div class="popup__success" role="status" hidden>
        <svg class="popup__success-icon icon icon--24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>
        <div><span class="popup__success-title">Дякуємо! Ваш запит надіслано.</span><span class="popup__success-text" data-only="presentation">Менеджер зв’яжеться з вами, щоб узгодити час презентації.</span></div>
      </div>
    </div>
  </div>
</div>`;

export function initPopups() {
  if (document.querySelector('.popup')) return;

  const root = document.createElement('div');
  root.innerHTML = TEMPLATE.trim();
  const modal = root.firstElementChild;
  document.body.appendChild(modal);

  const $ = (s) => modal.querySelector(s);
  const dialog = $('.popup__dialog');
  const media = $('.popup__media');
  const img = media.querySelector('img');
  const title = $('.popup__title');
  const form = $('.popup__form');
  const success = $('.popup__success');
  const phone = $('#popup-phone');
  const phoneErr = $('#popup-phone-err');
  const sendErr = $('[data-send-error]');
  const btn = $('.popup__submit');
  const btnLabel = btn.querySelector('.btn__label');
  let ctx = null;
  let lastFocus = null;

  function open(data) {
    ctx = data;
    const isOffer = data.type === 'offer';
    modal.classList.toggle('popup--offer', isOffer);
    modal.querySelectorAll('[data-only]').forEach((el) => {
      el.hidden = el.dataset.only !== data.type;
    });
    media.className = 'popup__media ' + (isOffer ? 'popup__media--photo' : 'popup__media--plan');
    img.src = isOffer ? (data.photo || PHOTO) : (data.plan || PLAN);
    img.alt = isOffer ? (data.complex || 'ЖК «Амфітеатр»') : 'Планування — ' + (data.apartment || '');
    title.textContent = isOffer
      ? data.offer
      : `${data.apartment} в ${data.complex || 'ЖК «Амфітеатр»'}: запис на презентацію`;
    btnLabel.textContent = isOffer ? 'Отримати пропозицію' : 'Залишити заявку';

    form.reset();
    form.hidden = false;
    success.hidden = true;
    phone.removeAttribute('aria-invalid');
    phoneErr.hidden = true;
    sendErr.hidden = true;
    btn.disabled = false;

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('popup-lock');
    setTimeout(() => $('#popup-name').focus(), 0);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('popup-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-popup]');
    if (!t) return;
    e.preventDefault();
    const d = t.dataset;
    open({ type: d.popup, apartment: d.apartment, complex: d.complex, plan: d.plan, offer: d.offer, photo: d.photo });
  });
  $('.popup__close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (!dialog.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...dialog.querySelectorAll('button,input,select,a[href]')]
        .filter((el) => !el.closest('[hidden]') && !el.disabled);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  phone.addEventListener('input', () => {
    phone.removeAttribute('aria-invalid');
    phoneErr.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (phone.value.replace(/\D/g, '').length < 10) {
      phone.setAttribute('aria-invalid', 'true');
      phoneErr.hidden = false;
      phone.focus();
      return;
    }
    const fd = new FormData(form);
    const payload = {
      type: ctx.type,
      apartment: ctx.apartment || null,
      complex: ctx.complex || 'ЖК «Амфітеатр»',
      offer: ctx.offer || null,
      name: fd.get('name') || '',
      phone: fd.get('phone'),
      contact: ctx.type === 'presentation' ? fd.get('contact') : null,
      page: location.href,
    };
    btn.disabled = true;
    btnLabel.textContent = 'Надсилаємо…';
    sendErr.hidden = true;
    try {
      if (window.AmfPopups && window.AmfPopups.onSubmit) await window.AmfPopups.onSubmit(payload);
      else console.log('[AmfPopups] payload', payload);
      form.hidden = true;
      success.hidden = false;
    } catch (err) {
      sendErr.hidden = false;
      btn.disabled = false;
      btnLabel.textContent = ctx.type === 'offer' ? 'Отримати пропозицію' : 'Залишити заявку';
    }
  });

  window.AmfPopups = { open, close, onSubmit: (window.AmfPopups && window.AmfPopups.onSubmit) || null };
}
