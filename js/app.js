(function () {
  'use strict';


  function initAgeGate() {
    var ageKey = 'smola_age_confirmed_current_visit';

    if (sessionStorage.getItem(ageKey) === 'yes') {
      return;
    }

    var gate = document.createElement('section');
    gate.className = 'age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'age-gate-title');
    gate.innerHTML = [
      '<div class="age-gate-panel" data-age-panel>',
      '  <img class="age-gate-logo" src="img/logo-smola-age.png" alt="СМОЛА.паб">',
      '  <h1 class="age-gate-title" id="age-gate-title">18+</h1>',
      '  <p class="age-gate-text">Сайт содержит информацию о крафтовых напитках. Подтвердите, что вам уже исполнилось 18 лет.</p>',
      '  <div class="age-gate-actions">',
      '    <button class="button button-primary" type="button" data-age-confirm>Мне есть 18</button>',
      '    <button class="button button-secondary" type="button" data-age-deny>Мне нет 18</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(gate);
    document.body.classList.add('age-gate-locked');

    var confirmButton = gate.querySelector('[data-age-confirm]');
    var denyButton = gate.querySelector('[data-age-deny]');
    var panel = gate.querySelector('[data-age-panel]');

    if (confirmButton) {
      confirmButton.focus();
      confirmButton.addEventListener('click', function () {
        sessionStorage.setItem(ageKey, 'yes');
        gate.hidden = true;
        document.body.classList.remove('age-gate-locked');
      });
    }

    if (denyButton && panel) {
      denyButton.addEventListener('click', function () {
        sessionStorage.removeItem(ageKey);
        panel.classList.add('is-blocked');
        panel.innerHTML = [
          '<img class="age-gate-logo" src="img/logo-smola-age.png" alt="СМОЛА.паб">',
          '<h1 class="age-gate-title">18+</h1>',
          '<p class="age-gate-text">Доступ к сайту закрыт, потому что материалы предназначены только для пользователей старше 18 лет.</p>',
          '<p class="age-gate-warning">Вернуться на сайт нельзя без подтверждения возраста.</p>'
        ].join('');
        document.body.classList.add('age-gate-locked');
      });
    }
  }

  initAgeGate();

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

  var tiltCards = Array.prototype.slice.call(document.querySelectorAll('[data-tilt-card]'));

  tiltCards.forEach(function (card) {
    var media = card.querySelector('.product-card-media');
    var bottle = card.querySelector('.product-bottle');

    function resetTilt() {
      card.style.transform = '';
      if (bottle) bottle.style.transform = '';
    }

    card.addEventListener('mousemove', function (event) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var rotateY = ((x / rect.width) - 0.5) * 10;
      var rotateX = (0.5 - (y / rect.height)) * 8;
      card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
      if (bottle) {
        var bottleRotate = rotateY * 0.35;
        bottle.style.transform = 'translateY(-10px) rotate(' + bottleRotate.toFixed(2) + 'deg) scale(1.03)';
      }
      if (media) {
        media.style.backgroundPosition = (50 + rotateY * 0.8) + '% ' + (50 - rotateX * 0.8) + '%';
      }
    });

    card.addEventListener('mouseleave', resetTilt);
    card.addEventListener('blur', resetTilt, true);
  });

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
