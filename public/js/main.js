'use strict';

window.changeLang = function changeLang(lang) {
  document.cookie = 'lang=' + encodeURIComponent(lang) + '; path=/; max-age=31536000; samesite=lax';
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
};

/* ─── Dark mode toggle ───────────────────────────────── */
(function () {
  var STORAGE_KEY = 'afridoc-theme';
  var html = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme || '');
    if (toggle) {
      var isDark = theme === 'dark';
      toggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', isDark ? 'Activer le mode clair' : 'Activer le mode sombre');
    }
  }

  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) applyTheme(saved);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var effectiveDark = current === 'dark' || (current === '' && prefersDark);
      var next = effectiveDark ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }
})();

/* ─── Mobile nav toggle ──────────────────────────────── */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.navbar-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ─── Form submit loading state ──────────────────────── */
(function () {
  var forms = document.querySelectorAll('.doc-form');
  forms.forEach(function (form) {
    var submitBtn = form.querySelector('button[type="submit"].btn-primary');
    if (!submitBtn) return;

    submitBtn.setAttribute('data-original', submitBtn.textContent.trim());

    form.addEventListener('submit', function (e) {
      var target = e.submitter;
      if (!target || target !== submitBtn) return;

      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      submitBtn.textContent = '⏳ Génération en cours…';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = submitBtn.getAttribute('data-original') || '📥 Générer en PDF';
      }, 15000);
    });
  });
})();

/* ─── Field focus / validation UX ────────────────────── */
(function () {
  var formFields = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
  var liveRegion = document.getElementById('form-error-live');

  formFields.forEach(function (field) {
    field.addEventListener('focus', function () {
      this.parentElement.classList.add('focused');
    });

    field.addEventListener('blur', function () {
      this.parentElement.classList.remove('focused');
      validateField(this);
    });

    field.addEventListener('input', function () {
      if (String(this.value || '').trim()) {
        this.parentElement.classList.remove('has-error');
      }
    });
  });

  function validateField(field) {
    if (field.hasAttribute('required') && !String(field.value || '').trim()) {
      field.parentElement.classList.add('has-error');
      field.parentElement.classList.remove('has-valid');
      return false;
    }

    if (field.type === 'email' && String(field.value || '').trim()) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        field.parentElement.classList.remove('has-valid');
        return false;
      }
    }

    if (field.type === 'tel' && String(field.value || '').trim()) {
      var phoneRegex = /^\+?[\d\s\-()]{7,}$/;
      if (!phoneRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        field.parentElement.classList.remove('has-valid');
        return false;
      }
    }

    field.parentElement.classList.remove('has-error');
    if (String(field.value || '').trim()) {
      field.parentElement.classList.add('has-valid');
    }
    return true;
  }

  document.querySelectorAll('.doc-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var submitter = e.submitter;
      if (submitter && submitter.formAction && submitter.formAction.includes('/preview')) return;

      var fields = form.querySelectorAll('input[required], textarea[required], select[required]');
      var isValid = true;

      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        e.preventDefault();
        var existing = form.parentElement.querySelector('.form-error-banner');
        if (existing) existing.remove();
        var errorMsg = document.createElement('div');
        errorMsg.className = 'form-error-banner';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.setAttribute('aria-live', 'assertive');
        errorMsg.textContent = 'Veuillez remplir tous les champs obligatoires et vérifier les formats.';
        form.parentElement.insertBefore(errorMsg, form);
        errorMsg.focus();
        setTimeout(function () { errorMsg.remove(); }, 5000);
      }
    });
  });
})();

/* ─── Document grid search ───────────────────────────── */
(function () {
  var searchInput = document.getElementById('docSearch');
  var grid = document.getElementById('docGrid');
  var noResults = document.getElementById('docNoResults');
  if (!searchInput || !grid) return;

  var cards = Array.from(grid.querySelectorAll('.doc-card'));

  searchInput.addEventListener('input', function () {
    var query = this.value.toLowerCase().trim();
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.dataset.search || '') + ' ' + (card.textContent || '');
      var match = !query || text.toLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible++;
    });

    if (noResults) noResults.hidden = visible > 0;
  });
})();

/* ─── Scroll-triggered animations ───────────────────── */
(function () {
  document.querySelectorAll('#docGrid .doc-card').forEach(function (card, i) {
    card.style.transitionDelay = (0.05 * (i % 8)).toFixed(2) + 's';
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      el.classList.add('animated');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-animate]').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ─── Animated counter for stats bar ────────────────── */
(function () {
  var counter = document.querySelector('[data-counter]');
  if (!counter) return;

  var target = parseInt(counter.getAttribute('data-counter'), 10);
  if (isNaN(target) || target <= 0) return;

  var start = Math.max(0, target - Math.round(target * 0.25));
  var duration = 1400;
  var startTime = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var value = Math.round(start + (target - start) * easeOut(progress));
    counter.textContent = value.toLocaleString('fr-FR');
    if (progress < 1) requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    requestAnimationFrame(step);
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(step);
      obs.unobserve(counter);
    }
  }, { threshold: 0.5 });

  obs.observe(counter);
})();

/* ─── Web Share API for preview page ────────────────── */
(function () {
  var shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  if (!navigator.share) {
    shareBtn.style.display = 'none';
    return;
  }

  shareBtn.addEventListener('click', function () {
    navigator.share({
      title: document.title,
      text: 'Générez ce document gratuitement avec Afridoc',
      url: window.location.href,
    }).catch(function () {});
  });
})();
