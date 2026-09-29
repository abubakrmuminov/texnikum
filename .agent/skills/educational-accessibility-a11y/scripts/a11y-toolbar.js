/**
 * a11y-toolbar.js - Модуль панели доступности по ГОСТ Р 52872-2019 / WCAG 2.1 AA
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'edu_a11y_settings';
  const defaults = {
    font: 'normal',
    theme: 'default',
    img: 'on',
    spacing: 'normal'
  };

  let state = Object.assign({}, defaults);

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = Object.assign({}, defaults, JSON.parse(saved));
  } catch (e) {
    console.warn('LocalStorage недоступен', e);
  }

  function applyState() {
    const root = document.documentElement;
    root.setAttribute('data-a11y-font', state.font);
    root.setAttribute('data-a11y-theme', state.theme);
    root.setAttribute('data-a11y-img', state.img);
    root.setAttribute('data-a11y-spacing', state.spacing);

    document.querySelectorAll('[data-a11y-font]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-font') === state.font);
    });
    document.querySelectorAll('[data-a11y-theme]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-theme') === state.theme);
    });
    document.querySelectorAll('[data-a11y-img]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-img') === state.img);
    });
    document.querySelectorAll('[data-a11y-spacing]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-a11y-spacing') === state.spacing);
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  applyState();

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('a11y-toggle');
    const toolbar = document.getElementById('a11y-toolbar');
    const resetBtn = document.getElementById('a11y-reset-btn');
    const speakBtn = document.getElementById('a11y-speak-btn');

    if (toggleBtn && toolbar) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = toolbar.hasAttribute('hidden');
        if (isHidden) {
          toolbar.removeAttribute('hidden');
          toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
          toolbar.setAttribute('hidden', '');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    toolbar?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      if (target.dataset.a11yFont) state.font = target.dataset.a11yFont;
      if (target.dataset.a11yTheme) state.theme = target.dataset.a11yTheme;
      if (target.dataset.a11yImg) state.img = target.dataset.a11yImg;
      if (target.dataset.a11ySpacing) state.spacing = target.dataset.a11ySpacing;

      applyState();
    });

    resetBtn?.addEventListener('click', () => {
      state = Object.assign({}, defaults);
      applyState();
    });

    if (speakBtn && 'speechSynthesis' in window) {
      let isSpeaking = false;
      speakBtn.addEventListener('click', () => {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          isSpeaking = false;
          speakBtn.setAttribute('aria-pressed', 'false');
          speakBtn.innerHTML = '<span aria-hidden="true">🔊</span> Озвучить страницу';
        } else {
          const selection = window.getSelection().toString().trim();
          const mainContent = document.getElementById('main-content')?.innerText || document.body.innerText;
          const textToSpeak = selection.length > 0 ? selection : mainContent.substring(0, 4000);

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'ru-RU';
          utterance.rate = 1.0;

          utterance.onend = () => {
            isSpeaking = false;
            speakBtn.setAttribute('aria-pressed', 'false');
            speakBtn.innerHTML = '<span aria-hidden="true">🔊</span> Озвучить страницу';
          };

          window.speechSynthesis.speak(utterance);
          isSpeaking = true;
          speakBtn.setAttribute('aria-pressed', 'true');
          speakBtn.innerHTML = '<span aria-hidden="true">⏹</span> Остановить чтение';
        }
      });
    }
  });
})();
