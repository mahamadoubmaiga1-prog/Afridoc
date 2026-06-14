'use strict';

window.changeLang = function changeLang(lang) {
  document.cookie = 'lang=' + encodeURIComponent(lang) + '; path=/; max-age=31536000; samesite=lax';
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
};

(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    this.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });
})();

(function () {
  const forms = document.querySelectorAll('.doc-form');
  forms.forEach(function (form) {
    const submitBtn = form.querySelector('button[type="submit"].btn-primary');
    if (!submitBtn) return;

    submitBtn.setAttribute('data-original', submitBtn.textContent.trim());

    form.addEventListener('submit', function (e) {
      const target = e.submitter;
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

(function () {
  const formFields = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

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
      return false;
    }

    if (field.type === 'email' && String(field.value || '').trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        return false;
      }
    }

    if (field.type === 'tel' && String(field.value || '').trim()) {
      const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
      if (!phoneRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        return false;
      }
    }

    field.parentElement.classList.remove('has-error');
    return true;
  }

  document.querySelectorAll('.doc-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      const submitter = e.submitter;
      if (submitter && submitter.formAction && submitter.formAction.includes('/preview')) return;

      const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
      let isValid = true;

      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        e.preventDefault();
        const existing = form.parentElement.querySelector('.form-error-banner');
        if (existing) existing.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-error-banner';
        errorMsg.style.cssText = 'color:#C62828;font-weight:600;margin-bottom:16px;padding:12px;background:rgba(198,40,40,.1);border-radius:8px;border-left:4px solid #C62828;';
        errorMsg.textContent = 'Veuillez remplir tous les champs obligatoires et vérifier les formats.';
        form.parentElement.insertBefore(errorMsg, form);
        setTimeout(function () { errorMsg.remove(); }, 5000);
      }
    });
  });
})();

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .btn-loading { opacity: 0.7; position: relative; }
    .form-group.has-error input,
    .form-group.has-error textarea,
    .form-group.has-error select { border-color: #C62828 !important; background-color: rgba(198, 40, 40, 0.05) !important; }
    .form-group.focused label { color: #1B5E20; }
  `;
  document.head.appendChild(style);
})();

(function () {
  const searchInput = document.getElementById('docSearch');
  const grid = document.getElementById('docGrid');
  const noResults = document.getElementById('docNoResults');
  if (!searchInput || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.doc-card'));

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.dataset.search || '') + ' ' + (card.textContent || '');
      const match = !query || text.toLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible++;
    });

    if (noResults) noResults.hidden = visible > 0;
  });
})();

/* ─── Scroll-triggered animations ───────────────────── */
(function () {
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
