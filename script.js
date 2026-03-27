const TG_PROXY = 'https://script.google.com/macros/s/AKfycbyiRBT9osO90a8yqMVfruhanG-lPNkirVAWT55KZ8RGcZF0ULlD4ar_Mol4NOUyKEjGug/exec';

async function sendToTelegram(data) {
  try {
    const resp = await fetch(TG_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    });

    const body = await resp.text();
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${body || 'empty response'}`);
    }
    return { ok: true, body };
  } catch (e) {
    console.error('Telegram proxy error:', e);
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

/* ── NAV ── */
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ── ПОПАП ── */
function togglePopup() {
  const wrap = document.getElementById('cpopWrap');
  const pop  = document.getElementById('cpop');
  const isOpen = pop.classList.contains('open');
  if (isOpen) {
    pop.classList.remove('open');
    wrap.classList.remove('open');
  } else {
    pop.classList.add('open');
    wrap.classList.add('open');
  }
}
document.addEventListener('click', function(e) {
  const pop = document.getElementById('cpop');
  const btn = document.getElementById('floatCall');
  if (pop.classList.contains('open') && !pop.contains(e.target) && !btn.contains(e.target)) {
    pop.classList.remove('open');
    document.getElementById('cpopWrap').classList.remove('open');
  }
});

/* ── МОДАЛЬНАЯ ФОРМА ── */
let _modalService = '';

function openModal(serviceName) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (serviceName) {
    selectModalService(serviceName, 'Договорная');
  } else {
    showStep(1);
  }
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function showStep(n) {
  document.getElementById('mstep1').style.display = n === 1 ? 'flex' : 'none';
  document.getElementById('mstep2').style.display = n === 2 ? 'flex' : 'none';
  document.getElementById('mstep3').style.display = n === 3 ? 'flex' : 'none';
}

function selectModalService(name, price) {
  _modalService = name;
  const el = document.getElementById('modalSelectedService');
  el.innerHTML = `
    <svg viewBox="0 0 24 24"><use href="#ic-check"/></svg>
    <div><span class="modal-selected-label">Выбранная услуга</span><span class="modal-selected-val">${name}</span></div>
    <span class="msvc-price" style="margin-left:auto">${price}</span>
  `;
  showStep(2);
  const trigger = document.getElementById('formServiceTrigger');
  const val = document.getElementById('fstValue');
  if (trigger && val) {
    val.textContent = name;
    trigger.classList.add('has-value');
    document.getElementById('fservice').value = name;
  }
}

function modalBack() {
  showStep(1);
}

async function submitModal() {
  const name    = document.getElementById('mname').value.trim();
  const phone   = document.getElementById('mphone').value.trim();
  const comment = document.getElementById('mcomment').value.trim();
  if (!name || !phone) { alert('Пожалуйста, заполните имя и телефон'); return; }

  const btn = document.querySelector('.modal-submit');
  btn.disabled = true;
  btn.textContent = 'Отправляем...';

  const result = await sendToTelegram({ name, phone, service: _modalService, comment });

  if (!result.ok) {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0"><use href="#ic-send"/></svg> Отправить заявку`;
    alert('Не удалось отправить заявку. Проверьте публикацию Google Script (/exec) и попробуйте снова.');
    return;
  }

  showStep(3);
  document.getElementById('mname').value    = '';
  document.getElementById('mphone').value   = '';
  document.getElementById('mcomment').value = '';
  btn.disabled = false;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0"><use href="#ic-send"/></svg> Отправить заявку`;
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

function switchCatByName(catId) {
  const el = document.querySelector(`[onclick*="'${catId}'"]`);
  if (el) switchCat(el, catId);
}

/* ── МЕГАМЕНЮ УСЛУГ ── */
function switchCat(el, catId) {
  document.querySelectorAll('.scat-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.services-sub').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('cat-' + catId).classList.add('active');
}

function setService(name) {
  const sel = document.getElementById('fservice');
  let found = false;
  for (let opt of sel.options) {
    if (opt.value && name.toLowerCase().includes(opt.value.toLowerCase())) {
      sel.value = opt.value;
      found = true;
      break;
    }
  }
  if (!found) sel.selectedIndex = 0;
  setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 80);
  return false;
}

/* ── ЧАСТИЦЫ В HERO ── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  function Particle() {
    this.reset = function () {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.8 + 0.4;
      this.vx    = (Math.random() - 0.5) * 0.35;
      this.vy    = (Math.random() - 0.5) * 0.35;
      this.alpha = Math.random() * 0.45 + 0.1;
      this.color = Math.random() > 0.6
        ? `rgba(249,115,22,${this.alpha})`
        : `rgba(241,245,249,${this.alpha * 0.5})`;
    };
    this.reset();
  }
  function init() {
    resize();
    particles = [];
    const count = Math.floor((W * H) / 10000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(249,115,22,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', init);
  init();
  draw();
})();

/* ── СЧЁТЧИКИ ── */
function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  function step(now) {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target) + (suffix || '');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + (suffix || '');
  }
  requestAnimationFrame(step);
}

let heroStarted = false;
function startHeroCounters() {
  if (heroStarted) return;
  heroStarted = true;
  animateCount(document.getElementById('cnt-years'),   25,  '+',  1800);
  animateCount(document.getElementById('cnt-objects'), 500, '+',  2000);
  animateCount(document.getElementById('cnt-sqm'),     200, 'к+', 2200);
  animateCount(document.getElementById('cnt-clients'), 300, '+',  1900);
}

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.cnt2').forEach(el => {
        if (!el.dataset.started) {
          el.dataset.started = true;
          animateCount(el, parseInt(el.dataset.target), '', 1800);
        }
      });
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
setTimeout(startHeroCounters, 600);

/* ── ФОРМА (нижняя секция) ── */
async function submitForm() {
  const name    = document.getElementById('fname').value.trim();
  const phone   = document.getElementById('fphone').value.trim();
  const service = document.getElementById('fservice').value.trim();
  const comment = document.getElementById('fmessage').value.trim();
  if (!name || !phone) {
    alert('Пожалуйста, заполните имя и телефон');
    return;
  }

  const btn = document.querySelector('.form-submit');
  btn.disabled = true;
  btn.textContent = 'Отправляем...';

  const result = await sendToTelegram({ name, phone, service, comment });

  if (!result.ok) {
    btn.disabled = false;
    btn.textContent = 'Получить смету бесплатно →';
    alert('Не удалось отправить заявку. Проверьте публикацию Google Script (/exec) и попробуйте снова.');
    return;
  }

  btn.disabled = false;
  btn.textContent = 'Получить смету бесплатно →';
  document.getElementById('successMsg').style.display = 'block';
  setTimeout(() => document.getElementById('successMsg').style.display = 'none', 5000);
  ['fname', 'fphone', 'fmessage'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fservice').value = '';
  const trigger = document.getElementById('formServiceTrigger');
  const val = document.getElementById('fstValue');
  if (val) val.textContent = 'Нажмите для выбора';
  if (trigger) trigger.classList.remove('has-value');
}
