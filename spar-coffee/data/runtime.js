(function () {
  var areas = window.SPAR_COFFEE_AREAS || {};
  var deliveryAddresses = window.SPAR_COFFEE_ADDRESSES || {};
  var mapConstructors = window.SPAR_COFFEE_MAPS || {};
  var page = document;

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9]+/g, ' ').trim();
  }

  var nav = page.querySelector('.spar-coffee-page .sc-nav');
  var burger = page.querySelector('[data-sc-burger]');
  function closeMobileNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (nav && burger) {
    burger.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('.sc-nav__links a').forEach(function (link) { link.addEventListener('click', closeMobileNav); });
    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open') || nav.contains(event.target)) return;
      closeMobileNav();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMobileNav(); });
  }

  var hero = page.querySelector('.sc-hero');
  var check = page.querySelector('.sc-availability');
  var form = page.querySelector('[data-sc-form]');
  var city = page.querySelector('[data-sc-city]');
  var district = page.querySelector('[data-sc-district]');
  var districtField = page.querySelector('[data-sc-district-field]');
  var map = page.querySelector('[data-sc-map]');
  var mapFrame = page.querySelector('[data-sc-map-frame]');
  var addressInput = page.querySelector('[data-sc-address-input]');
  var addressClear = page.querySelector('[data-sc-address-clear]');
  var addressToggle = page.querySelector('[data-sc-address-toggle]');
  var suggestions = page.querySelector('[data-sc-suggestions]');
  var status = page.querySelector('[data-sc-address-status]');
  var currentKey = '';
  var currentAddresses = [];

  function resetAddress() {
    if (!addressInput || !suggestions || !status || !map) return;
    addressInput.value = '';
    suggestions.innerHTML = '';
    suggestions.classList.remove('is-open');
    map.classList.remove('is-suggestions-open');
    status.textContent = '';
    status.className = 'sc-address-status';
  }
  function hideMap() {
    if (!map || !mapFrame) return;
    map.classList.remove('is-visible', 'is-loading');
    mapFrame.innerHTML = '';
    if (hero) hero.style.height = '';
  }
  function fillCities() {
    if (!city) return;
    city.innerHTML = '';
    city.add(new Option('Выберите город', ''));
    Object.keys(areas).forEach(function (name) { city.add(new Option(name, name)); });
  }
  function fillDistricts(cityName) {
    if (!district || !districtField) return;
    district.innerHTML = '';
    district.add(new Option('Выберите район', ''));
    (areas[cityName] || []).forEach(function (name) { district.add(new Option(name, name)); });
    district.disabled = !cityName;
    districtField.classList.toggle('is-disabled', !cityName);
    resetAddress();
    hideMap();
  }
  function updateHeroHeight() {
    if (!hero || !check || !map || !map.classList.contains('is-visible')) return;
    var heroTop = hero.getBoundingClientRect().top + window.scrollY;
    var checkBottom = check.getBoundingClientRect().bottom + window.scrollY;
    var bottomGap = window.matchMedia('(max-width: 760px)').matches ? 42 : 64;
    hero.style.height = Math.ceil(checkBottom - heroTop + bottomGap) + 'px';
  }
  function renderFallbackMap() {
    map.classList.remove('is-loading');
    mapFrame.innerHTML = '<div class="sc-fallback-map">Карта для выбранного района пока не подключена.</div>';
  }
  function renderMapLoader() {
    map.classList.add('is-loading');
    mapFrame.innerHTML = '<div class="sc-map__loader" data-sc-map-loader><span>Загружаем карту</span></div>';
  }
  function showLoadedMap() {
    if (!map.classList.contains('is-loading')) return;
    if (!mapFrame.querySelector('ymaps, iframe')) return;
    map.classList.remove('is-loading');
    var loader = mapFrame.querySelector('[data-sc-map-loader]');
    if (loader) loader.remove();
    updateHeroHeight();
  }
  function showMap() {
    currentKey = city.value + '|' + district.value;
    currentAddresses = deliveryAddresses[currentKey] || [];
    map.classList.add('is-visible');
    resetAddress();
    renderMapLoader();
    if (mapConstructors[currentKey]) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.async = true;
      script.src = mapConstructors[currentKey];
      script.onerror = renderFallbackMap;
      mapFrame.appendChild(script);
      var mapObserver = new MutationObserver(function () { window.setTimeout(showLoadedMap, 250); });
      mapObserver.observe(mapFrame, { childList: true, subtree: true });
      window.setTimeout(function () { showLoadedMap(); mapObserver.disconnect(); }, 5000);
    } else {
      renderFallbackMap();
    }
    window.setTimeout(updateHeroHeight, 0);
    window.setTimeout(updateHeroHeight, 1200);
  }
  function filterAddresses(query) {
    var normalized = normalize(query);
    if (!normalized) return currentAddresses;
    var parts = normalized.split(' ').filter(Boolean);
    return currentAddresses.filter(function (address) {
      var source = normalize(address);
      return parts.every(function (part) { return source.indexOf(part) !== -1; });
    });
  }
  function renderSuggestions(items, limit) {
    suggestions.innerHTML = '';
    if (!items.length) {
      suggestions.classList.remove('is-open');
      map.classList.remove('is-suggestions-open');
      return;
    }
    items.slice(0, limit || 12).forEach(function (address) {
      var item = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = address;
      btn.addEventListener('click', function () {
        addressInput.value = address;
        suggestions.classList.remove('is-open');
        map.classList.remove('is-suggestions-open');
        status.textContent = 'Сможем привезти кофе с доставкой за час.';
        status.className = 'sc-address-status is-ok';
      });
      item.appendChild(btn);
      suggestions.appendChild(item);
    });
    suggestions.classList.add('is-open');
    map.classList.add('is-suggestions-open');
    updateHeroHeight();
  }

  if (city && district && form && map && mapFrame && addressInput && suggestions && status) {
    fillCities();
    fillDistricts('');
    city.addEventListener('change', function () { fillDistricts(city.value); });
    district.addEventListener('change', function () { resetAddress(); hideMap(); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!city.value || !district.value) return;
      showMap();
    });
    addressInput.addEventListener('input', function () {
      status.textContent = '';
      status.className = 'sc-address-status';
      renderSuggestions(filterAddresses(addressInput.value), 12);
    });
    addressInput.addEventListener('focus', function () {
      if (!currentAddresses.length) return;
      renderSuggestions(filterAddresses(addressInput.value), 12);
    });
    if (addressClear) addressClear.addEventListener('click', resetAddress);
    if (addressToggle) addressToggle.addEventListener('click', function () {
      if (suggestions.classList.contains('is-open')) {
        suggestions.classList.remove('is-open');
        map.classList.remove('is-suggestions-open');
      } else if (currentAddresses.length) {
        renderSuggestions(filterAddresses(addressInput.value), 12);
      }
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.sc-map__search')) {
        suggestions.classList.remove('is-open');
        map.classList.remove('is-suggestions-open');
      }
    });
    window.addEventListener('resize', updateHeroHeight);
  }

  document.querySelectorAll('[data-sc-drink]').forEach(function (card) {
    card.addEventListener('click', function (event) {
      if (!event.target.closest('[data-sc-flip]') && card.classList.contains('is-flipped')) return;
      document.querySelectorAll('[data-sc-drink].is-flipped').forEach(function (other) {
        if (other !== card) other.classList.remove('is-flipped');
      });
      card.classList.toggle('is-flipped');
    });
    card.querySelectorAll('[data-sc-flip]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        document.querySelectorAll('[data-sc-drink].is-flipped').forEach(function (other) {
          if (other !== card) other.classList.remove('is-flipped');
        });
        card.classList.toggle('is-flipped');
      });
    });
  });

  document.querySelectorAll('.sc-faq-question').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.sc-faq-item');
      if (item) item.classList.toggle('is-open');
    });
  });
})();
