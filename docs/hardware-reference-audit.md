# Hardware reference audit — 1 November 2026

The module showcase now uses all 314 solids exported from the supplied `TSI REV3.step`. The many small electronic details are merged into a presentation group for web performance; major enclosure and board solids remain independent. The watch and human demonstration remain reference-based illustrations. Motion between the STEP groups is a presentation sequence rather than a verified disassembly procedure.

| Supplied reference | Supported visible details | Limits |
| --- | --- | --- |
| Watch CAD screenshot | Rectangular board, package groupings, contact pads, mounting locations, enclosure outline | Part identities and dimensions are not legible or verified |
| Watch on wrist | Dark enclosure, transparent cover, woven strap and orange accent | No verified battery, motor or underside layout |
| Module internal CAD render | Blue cylindrical battery, blue main PCB, two smaller boards, red button and enclosure pockets | Exact dimensions and functions of unmarked packages are unverified |
| Module external CAD render | Black textured shell, red physical button, raised markings, handle connection | Photographic finish and full stick mounting remain unverified |
| TSI REV3.step | Actual enclosure profile and openings, two large shell solids, two board solids, electronic packages and assembly positions | The STEP assembly contains 314 solid instances. Electrical identities and complete operating hardware are not established by geometry alone |
| Handle front and rear photographs | Grip silhouette, shell faces, fastener openings, red TSI mark, exposed button | Internal circuit, power system, sensors and complete shaft attachment not shown |
| TSI logo | Supplied brand mark and colors | Original mark retained |

Watch parts separate independently: clear cover, fasteners, board, visible package groupings and enclosure. Package geometry approximates the CAD screenshot without identifying electrical functions. The PCB inspection also maps the supplied CAD image onto the board.

The cutaway render shows a blue cylindrical battery, blue PCB, two smaller visible boards and a red button. The STEP geometry shows enclosure, boards and packages, but does not itself verify all component identities. The STEP-derived GLB drives the hero, module, assembly, ecosystem and demonstration scenes. The two watches are separately rendered model instances; differing production designs have not been established. Signal travel and haptic motion illustrate the supplied product concept, not verified firmware behavior.

## References needed for engineering accuracy

- Front/back photographs of each PCB, including legible component markings.
- Measured open-enclosure views identifying battery, sensors, wiring and mounting points against the STEP assembly.
- Schematic and bill of materials identifying functions and connections.
- Source CAD for the watches and the complete stick attachment.
- Separate references for the second watch if its physical design differs.

## Workflow decision

The STEP file was read with the Open Cascade Python binding (OCP) in a temporary virtual environment. `blender/scripts/export_step_meshes.py` tessellates all 314 solids as separate STL files with millimetre units; `blender/scripts/cad_preview.py` assembles and lights them in Blender, merging small details into one web presentation group; `blender/scripts/export_cad_glb.py` creates the web GLB. The source STEP copy, STL files, manifest, editable Blender scene, web GLB and preview render are retained in the project. The Blender turntable script creates an editable animation scene and rendered frames, assembled as the website MP4.

The STEP and Blender files are the geometry source for the module. Product imagery supplements the finish and contextual scenes.

## Directional behavior correction

The intended interaction is left obstacle → left wrist, right obstacle → right wrist, and both-side obstacles → both wrists. The website now labels this as a behavior simulation. The shared project contains website code and visual references, not firmware or sensor documentation proving independent left/right detection or alert routing. The exact sensor position remains unverified.

## Blender Scene 03 checkpoint

Blender 5.2.3 LTS runs locally. `blender/scripts/scene03_preview.py` creates the editable `blender/scene03-preview.blend` and 1280 × 720 Eevee render `blender/renders/scene03-preview.png`. The human base mesh is Blender Studio's CC0 Human Base Meshes v1.4.1, downloaded from the official Blender mirror. This first camera check is not approved for website integration: the figure lacks a rig and walking motion, the grip is not convincingly held, the watch enclosures need more accurate reference-based geometry, and the module attachment silhouette needs to be reconstructed from the CAD rather than a rounded bar. These deficiencies are visible in the render, so no full sequence or frame bundle has been claimed.
