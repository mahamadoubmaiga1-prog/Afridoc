'use strict';

// Resolve locale from the <html lang> attribute for date formatting.
// Bambara doesn't have its own date locale; fall back to fr-FR.
function getDateLocale() {
  const lang = (document.documentElement.lang || 'fr').toLowerCase();
  if (lang === 'en') return 'en-GB';
  return 'fr-FR';
}

(function () {
  const locale = getDateLocale();
  const today = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  document.querySelectorAll('input[name="date"]').forEach(function (input) {
    if (!input.value) input.value = today;
  });
})();

(function () {
  document.querySelectorAll('textarea[maxlength]').forEach(function (ta) {
    const max = Number(ta.getAttribute('maxlength'));
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    ta.parentElement.appendChild(counter);

    function refresh() {
      const len = ta.value.length;
      counter.textContent = len + ' / ' + max;
      counter.style.color = len > max * 0.9 ? '#C62828' : '#9CA3AF';
    }

    ta.addEventListener('input', refresh);
    refresh();
  });
})();

(function () {
  const form = document.querySelector('.doc-form');
  if (!form) return;

  const formKey = 'afridoc_' + window.location.pathname.replace(/\//g, '_');
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(formKey) || '{}');
  } catch (_err) {
    saved = {};
  }

  Object.keys(saved).forEach(function (name) {
    const fields = form.querySelectorAll('[name="' + name + '"]');
    if (!fields.length) return;
    const first = fields[0];
    if (first.type === 'radio') {
      fields.forEach(function (field) {
        field.checked = field.value === saved[name];
      });
      return;
    }
    if (!first.value) first.value = saved[name];
  });

  form.addEventListener('input', function () {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    localStorage.setItem(formKey, JSON.stringify(data));
  });

  const clearBtn = document.querySelector('.btn-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem(formKey);
      form.reset();
      const locale = getDateLocale();
      document.querySelectorAll('input[name="date"]').forEach(function (input) {
        input.value = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
      });
      const checked = document.querySelector('input[name="theme"]:checked');
      if (checked) document.body.setAttribute('data-theme', checked.value);
      form.dispatchEvent(new Event('input'));
    });
  }
})();

(function () {
  document.querySelectorAll('[data-help]').forEach(function (field) {
    const help = field.getAttribute('data-help');
    const icon = document.createElement('span');
    icon.className = 'help-icon';
    icon.textContent = ' ❓';
    icon.title = help;
    icon.style.cssText = 'cursor:help;font-size:0.85em;opacity:0.7;';
    const label = document.querySelector('label[for="' + field.id + '"]');
    if (label) label.appendChild(icon);
  });
})();

(function () {
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      document.body.setAttribute('data-theme', this.value);
    });
  });
  const checked = document.querySelector('input[name="theme"]:checked');
  if (checked) document.body.setAttribute('data-theme', checked.value);
})();

(function () {
  const fieldsets = document.querySelectorAll('.doc-form fieldset');
  if (fieldsets.length < 2) return;

  const progress = document.createElement('div');
  progress.className = 'form-progress';
  progress.innerHTML = '<div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>' +
    '<span class="progress-text">Étape <span id="currentStep">0</span> / ' + fieldsets.length + '</span>';

  const formPage = document.querySelector('.form-page');
  if (!formPage) return;
  formPage.insertBefore(progress, formPage.querySelector('.doc-form'));

  function hasInputValue(input) {
    if (input.type === 'radio' || input.type === 'checkbox') return input.checked;
    return String(input.value || '').trim().length > 0;
  }

  function updateProgress() {
    let filled = 0;
    fieldsets.forEach(function (fieldset) {
      const inputs = fieldset.querySelectorAll('input, textarea, select');
      const complete = Array.from(inputs).some(hasInputValue);
      if (complete) filled += 1;
    });
    const pct = Math.round((filled / fieldsets.length) * 100);
    progress.querySelector('.progress-fill').style.width = pct + '%';
    progress.querySelector('#currentStep').textContent = filled;
  }

  const form = document.querySelector('.doc-form');
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);
  updateProgress();
})();
