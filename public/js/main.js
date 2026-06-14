'use strict';

// Mobile navigation toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    this.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Close menu on link click
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });
})();

// Form submission feedback
(function () {
  const forms = document.querySelectorAll('.doc-form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function () {
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = '⏳ Génération en cours…';
      // Re-enable after 10s in case of issue
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = btn.getAttribute('data-original') || '📥 Générer en PDF';
      }, 10000);
    });
  });

  // Store original button text
  document.querySelectorAll('.doc-form button[type="submit"]').forEach(function (btn) {
    btn.setAttribute('data-original', btn.textContent.trim());
  });
})();
