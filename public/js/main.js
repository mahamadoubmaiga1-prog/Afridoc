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

// Form submission feedback with better UX
(function () {
  const forms = document.querySelectorAll('.doc-form');
  forms.forEach(function (form) {
    // Store original button text
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.setAttribute('data-original', submitBtn.textContent.trim());
    }

    form.addEventListener('submit', function (e) {
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      
      // Disable button and show loading state
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.textContent = '⏳ Génération en cours…';
      
      // Re-enable after 15s in case of issue
      setTimeout(function () {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
        btn.textContent = btn.getAttribute('data-original') || '📥 Générer en PDF';
      }, 15000);
    });
  });
})();

// Form field validation and feedback
(function () {
  const formFields = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
  
  formFields.forEach(function (field) {
    // Add visual feedback on focus
    field.addEventListener('focus', function () {
      this.parentElement.classList.add('focused');
    });
    
    field.addEventListener('blur', function () {
      this.parentElement.classList.remove('focused');
      
      // Simple validation
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.parentElement.classList.add('has-error');
      } else {
        this.parentElement.classList.remove('has-error');
      }
    });
    
    // Remove error state when user starts typing
    field.addEventListener('input', function () {
      if (this.value.trim()) {
        this.parentElement.classList.remove('has-error');
      }
    });
  });
})();

// Add loading button styles
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .btn-loading {
      opacity: 0.7;
      position: relative;
    }
    
    .form-group.has-error input,
    .form-group.has-error textarea,
    .form-group.has-error select {
      border-color: #C62828 !important;
      background-color: rgba(198, 40, 40, 0.05) !important;
    }
    
    .form-group.focused label {
      color: #1B5E20;
    }
  `;
  document.head.appendChild(style);
})();
