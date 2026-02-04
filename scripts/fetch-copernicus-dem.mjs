#!/usr/bin/env node
/**
 * Fetch Copernicus DEM 30m for London from AWS S3.
 * 
 * London bounds (approx):
 * - Latitude: 51.2°N to 51.8°N
 * - Longitude: -0.8°W to 0.4°E (WGS84)
 * 
 * Copernicus DEM uses a tiled structure based on latitude/longitude.
 * Tiles are named: COP30_hh_hh_vv_vv.tif where hh=latitude, vv=longitude
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const S3_BUCKET = 'copernicus-dem-30m';
const OUT_DIR = 'data/sources/copernicus_dem_30m';

// London area in WGS84
const BOUNDS = {
  latMin: 51.2,
  latMax: 51.8,
  lonMin: -0.8,
  lonMax: 0.4,
};

function getTileName(lat, lon) {
  // Copernicus DEM tiles are 1° x 1°
  // Naming format: Copernicus_DSM_COG_10_N51_00_W001_00_DEM.tif
  const latInt = Math.floor(lat);
  const lonInt = Math.floor(lon);
  const latStr = latInt >= 0 ? `N${String(latInt).padStart(2, '0')}` : `S${String(Math.abs(latInt)).padStart(2, '0')}`;
  const latDec = '00'; // Always 00 for 1-degree tiles
  const lonStr = lonInt >= 0 
    ? `E${String(lonInt).padStart(3, '0')}` 
    : `W${String(Math.abs(lonInt)).padStart(3, '0')}`;
  const lonDec = '00';
  return `Copernicus_DSM_COG_10_${latStr}_${latDec}_${lonStr}_${lonDec}_DEM.tif`;
}

function getTileUrl(filename) {
  // Copernicus DEM tiles are in folders like:
  // Copernicus_DSM_COG_10_N51_00_W001_00_DEM/Copernicus_DSM_COG_10_N51_00_W001_00_DEM.tif
  const baseName = filename.replace('.tif', '');
  const folderName = baseName.replace(/^(Copernicus_DSM_COG_10_[NS]\d+_[\d]+_[EW]\d+_[\d]+)_DEM$/, '$1_DEM');
  return `https://${S3_BUCKET}.s3.amazonaws.com/${folderName}/${filename}`;
}

async function fetchTile(filename) {
  const url = getTileUrl(filename);
  const outPath = path.join(OUT_DIR, filename);
  
  console.log('Fetching:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outPath, Buffer.from(buffer));
    console.log('Wrote:', outPath, `(${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (err) {
    console.error(`Error fetching ${filename}:`, err.message);
    return false;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  
  // Determine which tiles we need
  const tiles = new Set();
  for (let lat = Math.floor(BOUNDS.latMin); lat <= Math.floor(BOUNDS.latMax); lat++) {
    for (let lon = Math.floor(BOUNDS.lonMin); lon <= Math.floor(BOUNDS.lonMax); lon++) {
      tiles.add(getTileName(lat, lon));
    }
  }
  
  console.log('London area requires', tiles.size, 'Copernicus DEM 30m tiles:');
  for (const tile of tiles) {
    console.log('  -', tile);
  }
  console.log();
  
  // Fetch each tile
  let successCount = 0;
  for (const tile of tiles) {
    const success = await fetchTile(tile);
    if (success) successCount++;
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nFetched ${successCount}/${tiles.size} tiles`);
  console.log('Output directory:', OUT_DIR);
  
  if (successCount === tiles.size) {
    console.log('\nNext steps:');
    console.log('1. Convert to PNG/JSON: node scripts/build-heightmap.mjs --src data/sources/copernicus_dem_30m --out data/terrain/london_wide');
  }
}

main().catch(console.error);
