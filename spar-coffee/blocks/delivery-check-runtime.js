(function () {
  var root = document.getElementById('spar-coffee-delivery');
  if (!root || root.dataset.scdReady === 'true') return;
  root.dataset.scdReady = 'true';

  var areas = window.SPAR_COFFEE_AREAS || {};
  var deliveryAddresses = window.SPAR_COFFEE_ADDRESSES || {};
  var mapConstructors = window.SPAR_COFFEE_MAPS || {};

  var form = root.querySelector('[data-scd-form]');
  var city = root.querySelector('[data-scd-city]');
  var district = root.querySelector('[data-scd-district]');
  var districtField = root.querySelector('[data-scd-district-field]');
  var map = root.querySelector('[data-scd-map]');
  var mapFrame = root.querySelector('[data-scd-map-frame]');
  var addressInput = root.querySelector('[data-scd-address-input]');
  var addressClear = root.querySelector('[data-scd-address-clear]');
  var addressToggle = root.querySelector('[data-scd-address-toggle]');
  var suggestions = root.querySelector('[data-scd-suggestions]');
  var status = root.querySelector('[data-scd-address-status]');
  var currentKey = '';
  var currentAddresses = [];
  var mapObserver = null;

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^а-яa-z0-9]+/g, ' ')
      .trim();
  }

  function addOption(select, label, value) {
    select.add(new Option(label, value));
  }

  function resetAddress() {
    if (!addressInput || !suggestions || !status || !map) return;
    addressInput.value = '';
    suggestions.innerHTML = '';
    suggestions.classList.remove('is-open');
    status.textContent = '';
    status.className = 'scd-address-status';
  }

  function hideMap() {
    if (!map || !mapFrame) return;
    map.classList.remove('is-visible', 'is-loading');
    mapFrame.innerHTML = '';
    if (mapObserver) {
      mapObserver.disconnect();
      mapObserver = null;
    }
  }

  function fillCities() {
    if (!city) return;
    city.innerHTML = '';
    addOption(city, 'Выберите город', '');
    Object.keys(areas).forEach(function (name) {
      addOption(city, name, name);
    });
  }

  function fillDistricts(cityName) {
    if (!district || !districtField) return;
    district.innerHTML = '';
    addOption(district, 'Выберите район', '');
    (areas[cityName] || []).forEach(function (name) {
      addOption(district, name, name);
    });
    district.disabled = !cityName;
    districtField.classList.toggle('is-disabled', !cityName);
    resetAddress();
    hideMap();
  }

  function renderFallbackMap() {
    map.classList.remove('is-loading');
    mapFrame.innerHTML = '<div class="scd-fallback-map">Карта для выбранного района пока не подключена.</div>';
  }

  function renderMapLoader() {
    map.classList.add('is-loading');
    mapFrame.innerHTML = '<div class="scd-map-loader" data-scd-map-loader><span>Загружаем карту</span></div>';
  }

  function showLoadedMap() {
    if (!map.classList.contains('is-loading')) return;
    if (!mapFrame.querySelector('ymaps, iframe')) return;
    map.classList.remove('is-loading');
    var loader = mapFrame.querySelector('[data-scd-map-loader]');
    if (loader) loader.remove();
  }

  function showMap() {
    currentKey = city.value + '|' + district.value;
    currentAddresses = deliveryAddresses[currentKey] || [];
    map.classList.add('is-visible');
    resetAddress();
    renderMapLoader();

    if (mapObserver) mapObserver.disconnect();

    if (mapConstructors[currentKey]) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.async = true;
      script.src = mapConstructors[currentKey];
      script.onerror = renderFallbackMap;
      mapFrame.appendChild(script);

      mapObserver = new MutationObserver(function () {
        window.setTimeout(showLoadedMap, 250);
      });
      mapObserver.observe(mapFrame, { childList: true, subtree: true });

      window.setTimeout(function () {
        showLoadedMap();
        if (mapObserver) {
          mapObserver.disconnect();
          mapObserver = null;
        }
      }, 5000);
    } else {
      renderFallbackMap();
    }
  }

  function filterAddresses(query) {
    var normalized = normalize(query);
    if (!normalized) return currentAddresses;
    var parts = normalized.split(' ').filter(Boolean);
    return currentAddresses.filter(function (address) {
      var source = normalize(address);
      return parts.every(function (part) {
        return source.indexOf(part) !== -1;
      });
    });
  }

  function setStatusForAddress(value) {
    var exact = normalize(value);
    if (!exact) {
      status.textContent = '';
      status.className = 'scd-address-status';
      return;
    }

    var found = currentAddresses.some(function (address) {
      return normalize(address) === exact;
    });

    if (found) {
      status.textContent = 'Сможем привезти кофе с доставкой за час.';
      status.className = 'scd-address-status is-ok';
    } else {
      status.textContent = 'К сожалению, данный адрес не входит в зону доставки кофе за час.';
      status.className = 'scd-address-status is-bad';
    }
  }

  function closeSuggestions() {
    suggestions.classList.remove('is-open');
  }

  function renderSuggestions(items) {
    suggestions.innerHTML = '';

    if (!items.length) {
      closeSuggestions();
      return;
    }

    items.forEach(function (address) {
      var item = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = address;
      button.addEventListener('click', function () {
        addressInput.value = address;
        closeSuggestions();
        setStatusForAddress(address);
      });
      item.appendChild(button);
      suggestions.appendChild(item);
    });

    suggestions.classList.add('is-open');
  }

  if (!form || !city || !district || !districtField || !map || !mapFrame || !addressInput || !suggestions || !status) {
    return;
  }

  fillCities();
  fillDistricts('');

  city.addEventListener('change', function () {
    fillDistricts(city.value);
  });

  district.addEventListener('change', function () {
    resetAddress();
    hideMap();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!city.value || !district.value) return;
    showMap();
  });

  addressInput.addEventListener('input', function () {
    status.textContent = '';
    status.className = 'scd-address-status';
    renderSuggestions(filterAddresses(addressInput.value));
  });

  addressInput.addEventListener('focus', function () {
    if (!currentAddresses.length) return;
    renderSuggestions(filterAddresses(addressInput.value));
  });

  addressInput.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    closeSuggestions();
    setStatusForAddress(addressInput.value);
  });

  if (addressClear) {
    addressClear.addEventListener('click', function () {
      resetAddress();
      addressInput.focus();
    });
  }

  if (addressToggle) {
    addressToggle.addEventListener('click', function () {
      if (!currentAddresses.length) return;
      if (suggestions.classList.contains('is-open')) {
        closeSuggestions();
      } else {
        renderSuggestions(filterAddresses(addressInput.value));
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (!root.contains(event.target)) return;
    if (!event.target.closest('[data-scd-search]')) closeSuggestions();
  });
})();
