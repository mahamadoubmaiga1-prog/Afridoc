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
    if (!submitBtn) return;
    
    submitBtn.setAttribute('data-original', submitBtn.textContent.trim());

    form.addEventListener('submit', function (e) {
      if (!submitBtn) return;
      
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      submitBtn.textContent = '⏳ Génération en cours…';
      
      // Re-enable after 15s in case of issue
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = submitBtn.getAttribute('data-original') || '📥 Générer en PDF';
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
      validateField(this);
    });
    
    // Remove error state when user starts typing
    field.addEventListener('input', function () {
      if (this.value.trim()) {
        this.parentElement.classList.remove('has-error');
      }
    });
  });
  
  // Validate individual field
  function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
      field.parentElement.classList.add('has-error');
      return false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        return false;
      }
    }
    
    // Phone validation (basic international format)
    if (field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
      if (!phoneRegex.test(field.value)) {
        field.parentElement.classList.add('has-error');
        return false;
      }
    }
    
    field.parentElement.classList.remove('has-error');
    return true;
  }
  
  // Validate entire form on submit
  document.querySelectorAll('.doc-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const fields = form.querySelectorAll('input[required], textarea[required]');
      let isValid = true;
      
      fields.forEach(function(field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        // Show message to user
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'color: #C62828; font-weight: 600; margin-bottom: 16px; padding: 12px; background: rgba(198, 40, 40, 0.1); border-radius: 8px; border-left: 4px solid #C62828;';
        errorMsg.textContent = 'Veuillez remplir tous les champs obligatoires et vérifier les formats.';
        form.parentElement.insertBefore(errorMsg, form);
        setTimeout(() => errorMsg.remove(), 5000);
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
