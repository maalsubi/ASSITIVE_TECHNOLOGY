# CAD component mapping — 2 November 2026

Both supplied STEP files were read with Open Cascade and preserved byte for byte in `blender/cad/`. The site renders their tessellated geometry. Blender applies one global 0.01 scale and one global center offset per assembly; individual source part positions are not normalized or rearranged. The scroll animation adds temporary offsets along the board normal (source CAD Z, web Y) and returns every group to its original position.

## Assistive module — `TSI REV3.step`

- Source copy: `blender/cad/TSI-REV3.step`; SHA-256 matches the supplied `/Users/maal/Downloads/TSI REV3.step` (`750f32d3…735fba68f2bec7342`).
- Source solids: **314**. All 314 were exported as individual STL meshes in `blender/cad/meshes/`; `manifest.json` lists every index. The web GLB is `client/public/assets/tsi-rev3-cad.glb`.
- The STEP product names include `TSI REV3`, two `Board` / `EasyEDA PCB Model` entries, `TOF`, switches, connectors, LEDs, passives and hardware. The index-to-function assignment for small individual solids is not established by those names alone.

| Web group | Source solid indices | Presentation interpretation |
| --- | --- | --- |
| `STEP solid 000` | 0 | One board-shaped solid |
| `STEP solid electronics` | 1–308 | Small visible electronic and mechanical geometry, merged for web performance |
| `STEP solid 309` | 309 | Second board-shaped solid |
| `STEP solid 310` | 310 | Lower enclosure geometry |
| `STEP solid 311` | 311 | Upper enclosure geometry |
| `STEP solid 312` | 312 | Larger visible detail; exact role unverified |
| `STEP solid 313` | 313 | Larger visible detail; exact role unverified |

The web separation keeps the original in-plane X/Z coordinates and moves the upper enclosure and board layers upward, the lower enclosure downward. This is a CAD presentation motion, not a verified physical assembly sequence. The shell opacity changes during separation so the real board geometry remains visible.

## Wearable — `TSI Wrist Band.step`

- Source copy: `blender/cad/TSI-Wrist-Band.step`; SHA-256 matches the supplied `/Users/maal/Downloads/TSI Wrist Band.step` (`01c3171a…7970ea7f75859bd5abb993c`).
- Open Cascade reports **98 source solids**. XCAF hierarchy: `TSI Wrist Band v24` contains a `3D_PCB3_2026-09-05 v1` branch with 97 solids and `Component48` with one enclosure-sized solid. Source product names include a board, ESP32-C3 SuperMini model, LED models, resistors and capacitors.
- All 98 solids are retained as individual STL files in `blender/cad/watch-meshes/`; `manifest.json` records source bounds, tessellated bounds and source-to-web groups. The web GLB is `client/public/assets/tsi-watch-cad.glb`.
- Solids **32 and 33 tessellate identically**, including positions and triangles. The web GLB renders one copy to avoid overlapping faces; the manifest maps 33 to 32. The source STEP and both STL files are preserved.

| Web group | Source solid indices | Presentation interpretation |
| --- | --- | --- |
| `WATCH board` | 0 | Board-shaped solid |
| `WATCH electronic-details` | 1–31, 36–96 | Visible board-mounted geometry merged for web performance |
| `WATCH board-mounted-form` | 32, with identical 33 mapped to it | Large board-mounted geometry; exact physical role unverified |
| `WATCH large-detail-a` | 34 | Larger visible detail; exact role unverified |
| `WATCH large-detail-b` | 35 | Larger visible detail; exact role unverified |
| `WATCH enclosure` | 97 | Housing with attachment lugs |

The supplied STEP **does not contain a separate strap solid**. The website therefore displays the actual housing and board without inventing a strap. The two-watch finale uses two instances of this same GLB. Separation follows the source layer normal and preserves the other source coordinates; it is illustrative.

Open Cascade's analytic bounding box for watch solids 32/33 extends farther along Z than their actual tessellated triangles. The manifest includes both values; the displayed GLB and comparison use the tessellated coordinates. Blender rendered the assembled watch from the STL assembly, and the browser showed the same enclosure, board and lugs in the assembled GLB before and after reassembly.

## Verification boundary

The STEP files establish geometry and some source product names. They do not establish sensor placement, circuit behavior, wireless routing, vibration output, operating range, battery life, complete physical mounting, or a wearable strap. The website labels these as intended behavior or “Pending verification.”
