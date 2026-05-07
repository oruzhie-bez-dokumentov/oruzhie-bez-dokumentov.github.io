(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Panorama disabled.');
    return;
  }

  const container = document.querySelector('.panorama-container');
  if (!container) return;

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let canvas, renderer, scene, camera, sphere;
  let animationId = null;
  let lon = 0,
    lat = 0;
  let isUserInteracting = false;
  let onMouseDownMouseX = 0,
    onMouseDownMouseY = 0;
  let onMouseDownLon = 0,
    onMouseDownLat = 0;
  let prevTouchX = 0,
    prevTouchY = 0;

  function initPanorama() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'assets/bunker.png',
      function (texture) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 0);

        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: false,
          antialias: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animate);

        canvas.style.display = 'block';
        container.appendChild(canvas);

        updateCamera();
      },
      undefined,
      function () {
        console.error('Failed to load panorama texture.');
        container.remove();
      }
    );
  }

  function animate() {
    if (!isUserInteracting) {
      lon += 0.03;
    }
    updateCamera();
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function updateCamera() {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    const target = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(target);
  }

  function onMouseDown(e) {
    e.preventDefault();
    isUserInteracting = true;
    onMouseDownMouseX = e.clientX;
    onMouseDownMouseY = e.clientY;
    onMouseDownLon = lon;
    onMouseDownLat = lat;
  }

  function onMouseMove(e) {
    if (!isUserInteracting) return;
    e.preventDefault();
    const clientX = e.clientX;
    const clientY = e.clientY;
    lon = onMouseDownLon + (clientX - onMouseDownMouseX) * 0.15;
    lat = onMouseDownLat - (clientY - onMouseDownMouseY) * 0.15;
    lat = Math.max(-85, Math.min(85, lat));
  }

  function onMouseUp() {
    isUserInteracting = false;
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    isUserInteracting = true;
    prevTouchX = e.touches[0].clientX;
    prevTouchY = e.touches[0].clientY;
    onMouseDownLon = lon;
    onMouseDownLat = lat;
  }

  function onTouchMove(e) {
    if (!isUserInteracting || e.touches.length !== 1) return;
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - prevTouchX;
    const deltaY = touchY - prevTouchY;
    lon -= deltaX * 0.15;
    lat += deltaY * 0.15;
    lat = Math.max(-85, Math.min(85, lat));
    prevTouchX = touchX;
    prevTouchY = touchY;
  }

  function onTouchEnd() {
    isUserInteracting = false;
  }

  function onWheel(e) {
    e.preventDefault();
  }

  function onResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    container.appendChild(canvas);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
  }

  function start() {
    setupCanvas();
    if (document.readyState === 'complete') {
      initPanorama();
    } else {
      window.addEventListener('load', initPanorama);
    }
  }

  start();
})();
