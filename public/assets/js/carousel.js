/**
 * Cristiane Martins — Social Media para Médicos
 * carousel.js — Lógica dos carrosseis (Hero + Depoimentos)
 * Deve ser carregado ANTES de main.js
 */

'use strict';

/* ── Utilitários compartilhados ───────────────────────────── */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];


/* ============================================================
   CARROSSEL HERO
   - Autoplay a cada 5 segundos
   - Controle por setas, bolinhas e swipe touch
============================================================ */
(function initHeroCarousel() {
  const slides  = $$('.carousel__slide');
  const dots    = $$('#carouselDots .dot');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');

  if (!slides.length) return;

  let current    = 0;
  let timer      = null;
  const INTERVAL = 5000;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  // Botões de seta
  prevBtn && prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); startAuto(); });

  // Bolinhas indicadoras
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      startAuto();
    });
  });

  // Swipe touch
  let touchStartX = 0;
  const carousel  = $('#carousel');
  carousel && carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carousel && carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  startAuto();
})();


/* ============================================================
   CARROSSEL DE DEPOIMENTOS
   - Autoplay a cada 6 segundos
   - 2 cards visíveis em desktop, 1 em mobile
   - Controle por setas, bolinhas e swipe touch
============================================================ */
(function initTestimonialsCarousel() {
  const track   = $('#testimonialsTrack');
  const cards   = $$('.testimonial__card', track || document);
  const dots    = $$('#testDots .dot');
  const prevBtn = $('#testPrev');
  const nextBtn = $('#testNext');

  if (!track || !cards.length) return;

  let current    = 0;
  let timer      = null;
  let perView    = window.innerWidth <= 860 ? 1 : 2;
  const INTERVAL = 6000;

  function update() {
    const cardWidth   = cards[0].offsetWidth;
    const gap         = 24;
    const totalOffset = (cardWidth + gap) * current;
    track.style.transform = `translateX(-${totalOffset}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() {
    const maxIndex = cards.length - perView;
    current = current >= maxIndex ? 0 : current + 1;
    update();
  }

  function prev() {
    const maxIndex = cards.length - perView;
    current = current <= 0 ? maxIndex : current - 1;
    update();
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  prevBtn && prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      current = Number(dot.dataset.index);
      update();
      startAuto();
    });
  });

  // Swipe touch
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  // Atualiza perView ao redimensionar a janela
  window.addEventListener('resize', () => {
    perView  = window.innerWidth <= 860 ? 1 : 2;
    current  = 0;
    update();
  });

  startAuto();
})();
