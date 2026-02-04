import * as THREE from 'three';

// River Thames data and rendering
// Coordinates are in EPSG:27700 (British National Grid)
// Need to convert to scene coordinates (local metres from origin)

// Approximate center of London in BNG for offset calculation
const LONDON_CENTER_BNG = { x: 530000, y: 180000 };

export async function loadThamesData() {
  try {
    const res = await fetch('/data/thames.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to load Thames data:', err);
    return null;
  }
}

// Convert BNG coordinates to scene coordinates
// Scene is centered at LONDON_CENTER_BNG with scale 1:1
export function bngToScene(easting, northing) {
  return {
    x: easting - LONDON_CENTER_BNG.x,
    y: 0, // River is at surface level
    z: -(northing - LONDON_CENTER_BNG.y), // Flip Z for Three.js
  };
}

export function createThamesMesh(thamesData, options = {}) {
  if (!thamesData?.points?.length) return null;
  
  const { 
    width = 200, // Average river width in metres
    color = 0x1d4ed8,
    opacity = 0.4,
    roughness = 0.08,
    metalness = 0.02,
  } = options;
  
  // Convert BNG points to scene coordinates
  const scenePoints = thamesData.points.map(([e, n]) => {
    const pos = bngToScene(e, n);
    return new THREE.Vector3(pos.x, pos.y, pos.z);
  });
  
  // Create smooth curve through points
  const curve = new THREE.CatmullRomCurve3(scenePoints);
  curve.curveType = 'catmullrom';
  curve.tension = 0.5;
  
  // River as a flat ribbon (tube flattened in Y)
  const segments = Math.max(200, scenePoints.length * 4);
  const tubeGeo = new THREE.TubeGeometry(curve, segments, width / 2, 12, false);
  
  // Flatten to create a river surface
  const positions = tubeGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // Flatten significantly and add subtle wave variation
    positions.setY(i, y * 0.05);
  }
  tubeGeo.computeVertexNormals();
  
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    roughness,
    metalness,
    emissive: new THREE.Color(0x0b1e5b),
    emissiveIntensity: 0.2,
    side: THREE.DoubleSide,
  });
  
  const mesh = new THREE.Mesh(tubeGeo, material);
  mesh.name = 'thamesRiver';
  
  // Store curve for potential animation or interaction
  mesh.userData = {
    curve,
    length: curve.getLength(),
    points: scenePoints,
  };
  
  return mesh;
}

// Create a simpler line representation for low-LOD
export function createThamesLine(thamesData, options = {}) {
  if (!thamesData?.points?.length) return null;
  
  const { color = 0x4a90d9, opacity = 0.6, linewidth = 2 } = options;
  
  const scenePoints = thamesData.points.map(([e, n]) => {
    const pos = bngToScene(e, n);
    return new THREE.Vector3(pos.x, pos.y, pos.z);
  });
  
  const curve = new THREE.CatmullRomCurve3(scenePoints);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    linewidth,
  });
  
  const line = new THREE.Line(geometry, material);
  line.name = 'thamesLine';
  
  return line;
}

// Get river width at a specific point (simplified - uses fixed width for now)
export function getThamesWidthAt(u) {
  // u is 0-1 along the river length
  // Could vary width based on position (wider downstream)
  // For now return average width
  return 200; // metres
}
