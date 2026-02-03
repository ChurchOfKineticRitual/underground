import * as THREE from 'three';

export async function loadVictoriaShafts() {
  const res = await fetch('/data/victoria/shafts.json', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export function addShaftsToScene({ scene, shaftsData, colour = 0x0098d4 } = {}) {
  if (!shaftsData?.shafts?.length) return null;

  const group = new THREE.Group();
  group.userData.kind = 'victoria-shafts';

  const cubeSize = 18; // metres in our scene
  const platformGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const groundGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  const platformMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(colour),
    emissiveIntensity: 0.65,
    roughness: 0.35,
  });
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.08,
    roughness: 0.6,
    transparent: true,
    opacity: 0.9,
  });

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
  });

  for (const s of shaftsData.shafts) {
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(s.x, s.platformY, s.z);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(s.x, s.groundY, s.z);

    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(s.x, s.groundY, s.z),
      new THREE.Vector3(s.x, s.platformY, s.z),
    ]);
    const link = new THREE.Line(geom, lineMat);

    group.add(link, platform, ground);
  }

  scene.add(group);
  return {
    group,
    dispose() {
      scene.remove(group);
      platformGeo.dispose();
      groundGeo.dispose();
      platformMat.dispose();
      groundMat.dispose();
      lineMat.dispose();
      for (const obj of group.children) {
        if (obj.geometry) obj.geometry.dispose?.();
      }
    }
  };
}
