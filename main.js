(function() {
  'use strict';

  var container = document.querySelector('.panorama-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'panorama-container';
    document.body.prepend(container);
  }

  var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var canvas, renderer, scene, camera, sphere, textureLoader;
  var animationId = null;
  var lon = 0, lat = 0;
  var isUserInteracting = false;
  var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
  var onMouseDownLon = 0, onMouseDownLat = 0;
  var prevTouchX = 0, prevTouchY = 0;

  function initPanorama() {
    textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/bunker.png', function(texture) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 0);

      var geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      var material = new THREE.MeshBasicMaterial({ map: texture });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: false,
        antialias: true 
      });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);

      canvas.style.display = 'block';
      container.appendChild(canvas);

      updateCamera();
    }, undefined, function(error) {
      console.error('Failed to load panorama texture:', error);
      container.remove();
    });
  }

  function animate() {
    if (isUserInteracting) {
      lon = (onMouseDownLon + (onMouseDownMouseX - (prevTouchX || onMouseDownMouseX)) * 0.1) % 360;
      lat = Math.max(-85, Math.min(85, onMouseDownLat + ((prevTouchY || onMouseDownMouseY) - onMouseDownMouseY) * 0.1));
    } else {
      lon += 0.03;
    }
    updateCamera();
    renderer.render(scene, camera);
  }

  function updateCamera() {
    var phi = THREE.MathUtils.degToRad(90 - lat);
    var theta = THREE.MathUtils.degToRad(lon);
    var target = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(target);
  }

  function onMouseDown(event) {
    event.preventDefault();
    isUserInteracting = true;
    onMouseDownMouseX = event.clientX;
    onMouseDownMouseY = event.clientY;
    onMouseDownLon = lon;
    onMouseDownLat = lat;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event) {
    if (isUserInteracting) {
      prevTouchX = event.clientX;
      prevTouchY = event.clientY;
    }
  }

  function onMouseUp() {
    isUserInteracting = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
      isUserInteracting = true;
      onMouseDownMouseX = event.touches[0].clientX;
      onMouseDownMouseY = event.touches[0].clientY;
      onMouseDownLon = lon;
      onMouseDownLat = lat;
      prevTouchX = event.touches[0].clientX;
      prevTouchY = event.touches[0].clientY;
    }
  }

  function onTouchMove(event) {
    event.preventDefault();
    if (isUserInteracting && event.touches.length === 1) {
      prevTouchX = event.touches[0].clientX;
      prevTouchY = event.touches[0].clientY;
    }
  }

  function onTouchEnd(event) {
    isUserInteracting = false;
  }

  function onWheel(event) {
    event.preventDefault();
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

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('wheel', onWheel, { passive: false });
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