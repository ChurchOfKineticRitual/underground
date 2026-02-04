# Terrain Processing Guide

Processing terrain heightmaps for the UnderGround 3D visualiser.

## Quick Start (M5 MacBook Pro)

```bash
# 1. Clone repo
git clone https://github.com/progress-agent/underground.git
cd underground

# 2. Install GDAL (one-time)
brew install gdal

# 3. Fetch terrain tiles (or use pre-downloaded)
node scripts/fetch-copernicus-dem.mjs

# 4. Process to PNG/JSON
node scripts/build-heightmap.mjs --src data/sources/copernicus_dem_30m --out data/terrain/london_full --tr 10
```

## Scripts

### fetch-copernicus-dem.mjs
Downloads Copernicus DEM 30m tiles from AWS S3 for London area.

**Output:** `data/sources/copernicus_dem_30m/*.tif`

**Already included in repo:** 2 tiles (60MB) covering London.

### build-heightmap.mjs
Converts GeoTIFF(s) to PNG heightmap + JSON metadata for Three.js.

**Usage:**
```bash
node scripts/build-heightmap.mjs --src <input> --out <output> [--tr <resolution>]
```

**Options:**
- `--src`: Input file or directory (GeoTIFF/VRT)
- `--out`: Output base path (creates `.png` and `.json`)
- `--tr`: Target resolution in metres (default: 10)

**Examples:**
```bash
# Central London only (fastest)
node scripts/build-heightmap.mjs --src data/sources/copernicus_dem_30m --out data/terrain/central --tr 30

# Full network at 10m resolution (best quality, ~10 min on M5)
node scripts/build-heightmap.mjs --src data/sources/copernicus_dem_30m --out data/terrain/london_full --tr 10
```

## Time Estimates (M5 MacBook Pro)

| Coverage | Resolution | Est. Time |
|----------|------------|-----------|
| Central London | 30m | 1-2 min |
| Central London | 10m | 2-3 min |
| Full Underground network | 30m | 5-10 min |
| Full Underground network | 10m | 10-15 min |

## Output Files

After processing, you'll have:
- `data/terrain/<name>.png` — Grayscale heightmap (PNG)
- `data/terrain/<name>.json` — Bounds, scale, resolution metadata

## Integration

The terrain loader (`src/terrain.js`) expects:
- PNG path: `public/data/terrain/<name>.png`
- JSON path: `public/data/terrain/<name>.json`

Copy processed files to `public/data/terrain/` and update `TERRAIN_CONFIG` in `src/terrain.js`.

## VPS vs M5 Performance

| Machine | Central London (10m) | Full Network (10m) |
|---------|---------------------|-------------------|
| Hetzner VPS (2-core) | 30-60 min | Hours (times out) |
| M5 MacBook Pro | 2-3 min | 10-15 min |

The VPS lacks RAM for large GDAL operations; M5 unified memory + fast SSD makes this trivial.

## Troubleshooting

**gdalwarp hangs/times out:**
- Reduce resolution: `--tr 30` instead of `--tr 10`
- Process on M5 MacBook instead
- Use smaller input area

**"GDAL not found":**
```bash
brew install gdal
# Or for Linux:
# apt-get install gdal-bin
```

## Data Sources

- **Copernicus DEM 30m**: `s3://copernicus-dem-30m/` (free, global)
- **EA LiDAR 1m/2m**: `environment.data.gov.uk` (UK only, higher res)

Copernicus 30m is sufficient for London Underground visualization; 1m LiDAR would be overkill.
