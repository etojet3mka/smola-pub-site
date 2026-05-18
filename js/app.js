(function () {
  'use strict';

  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }


  var siteHeader = document.querySelector('[data-header]');
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var ticking = false;

  function updateHeaderVisibility() {
    if (!siteHeader) return;
    var currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var isScrollingDown = currentScrollY > lastScrollY;
    var passedHeader = currentScrollY > 90;

    if (isScrollingDown && passedHeader) {
      siteHeader.classList.add('is-hidden');
    } else {
      siteHeader.classList.remove('is-hidden');
    }

    lastScrollY = Math.max(currentScrollY, 0);
    ticking = false;
  }

  if (siteHeader) {
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    }, { passive: true });
  }

  var menuSearch = document.querySelector('[data-menu-search]');
  var menuItems = Array.prototype.slice.call(document.querySelectorAll('[data-menu-list] .menu-item'));
  var emptyState = document.querySelector('[data-empty-state]');

  if (menuSearch && menuItems.length) {
    menuSearch.addEventListener('input', function () {
      var query = menuSearch.value.trim().toLowerCase();
      var visibleCount = 0;

      menuItems.forEach(function (item) {
        var title = (item.getAttribute('data-title') || '').toLowerCase();
        var isVisible = title.indexOf(query) !== -1;
        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    });
  }

  var bookingForm = document.querySelector('[data-booking-form]');
  var successMessage = document.querySelector('[data-success-message]');

  function setError(fieldName, message) {
    var error = document.querySelector('[data-error-for="' + fieldName + '"]');
    if (error) error.textContent = message || '';
  }

  function getField(form, name) {
    return form.elements[name];
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var fields = ['name', 'phone', 'date', 'time', 'guests', 'age'];
      fields.forEach(function (field) { setError(field, ''); });

      var isValid = true;
      var name = getField(bookingForm, 'name');
      var phone = getField(bookingForm, 'phone');
      var date = getField(bookingForm, 'date');
      var time = getField(bookingForm, 'time');
      var guests = getField(bookingForm, 'guests');
      var age = getField(bookingForm, 'age');

      if (!name.value || name.value.trim().length < 2) { setError('name', 'Введите имя от 2 символов.'); isValid = false; }
      if (!phone.validity.valid) { setError('phone', 'Введите корректный телефон.'); isValid = false; }
      if (!date.value) { setError('date', 'Выберите дату.'); isValid = false; }
      if (!time.value) { setError('time', 'Выберите время.'); isValid = false; }
      if (!guests.value) { setError('guests', 'Выберите количество гостей.'); isValid = false; }
      if (!age.checked) { setError('age', 'Подтвердите возраст и согласие на связь.'); isValid = false; }

      if (isValid) {
        if (successMessage) successMessage.hidden = false;
        bookingForm.reset();
        window.SMOLA_ANALYTICS.track('booking_form_submit');
      }
    });
  }

  window.SMOLA_ANALYTICS = {
    track: function (eventName) {
      if (window.console && console.log) {
        console.log('[demo analytics]', eventName);
      }
    }
  };

  Array.prototype.slice.call(document.querySelectorAll('a, button')).forEach(function (element) {
    element.addEventListener('click', function () {
      var label = element.textContent.trim().replace(/\s+/g, ' ');
      if (label) window.SMOLA_ANALYTICS.track('click: ' + label);
    });
  });
}());
