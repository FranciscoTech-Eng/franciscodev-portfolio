(() => {
  const root = document.documentElement;
  const TEXTS = window.TRANSLATIONS || { pt: {}, en: {} };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // localStorage pode estar bloqueado (aba anônima, cookies desativados)
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignora */ }
    }
  };

  /* ---------- Idioma ---------- */
  let lang = storage.get('lang') === 'en' ? 'en' : 'pt';

  function t(key, vars) {
    let text = TEXTS[lang][key] ?? TEXTS.pt[key] ?? key;
    if (vars && typeof text === 'string') {
      Object.keys(vars).forEach((name) => {
        text = text.replaceAll(`{${name}}`, vars[name]);
      });
    }
    return text;
  }

  function applyLanguage(next) {
    lang = next;
    root.lang = lang === 'en' ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr.trim(), t(key.trim()));
      });
    });

    document.title = t('meta.title');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', t('meta.description'));

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  window.I18N = { t, get lang() { return lang; } };

  document.querySelector('[data-lang-toggle]')?.addEventListener('click', () => {
    const next = lang === 'pt' ? 'en' : 'pt';
    storage.set('lang', next);
    applyLanguage(next);
  });

  /* ---------- Tema claro/escuro ---------- */
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    root.dataset.theme = theme;
  }

  applyTheme(storage.get('theme') || (systemDark.matches ? 'dark' : 'light'));

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('theme', next);
    applyTheme(next);
  });

  systemDark.addEventListener('change', (event) => {
    if (!storage.get('theme')) applyTheme(event.matches ? 'dark' : 'light');
  });

  /* ---------- Cabeçalho e menu mobile ---------- */
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(!header.classList.contains('nav-open'));
  });

  document.querySelectorAll('[data-nav] a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (header.classList.contains('nav-open') && !header.contains(event.target)) setMenu(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Efeito de digitação ---------- */
  const typedEl = document.querySelector('[data-typed]');
  let typingTimer;

  function startTyping() {
    if (!typedEl) return;
    clearTimeout(typingTimer);
    const roles = t('hero.roles');

    if (reduceMotion.matches) {
      typedEl.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let length = 0;
    let deleting = false;

    const step = () => {
      const word = roles[roleIndex];
      length += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, length);

      let delay = deleting ? 28 : 55;
      if (!deleting && length === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && length === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }
      typingTimer = setTimeout(step, delay);
    };

    typedEl.textContent = '';
    typingTimer = setTimeout(step, 500);
  }

  document.addEventListener('langchange', startTyping);

  /* ---------- Progresso do curso ---------- */
  document.querySelectorAll('[data-course-progress]').forEach((el) => {
    const start = new Date(`${el.dataset.start}T00:00:00`);
    const end = new Date(`${el.dataset.end}T23:59:59`);
    const ratio = (Date.now() - start) / (end - start);
    const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);

    el.style.setProperty('--progress', `${percent}%`);
    el.querySelector('[data-progress-value]').textContent = `${percent}%`;
    el.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', percent);
  });

  /* ---------- Copiar e-mail ---------- */
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('[data-copy-text]');
    let resetTimer;

    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      let copied = false;

      try {
        await navigator.clipboard.writeText(value);
        copied = true;
      } catch (e) {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
        field.remove();
      }

      if (!copied) {
        window.location.href = `mailto:${value}`;
        return;
      }

      clearTimeout(resetTimer);
      button.classList.add('is-copied');
      label.textContent = t('contact.copied');
      resetTimer = setTimeout(() => {
        button.classList.remove('is-copied');
        label.textContent = t('contact.copy');
      }, 2000);
    });
  });

  /* ---------- Animação ao rolar ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  applyLanguage(lang);
})();
