(function() {
  'use strict';

  var container = document.getElementById('panorama-container');
  if (!container) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0.1);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  var geometry = new THREE.SphereGeometry(500, 60, 40);
  var textureLoader = new THREE.TextureLoader();
  var material = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.BackSide
  });
  var sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  textureLoader.load(
    'assets/panorama_bunker.png',
    function(texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    function(err) {
      console.warn('Фоновая панорама не загружена, используется резервная заливка.');
    }
  );

  var canvas = renderer.domElement;

  var isUserInteracting = false;
  var onPointerDownMouseX = 0, onPointerDownMouseY = 0;
  var lon = 0, onPointerDownLon = 0;
  var lat = 0, onPointerDownLat = 0;
  var phi = 0, theta = 0;
  var targetPhi = 0, targetTheta = 0;
  var friction = 0.075;

  function onPointerDown(event) {
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
    lon = onPointerDownLon + (clientX - onPointerDownMouseX) * 0.15;
    lat = onPointerDownLat - (clientY - onPointerDownMouseY) * 0.15;
    lat = Math.max(-85, Math.min(85, lat));
  }

  function onPointerUp(event) {
    isUserInteracting = false;
  }

  canvas.addEventListener('mousedown', onPointerDown, { passive: false });
  canvas.addEventListener('mousemove', onPointerMove, { passive: false });
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('touchcancel', onPointerUp);

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    targetPhi = THREE.MathUtils.degToRad(lat);
    targetTheta = THREE.MathUtils.degToRad(lon);

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
