(function () {
  const host = document.querySelector('.hero-three-scene');

  if (!host || typeof THREE === 'undefined') {
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060b12, 0.03);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 1000);
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const count = 26000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.pow(Math.random(), 0.38);
    const radius = 2 + spread * 14.5;

    const x = Math.cos(angle) * radius * (1.2 + Math.sin(angle * 2.2) * 0.5);
    const y = (Math.random() - 0.5) * 14.5 + Math.sin(angle * 1.8) * 4.4;
    const z = Math.sin(angle) * radius * (0.85 + Math.cos(angle * 5) * 0.48);

    positions[i3] = x * 1.75 + (Math.random() - 0.5) * 0.8;
    positions[i3 + 1] = y * 1.3 + (Math.random() - 0.5) * 0.9;
    positions[i3 + 2] = z * 1.85 + (Math.random() - 0.5) * 1.1;

    const edge = Math.min(1, Math.max(0, (x + 5.4) / 12));

    let r = 0.82;
    let g = 0.9;
    let b = 1;

    if (x < 0) {
      r = 0.22 + edge * 0.68;
      g = 0.6 + edge * 0.34;
      b = 1;
    } else if (x < 5.8) {
      r = 0.96;
      g = 0.96;
      b = 1 - (edge - 0.2) * 0.8;
    } else {
      r = 1;
      g = 0.7 + (edge - 0.72) * 0.5;
      b = 0.16 + (edge - 0.72) * 0.9;
    }

    if (Math.random() > 0.995) {
      r = 1;
      g = 0.9;
      b = 0.65;
    }

    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.065,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const cloud = new THREE.Points(geometry, material);
  cloud.position.set(12, 0.2, -2.2);
  cloud.rotation.set(1.0, 0.18, -0.12);
  cloud.scale.set(5.2, 4.8, 3.7);
  group.add(cloud);

  const dustCount = 1000;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const i3 = i * 3;
    dustPositions[i3] = (Math.random() - 0.5) * 30;
    dustPositions[i3 + 1] = (Math.random() - 0.5) * 20;
    dustPositions[i3 + 2] = (Math.random() - 0.5) * 24;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    size: 0.028,
    color: 0xdeeeff,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function resizeRenderer() {
    const { clientWidth, clientHeight } = host;
    if (!clientWidth || !clientHeight) {
      return;
    }

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }

  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();

  function animate() {
    const t = performance.now() * 0.001;

    group.rotation.y = 0.18 + t * 0.035;
    group.rotation.x = 0.52 + Math.sin(t * 0.6) * 0.05;
    group.rotation.z = Math.sin(t * 0.32) * 0.06;

    cloud.position.y = 0.25 + Math.sin(t * 0.5) * 0.35;
    cloud.position.x = 12 + Math.cos(t * 0.26) * 0.28;
    cloud.rotation.y = 0.18 + t * 0.04;
    cloud.rotation.z = Math.sin(t * 0.35) * 0.1;

    dust.rotation.y = t * 0.015;
    dust.rotation.x = t * 0.012;

    camera.position.x += ((mouse.x * 1.2) - camera.position.x) * 0.015;
    camera.position.y += ((mouse.y * 0.45) - camera.position.y) * 0.015;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
})();
