(function () {
  'use strict';

  const STORAGE_KEY = 'cablex-faq-lang';
  const supportedLangs = ['de', 'fr', 'it'];

  const state = {
    lang: getInitialLang(),
    category: 'all',
    openIds: new Set()
  };

  const listEl = document.getElementById('faqList');
  const emptyEl = document.getElementById('emptyState');

  function getInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supportedLangs.includes(stored)) return stored;
    const nav = (navigator.language || 'de').slice(0, 2).toLowerCase();
    return supportedLangs.includes(nav) ? nav : 'de';
  }

  function setLang(lang) {
    if (!supportedLangs.includes(lang)) return;
    state.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyI18n();
    renderList();
    updateLangButtons();
    document.documentElement.lang = window.I18N[lang].htmlLang;
  }

  function applyI18n() {
    const dict = window.I18N[state.lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.title = dict.heroTitle + ' – cablex / Swisscom';
  }

  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const active = btn.dataset.lang === state.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function updateCatTabs() {
    document.querySelectorAll('.cat-tab').forEach((btn) => {
      const active = btn.dataset.cat === state.category;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function getCategoryLabel(cat) {
    const dict = window.I18N[state.lang];
    if (cat === 'safety') return dict.catSafety;
    if (cat === 'tech') return dict.catTech;
    if (cat === 'docs') return dict.catDocs;
    return '';
  }

  function renderList() {
    const items = window.FAQ_DATA[state.lang] || [];
    const filtered = state.category === 'all'
      ? items
      : items.filter((i) => i.cat === state.category);

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    const frag = document.createDocumentFragment();
    filtered.forEach((item, idx) => {
      const id = state.lang + '-' + (item.cat || 'x') + '-' + idx;
      const isOpen = state.openIds.has(id);

      const wrap = document.createElement('article');
      wrap.className = 'faq-item' + (isOpen ? ' is-open' : '');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'faq-q';
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.setAttribute('aria-controls', 'a-' + id);

      const qText = document.createElement('span');
      qText.className = 'q-text';
      qText.textContent = item.q;

      const cat = document.createElement('span');
      cat.className = 'q-cat cat-' + item.cat;
      cat.textContent = getCategoryLabel(item.cat);

      const chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chev.setAttribute('class', 'q-chevron');
      chev.setAttribute('viewBox', '0 0 20 20');
      chev.setAttribute('fill', 'none');
      chev.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M5 7l5 6 5-6');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      chev.appendChild(path);

      btn.appendChild(qText);
      btn.appendChild(cat);
      btn.appendChild(chev);

      const answer = document.createElement('div');
      answer.className = 'faq-a';
      answer.id = 'a-' + id;
      answer.innerHTML = item.a;

      btn.addEventListener('click', () => {
        if (state.openIds.has(id)) state.openIds.delete(id);
        else state.openIds.add(id);
        wrap.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', wrap.classList.contains('is-open') ? 'true' : 'false');
      });

      wrap.appendChild(btn);
      wrap.appendChild(answer);
      frag.appendChild(wrap);
    });
    listEl.appendChild(frag);
  }

  function init() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    document.querySelectorAll('.cat-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.cat;
        state.openIds.clear();
        updateCatTabs();
        renderList();
      });
    });

    setLang(state.lang);
    updateCatTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
