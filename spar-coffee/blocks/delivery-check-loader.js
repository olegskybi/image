(function () {
  if (window.SPAR_COFFEE_DELIVERY_LOADER_READY) return;
  window.SPAR_COFFEE_DELIVERY_LOADER_READY = true;

  var base = 'https://cdn.jsdelivr.net/gh/olegskybi/image@main/spar-coffee/';
  var files = [
    'data/areas-and-maps.js',
    'data/addresses-nizhniy-novgorod-nizhegorodskiy-rayon.js',
    'data/addresses-nizhniy-novgorod-avtozavodskiy-rayon.js',
    'data/addresses-nizhniy-novgorod-sovetskiy-rayon.js',
    'data/addresses-moskva-rayon-arbat.js',
    'data/addresses-moskva-obruchevskiy-rayon.js',
    'data/addresses-moskva-rayon-preobrazhenskoe.js',
    'data/addresses-moskva-rayon-orehovo-borisovo-yuzhnoe.js',
    'data/addresses-moskva-danilovskiy-rayon.js',
    'data/addresses-sankt-peterburg-centralnyy-rayon.js',
    'data/addresses-sankt-peterburg-vyborgskiy-rayon.js',
    'data/addresses-sankt-peterburg-petrogradskiy-rayon.js',
    'data/addresses-sankt-peterburg-sestroreck.js',
    'data/addresses-kazan-novo-savinovskiy-rayon.js',
    'data/addresses-kazan-vahitovskiy-rayon.js',
    'data/addresses-kazan-sovetskiy-rayon.js',
    'blocks/delivery-check-runtime.js'
  ];

  function loadNext(index) {
    if (index >= files.length) return;
    var script = document.createElement('script');
    script.src = base + files[index];
    script.async = false;
    script.onload = function () {
      loadNext(index + 1);
    };
    script.onerror = function () {
      console.error('SPAR Coffee delivery script failed:', script.src);
      loadNext(index + 1);
    };
    document.head.appendChild(script);
  }

  loadNext(0);
})();
