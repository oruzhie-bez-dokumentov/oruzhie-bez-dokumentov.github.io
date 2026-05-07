(function() {
    'use strict';

    let scene, camera, renderer, sphere;
    let isUserInteracting = false;
    let onMouseDownMouseX = 0, onMouseDownMouseY = 0;
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;
    let targetPhi = 0, targetTheta = 0;
    const fov = 75;
    const near = 0.1;
    const far = 1000;

    function initPanorama() {
        const container = document.getElementById('panorama-container');
        if (!container || typeof THREE === 'undefined') return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);
        camera.position.set(0, 0, 0.1);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(100, 128, 128);
        const textureLoader = new THREE.TextureLoader();
        const textureUrl = 'assets/panorama_bunker.png';

        const material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(textureUrl, undefined, undefined, function(err) {
                console.warn('Текстура панорамы не загружена, используется резервный цвет');
                material.map = null;
                material.color = new THREE.Color(0x1a1a1a);
                material.needsUpdate = true;
            }),
            side: THREE.BackSide
        });

        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        container.addEventListener('mousedown', onPointerDown, false);
        container.addEventListener('mousemove', onPointerMove, false);
        container.addEventListener('mouseup', onPointerUp, false);
        container.addEventListener('touchstart', onPointerDown, { passive: false });
        container.addEventListener('touchmove', onPointerMove, { passive: false });
        container.addEventListener('touchend', onPointerUp, false);
        container.addEventListener('wheel', onDocumentMouseWheel, { passive: false });
        window.addEventListener('resize', onWindowResize, false);

        animate();
    }

    function onPointerDown(event) {
        event.preventDefault();
        isUserInteracting = true;
        const clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
        const clientY = event.clientY || (event.touches && event.touches[0].clientY) || 0;
        onMouseDownMouseX = clientX;
        onMouseDownMouseY = clientY;
        targetPhi = phi;
        targetTheta = theta;
    }

    function onPointerMove(event) {
        if (!isUserInteracting) return;
        event.preventDefault();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
        const clientY = event.clientY || (event.touches && event.touches[0].clientY) || 0;
        const deltaX = clientX - onMouseDownMouseX;
        const deltaY = clientY - onMouseDownMouseY;
        targetPhi = phi + deltaX * 0.3;
        targetTheta = theta - deltaY * 0.3;
        targetTheta = Math.max(-85, Math.min(85, targetTheta));
    }

    function onPointerUp() {
        isUserInteracting = false;
    }

    function onDocumentMouseWheel(event) {
        event.preventDefault();
    }

    function onWindowResize() {
        const container = document.getElementById('panorama-container');
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        if (!sphere || !camera) return;
        requestAnimationFrame(animate);

        const lerpFactor = 0.1;
        phi += (targetPhi - phi) * lerpFactor;
        theta += (targetTheta - theta) * lerpFactor;

        const latRad = THREE.MathUtils.degToRad(theta);
        const lonRad = THREE.MathUtils.degToRad(phi);
        const lookAtX = Math.cos(latRad) * Math.cos(lonRad);
        const lookAtY = Math.sin(latRad);
        const lookAtZ = Math.cos(latRad) * Math.sin(lonRad);
        camera.lookAt(lookAtX, lookAtY, lookAtZ);

        renderer.render(scene, camera);
    }

    window.addEventListener('load', function() {
        if (typeof THREE !== 'undefined') {
            initPanorama();
        } else {
            const checkThree = setInterval(function() {
                if (typeof THREE !== 'undefined') {
                    clearInterval(checkThree);
                    initPanorama();
                }
            }, 100);
            setTimeout(function() { clearInterval(checkThree); }, 10000);
        }
    });

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href="tg://resolve?domain=Bunker24_7"]');
        if (link) {
            if (typeof navigator.sendBeacon === 'function') {
                const data = new URLSearchParams();
                data.append('event', 'telegram_click');
                data.append('page', window.location.pathname);
                navigator.sendBeacon('/analytics', data);
            }
        }
    });

})();