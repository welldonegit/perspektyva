/*
  Попапи ЖК «Амфітеатр».
  Тригери (будь-який елемент):
    Квартира:  data-amf-popup="presentation" data-apartment="Квартира №5-б" data-complex="ЖК «Амфітеатр»" data-plan="assets/plan-demo.jpg"
    Оплата:    data-amf-popup="offer" data-offer="Оплата частинами"
  Відправка: задайте AmfPopups.onSubmit = async (payload) => { ... } — поверніть/киньте помилку за потреби.
*/
(function () {
  const PHOTO = 'assets/gallery-1.jpg';
  const arrow = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10h13"/><path d="m11 4.5 5.5 5.5-5.5 5.5"/></svg>';
  const html = `
<div class="amf-modal" role="presentation" hidden>
  <div class="amf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="amf-title">
    <button type="button" class="amf-modal__close" aria-label="Закрити"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    <div class="amf-modal__media"><img alt=""></div>
    <div class="amf-modal__body">
      <div class="amf-modal__head">
        <h2 class="amf-modal__title" id="amf-title"></h2>
        <p class="amf-modal__sub" data-only="offer">Залиште свої контакти, щоб дізнатися детальні умови оплати.</p>
      </div>
      <form class="amf-form" novalidate>
        <div class="amf-field">
          <label for="amf-name">Ваше ім’я</label>
          <input class="amf-input" id="amf-name" name="name" type="text" autocomplete="name">
        </div>
        <div class="amf-field">
          <label for="amf-phone">Номер телефону</label>
          <input class="amf-input" id="amf-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380" required aria-describedby="amf-phone-err">
          <span class="amf-error" id="amf-phone-err" hidden>Вкажіть номер телефону</span>
        </div>
        <div class="amf-field" data-only="presentation">
          <label for="amf-contact">Як з вами зв’язатись?</label>
          <div class="amf-select">
            <select class="amf-input" id="amf-contact" name="contact">
              <option value="call">Телефонний дзвінок</option>
              <option value="telegram">Telegram</option>
              <option value="viber">Viber</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#22252D" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg>
          </div>
        </div>
        <p class="amf-error" role="alert" data-send-error hidden>Не вдалося надіслати запит. Спробуйте ще раз.</p>
        <button type="submit" class="amf-btn"><span class="amf-btn__label"></span>${arrow}</button>
      </form>
      <div class="amf-success" role="status" hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22252D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M5 12l5 5L20 7"/></svg>
        <div><span class="amf-success__title">Дякуємо! Ваш запит надіслано.</span><span class="amf-success__text" data-only="presentation">Менеджер зв’яжеться з вами, щоб узгодити час презентації.</span></div>
      </div>
    </div>
  </div>
</div>`;

  const root = document.createElement('div');
  root.innerHTML = html.trim();
  const modal = root.firstElementChild;
  document.body.appendChild(modal);
  const $ = s => modal.querySelector(s);
  const dialog = $('.amf-modal__dialog'), media = $('.amf-modal__media'), img = media.querySelector('img');
  const title = $('.amf-modal__title'), form = $('.amf-form'), success = $('.amf-success');
  const phone = $('#amf-phone'), phoneErr = $('#amf-phone-err'), sendErr = $('[data-send-error]');
  const btn = $('.amf-btn'), btnLabel = $('.amf-btn__label');
  let ctx = null, lastFocus = null;

  function open(data) {
    ctx = data;
    const isOffer = data.type === 'offer';
    modal.classList.toggle('amf-modal--offer', isOffer);
    modal.querySelectorAll('[data-only]').forEach(el => { el.hidden = el.dataset.only !== data.type; });
    media.className = 'amf-modal__media ' + (isOffer ? 'amf-modal__media--photo' : 'amf-modal__media--plan');
    img.src = isOffer ? (data.photo || PHOTO) : (data.plan || 'assets/plan-demo.jpg');
    img.alt = isOffer ? (data.complex || 'ЖК «Амфітеатр»') : 'Планування — ' + (data.apartment || '');
    title.textContent = isOffer ? data.offer : `${data.apartment} в ${data.complex || 'ЖК «Амфітеатр»'}: запис на презентацію`;
    btnLabel.textContent = isOffer ? 'Отримати пропозицію' : 'Залишити заявку';
    form.reset(); form.hidden = false; success.hidden = true;
    phone.removeAttribute('aria-invalid'); phoneErr.hidden = true; sendErr.hidden = true; btn.disabled = false;
    lastFocus = document.activeElement;
    modal.hidden = false; modal.classList.add('is-open'); document.body.classList.add('amf-lock');
    setTimeout(() => $('#amf-name').focus(), 0);
  }
  function close() {
    modal.classList.remove('is-open'); modal.hidden = true; document.body.classList.remove('amf-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-amf-popup]');
    if (!t) return;
    e.preventDefault();
    const d = t.dataset;
    open({ type: d.amfPopup, apartment: d.apartment, complex: d.complex, plan: d.plan, offer: d.offer, photo: d.photo });
  });
  $('.amf-modal__close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (!dialog.contains(e.target)) close(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...dialog.querySelectorAll('button,input,select,a[href]')].filter(el => !el.closest('[hidden]') && !el.disabled);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  phone.addEventListener('input', () => { phone.removeAttribute('aria-invalid'); phoneErr.hidden = true; });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (phone.value.replace(/\D/g, '').length < 10) { phone.setAttribute('aria-invalid', 'true'); phoneErr.hidden = false; phone.focus(); return; }
    const fd = new FormData(form);
    const payload = { type: ctx.type, apartment: ctx.apartment || null, complex: ctx.complex || 'ЖК «Амфітеатр»', offer: ctx.offer || null, name: fd.get('name') || '', phone: fd.get('phone'), contact: ctx.type === 'presentation' ? fd.get('contact') : null, page: location.href };
    btn.disabled = true; btnLabel.textContent = 'Надсилаємо…'; sendErr.hidden = true;
    try {
      if (window.AmfPopups.onSubmit) await window.AmfPopups.onSubmit(payload);
      else console.log('[AmfPopups] payload', payload);
      form.hidden = true; success.hidden = false;
    } catch (err) {
      sendErr.hidden = false; btn.disabled = false;
      btnLabel.textContent = ctx.type === 'offer' ? 'Отримати пропозицію' : 'Залишити заявку';
    }
  });

  window.AmfPopups = { open, close, onSubmit: null };
})();
