# Product CAD pipeline

The current website presents the supplied module and watch STEP assemblies without a human animation. The source files are preserved in `cad/`. `scripts/export_step_meshes.py` and `scripts/export_watch_meshes.py` tessellate all source solids with Open Cascade (`cadquery-ocp`). `scripts/cad_preview.py` and `scripts/build_watch_web.py` make the editable Blender scenes and GLBs. `scripts/render_product_cutouts.py` renders the transparent home images from those scenes.

`cad/meshes/manifest.json` maps the module's 314 source solids. `cad/watch-meshes/manifest.json` maps the watch's 98 solids and records an exact duplicate represented once in the web asset. [CAD component mapping](../docs/cad-component-mapping.md) explains the presentation groups and verification limits.
