(function() {
  'use strict';

  var container = document.getElementById('panorama-container');
  if (!container) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0.1);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Сфера с резервным цветом
  var geometry = new THREE.SphereGeometry(500, 60, 40);
  var material = new THREE.MeshBasicMaterial({
    color: 0x1a1a1a,
    side: THREE.BackSide
  });
  var sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Загрузка текстуры
  new THREE.TextureLoader().load(
    'assets/panorama_bunker.png',
    function(texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    function() {
      console.warn('Панорама не загружена, показываем тёмный фон.');
    }
  );

  // Состояния
  var isUserInteracting = false,
      onPointerDownMouseX = 0,
      onPointerDownMouseY = 0,
      lon = 0,
      onPointerDownLon = 0,
      lat = 0,
      onPointerDownLat = 0,
      phi = 0,
      theta = 0;

  var friction = 0.04;   // Уменьшено для плавности
  var sensitivity = 0.15; // Чувствительность мыши

  function isInteractiveElement(target) {
    return target.closest('a, button, input, select, textarea');
  }

  function onPointerDown(event) {
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
    var clientX, clientY;
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    isUserInteracting = true;
    onPointerDownMouseX = clientX;
    onPointerDownMouseY = clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
  }

  function onPointerMove(event) {
    if (!isUserInteracting) return;
    event.preventDefault();
    var clientX, clientY;
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    lon = onPointerDownLon + (clientX - onPointerDownMouseX) * sensitivity;
    lat = onPointerDownLat - (clientY - onPointerDownMouseY) * sensitivity;
    lat = Math.max(-85, Math.min(85, lat));
  }

  function onPointerUp(event) {
    if (event && isInteractiveElement(event.target)) return;
    isUserInteracting = false;
  }

  function onWheel(event) {
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
  }

  document.addEventListener('mousedown', onPointerDown, { passive: false });
  document.addEventListener('mousemove', onPointerMove, { passive: false });
  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('mouseleave', onPointerUp);
  document.addEventListener('touchstart', onPointerDown, { passive: false });
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);
  document.addEventListener('touchcancel', onPointerUp);
  document.addEventListener('wheel', onWheel, { passive: false });

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    var targetPhi = THREE.MathUtils.degToRad(lat);
    var targetTheta = THREE.MathUtils.degToRad(lon);

    phi += (targetPhi - phi) * friction;
    theta += (targetTheta - theta) * friction;

    camera.position.x = 500 * Math.sin(phi) * Math.sin(theta);
    camera.position.y = 500 * Math.cos(phi);
    camera.position.z = 500 * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);
  }

  animate();
})();
