/**
 * Cristiane Martins — Social Media para Médicos
 * main.js — Header, menu, filtros, animações, contadores, formulário
 * Carrosseis → carousel.js (deve ser carregado antes)
 */

'use strict';


/* ============================================================
   HEADER — Scroll + link ativo por seção
============================================================ */
(function initHeader() {
  const header   = document.querySelector('#header');
  const links    = [...document.querySelectorAll('.nav__link')];
  const sections = [...document.querySelectorAll('section[id]')];

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
    highlightNav();
  }, { passive: true });

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === `#${id}`);
        if (active) active.classList.add('active');
      }
    });
  }
})();


/* ============================================================
   MENU HAMBÚRGUER
============================================================ */
(function initHamburger() {
  const btn  = document.querySelector('#hamburger');
  const nav  = document.querySelector('#nav');
  const body = document.body;

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha ao clicar em um link
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
    });
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
    }
  });
})();


/* ============================================================
   PORTFÓLIO — Filtro por categoria
============================================================ */
(function initPortfolioFilter() {
  const filterBtns = [...document.querySelectorAll('.filter-btn')];
  const cards      = [...document.querySelectorAll('.portfolio__card')];

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // Re-trigger entrada
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ============================================================
   ANIMAÇÕES DE ENTRADA (AOS — vanilla, sem biblioteca)
============================================================ */
(function initAnimations() {
  const els = [...document.querySelectorAll('[data-aos]')];
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = Number(el.dataset.delay) || 0;
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
})();


/* ============================================================
   CONTADORES ANIMADOS (seção de stats)
============================================================ */
(function initCounters() {
  const counters = [...document.querySelectorAll('.stat-number')];
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = Number(el.dataset.target);
      const duration = 1800;
      const steps    = Math.ceil(duration / 16);
      let   count    = 0;
      const inc      = target / steps;

      const tick = () => {
        count += inc;
        if (count >= target) {
          el.textContent = target;
        } else {
          el.textContent = Math.floor(count);
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
})();


/* ============================================================
   FORMULÁRIO DE CONTATO
   Integre com Formspree ou EmailJS substituindo o setTimeout
============================================================ */
(function initContactForm() {
  const form    = document.querySelector('#contatoForm');
  const success = document.querySelector('#formSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome     = form.querySelector('#nome').value.trim();
    const email    = form.querySelector('#email').value.trim();
    const mensagem = form.querySelector('#mensagem').value.trim();

    if (!nome || !email || !mensagem) {
      shakeInvalid(form);
      return;
    }

    const especialidade = form.querySelector('#especialidade').value.trim();

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Abrindo WhatsApp...';
    submitBtn.disabled    = true;

    const texto = `Olá Cristiane! 👋\n\nNome: ${nome}\nE-mail: ${email}${especialidade ? `\nEspecialidade: ${especialidade}` : ''}\n\nMensagem:\n${mensagem}`;
    const url   = `https://wa.me/5581999505816?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');

    form.reset();
    if (success) success.classList.add('visible');
    submitBtn.textContent = 'Enviar mensagem';
    submitBtn.disabled    = false;

    setTimeout(() => {
      if (success) success.classList.remove('visible');
    }, 5000);
  });

  function shakeInvalid(el) {
    el.style.animation = 'shake .4s ease';
    el.addEventListener('animationend', () => {
      el.style.animation = '';
    }, { once: true });
  }
})();


/* ============================================================
   SCROLL SUAVE — links âncora internos
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id     = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ============================================================
   KEYFRAME SHAKE — injetado via JS para o formulário
============================================================ */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-8px); }
      75%      { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(style);
})();
