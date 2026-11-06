# Verification

## 2 November 2026 — eight-section restructure and human film

- A pre-change archive was saved at `backups/pre-human-restructure-2026-11-01.tar.gz` before edits.
- The page now renders eight top-level sections in the requested order. The CAD, PCB, watch and turntable views share one Explore Product section; How It Works contains the directional simulator.
- The previous primitive mannequin has been removed from the visible demonstration. A licensed CC0 rigged and clothed character was inspected in Blender. Seven 1280 × 720 keyframes were rendered and visually inspected. The carrying walk gave a better hand pose than the original brisk walk.
- The supplied STEP geometry remains the product source. The seven keyframes include the STEP-derived handle and illustrate both watches, walking, obstacles, signal paths, haptic highlighting and response. The shaft junction is still a concept because the supplied references do not establish its physical mounting. The finger grip is improved but is not yet a verified ergonomic interaction.
- The finished seven-scene film contains 168 frames at 1280 × 720, 12 fps, and 14 seconds. It was encoded as H.264 MP4 and decoded end to end without errors. Selected frames from every scene, including each left/right/both alert sequence, were visually inspected.
- TypeScript checks, production build and both existing contact API tests pass. The browser loaded the finished MP4 with 14-second duration and no media error. Final responsive and interaction checks are recorded below.
- Browser checked after restructuring: the eight navigation anchors match the eight sections; film Next advances from MOUNT to WEAR; the right-obstacle control seeks to the corresponding DETECT subscene; the Explore Product PCB tab switches the viewer; the How It Works right-obstacle control sets left false/right true. The corrected scroll behavior no longer jumps to RESPOND when a control is brought into view by clicking.
- No horizontal overflow at 320px, 390px or 1280px. The MP4 remained ready at each size, and the browser recorded no errors or warnings. The finished demonstration is shown in [site-human-demo.jpg](site-human-demo.jpg).

## 1 November 2026 — prior checkpoints

## Cinematic hardware upgrade

- Frontend and backend TypeScript checks and production build pass.
- Existing input-validation and HTTP API regression suites pass, including durable inquiry storage, malformed input, honeypot, rate limits and storage failure handling.
- Browser verified: seven-stage demonstration scene switching and rendering, desktop watch scroll separation/reassembly, manual assembly controls, assistive-module exploded view, final module reassembly, PCB focus controls and keyboard tab navigation, ecosystem pause control.
- Mobile watch scroll animation and manual reassembly verified at 390px. No horizontal page overflow at 320px, 390px and 768px.
- No browser warnings or errors in the final inspected session.
- Reduced-motion handling reviewed in code; operating-system media emulation was not available through the browser tool.
- GPU work is limited to visible scenes with capped frame rate/pixel ratio and unchanged-frame skipping. The renderer loads separately (~151 KB compressed). Production build reports its >500 KB uncompressed chunk and two upstream Zod annotation warnings; build succeeds.
- No live MongoDB or SMTP credentials were supplied; those integrations were not live-tested.
- Model accuracy limitations and additional reference requirements are documented in hardware-reference-audit.md.

The frontend preview runs at http://127.0.0.1:5173 and the API at http://127.0.0.1:3001. Restart with `npm run dev` if the local process is stopped.

## 1 November directional correction and Blender checkpoint

- Build, TypeScript checks and both contact API tests pass after the direction-based correction.
- Browser simulation verified in the VIBRATE scene: left obstacle → left true/right false; right obstacle → left false/right true; both sides → both true. These states are UI simulation only and do not verify firmware.
- Blender 5.2.3 LTS rendered a 1280 × 720 Scene 03 draft. Visual inspection found the character static with an unconvincing hand grip and simplified module/watch geometry. It remains a checkpoint and is not integrated into the website or called a finished animation.

## Full STEP assembly and Blender product animation

- Open Cascade read the supplied `TSI REV3.step` and exported all 314 solids in millimetre units. Blender imported and rendered the complete assembly. The web GLB has seven groups: two enclosure solids, two board solids, two other large details and merged small electronic details. The original 314 STLs and manifest are retained.
- Blender rendered a 72-frame rotation, exploded-view and reassembly sequence. The editable `cad-product.blend` and `cad-turntable.blend`, preview, web GLB and MP4 are included.
- Browser verified at desktop and 390px mobile: the detailed module loads with seven groups and source marker `TSI REV3.step`; rotation and zoom controls respond; the video loads with a 3-second duration and no media error. The page has no horizontal overflow at 390px or 320px.
- Browser verified after control-state correction: left obstacle → left true/right false; right obstacle → left false/right true; both sides → both true in the VIBRATE scene. The selected scene persists while controls are used.
- The human walkthrough remains a geometric illustration. The walking stick now meets the right hand, the module is placed at its top, and the legs reach the ground plane. The figure is not a filmed or rigged human performance.
- Visual evidence: [interactive CAD chapter](site-cad-interactive.png), [Blender film on the website](site-cad-film.png).
