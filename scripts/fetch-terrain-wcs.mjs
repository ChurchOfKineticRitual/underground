#!/usr/bin/env node
/**
 * Fetch EA LiDAR DTM via WCS for London Underground coverage area.
 * 
 * The full network spans roughly:
 * - West: Amersham (approx 490000, 195000)
 * - East: Epping (approx 545000, 190000)
 * - North: Amersham/High Barnet (approx 530000, 195000)
 * - South: Morden (approx 525000, 165000)
 * 
 * We'll fetch a 100km x 100km bounding box centred on London.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const WCS_URL = 'https://environment.data.gov.uk/spatialdata/lidar-composite-dtm-1m/wcs';
const OUT_DIR = 'data/sources/ea_wcs';

// EA LiDAR tiles are 5km x 5km in British National Grid (EPSG:27700)
// We'll fetch a grid covering the main Underground network

// Centre: Trafalgar Square ~ (530000, 180000)
// Extend: ±40km should cover the entire network
const BOUNDS = {
  xmin: 490000,  // West: Amersham area
  xmax: 560000,  // East: Epping/Romford area  
  ymin: 155000,  // South: Morden/Croydon
  ymax: 205000,  // North: High Barnet/Amersham
};

const TILE_SIZE = 5000; // 5km tiles

function makeWCSRequest({ xmin, ymin, xmax, ymax }) {
  const params = new URLSearchParams({
    SERVICE: 'WCS',
    VERSION: '2.0.1',
    REQUEST: 'GetCoverage',
    COVERAGEID: 'LIDAR_Composite_DTM_1m',
    SUBSET: `x(${xmin},${xmax})`,
    SUBSET: `y(${ymin},${ymax})`,
    FORMAT: 'image/tiff',
    SCALEFACTOR: '0.5', // Downsample to 2m for smaller files
  });
  
  // WCS 2.0 uses multiple SUBSET params differently
  return `${WCS_URL}?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=LIDAR_Composite_DTM_1m&SUBSET=x(${xmin},${xmax})&SUBSET=y(${ymin},${ymax})&FORMAT=image/tiff&SCALEFACTOR=0.5`;
}

async function fetchTile(xmin, ymin, xmax, ymax, outPath) {
  const url = makeWCSRequest({ xmin, ymin, xmax, ymax });
  console.log('Fetching:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch tile ${xmin},${ymin}: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outPath, Buffer.from(buffer));
    console.log('Wrote:', outPath, `(${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (err) {
    console.error(`Error fetching tile ${xmin},${ymin}:`, err.message);
    return false;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  
  // For the full network, let's fetch a single large coverage
  // The WCS service may have limits, so we'll try a 70km x 50km area first
  const tiles = [];
  
  // Simplified: fetch a single tile covering central + outer London
  // This should cover most of the network
  const centralTile = {
    name: 'london_central_70km',
    xmin: 490000,
    ymin: 155000,
    xmax: 560000,
    ymax: 205000,
  };
  
  console.log('Fetching London-wide DTM coverage...');
  console.log('Bounds:', centralTile);
  
  const outPath = path.join(OUT_DIR, `${centralTile.name}.tif`);
  const success = await fetchTile(
    centralTile.xmin,
    centralTile.ymin,
    centralTile.xmax,
    centralTile.ymax,
    outPath
  );
  
  if (success) {
    console.log('\nSuccess! Wrote terrain tile to:', outPath);
    console.log('Run the build-heightmap script to convert to PNG/JSON');
  } else {
    console.error('\nFailed to fetch terrain. The EA WCS service may be unavailable or rate-limited.');
    console.log('\nAlternative: Download manually from:');
    console.log('https://environment.data.gov.uk/dataset/13787b9a-26a4-4775-8523-806d13af58fc');
  }
}

main().catch(console.error);
