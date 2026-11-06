# Techo Spark Industries

A local full-stack product website with React, TypeScript, Vite, Three.js, Express, Zod, optional MongoDB/Mongoose, and optional Nodemailer notifications. The current product experience uses native browser scrolling.

## Run locally

Use Node.js 22.12+ (tested with Node 24) and npm.

```sh
npm install
npm run dev
```

Frontend: http://127.0.0.1:5173
Backend health: http://127.0.0.1:3001/api/health

To run separately in two terminals:

```sh
npm run dev -w client
npm run dev -w server
```

Vite proxies `/api` to Express. No paid service or credentials are required. Stop with Ctrl+C. The local servers bind only to the loopback interface.

## Production build

```sh
npm run check
npm test
npm run build
npm start
```

The built Express application serves both the website and API at http://127.0.0.1:3001. Configure a TLS reverse proxy and process manager for public deployment. Set the proxy trust policy for your exact network before deploying behind a proxy; never blindly enable `trust proxy`. The built site needs the Express backend for contact submissions.

## Configuration

Copy `.env.example` to `.env` in the project root. The server loads it automatically through the workspace scripts. Never commit credentials.

- `PORT`: API/production port (default 3001). Update Vite proxy if changing it.
- `MONGODB_URI`: optional MongoDB connection. When absent, accepted inquiries are durably appended to `server/data/inquiries.jsonl`, excluded from Git. Use an absolute `INQUIRY_DATA_DIR` for another private persistent directory.
- When MongoDB is configured but unavailable, contact submission returns 503 rather than falsely acknowledging storage. MongoDB reconnects automatically.
- `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM`, `CONTACT_TO`: optional email notifications. Add `SMTP_USER` and `SMTP_PASS` when authentication is required. Port 465 uses TLS; 587 uses STARTTLS when supported.
- Email runs after durable storage. A notification failure does not discard a saved inquiry. SMTP and a real MongoDB connection require your credentials and were not live-tested.

The API validates and bounds every field, limits JSON bodies to 16 KB, includes a honeypot, and allows five submissions per IP per 15 minutes. Rate limits are in memory; use a shared store for multiple server instances. Storage files contain personal inquiry data; keep them outside public directories and apply your retention/backup policy. There is no public inquiry-listing endpoint.

## Project structure

```text
TechoSpark/
├── client/
│   ├── public/
│   │   ├── assets/       # Original product images, logo, asset notes
│   │   └── favicon/
│   ├── src/
│   │   ├── components/  # Brand, navigation, footer, product compositions
│   │   ├── hooks/       # Native page progress
│   │   ├── sections/    # Hero, product story, contact form
│   │   ├── styles/      # Design system and responsive layouts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/      # Mongoose inquiry model
│   │   ├── services/    # Persistence and optional email
│   │   ├── app.ts       # Middleware, validation, API, static serving
│   │   └── server.ts    # Configuration, database, lifecycle
│   ├── tsconfig.json
│   └── package.json
├── shared/contact.ts   # Shared Zod schema
├── tests/contact.test.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
└── README.md
```

## Content and motion

The page has exactly five main sections: Home, Assistive Module, Watches, How It Works, and About & Contact. The last section includes the original company introduction, a specifications table with unknown values marked “Pending verification,” and the existing contact form and Express API. No human or human-use animation appears in the website.

Both product views come from the supplied STEP assemblies. The module contains 314 source solids in seven web groups. The watch contains 98 source solids; one exact duplicate is represented by the same web mesh, and the remaining geometry is arranged in six web groups. The watch STEP contains the housing and PCB but no separate strap solid. [CAD component mapping](docs/cad-component-mapping.md) records source indices, product names, assembly positions, and presentation groups.

Each product has an independent six-stage scroll timeline: reveal, exterior, aligned separation, board, close-up and reassembly. The final watch stage shows two instances of the same CAD design. Manual rotation and zoom work until the next real scroll, which resumes the authored timeline. Native scrolling replaces the former Lenis and GSAP opacity-reveal combination that could leave sections blank. The 3D renderer loads near the viewer, pauses rendering outside the viewport, uses a capped pixel ratio, and has a CAD-image fallback. Reduced-motion users receive immediate state updates without transition animation.

How It Works shows one intended-behavior simulator with actual CAD product renderings. Left, right and both-side controls illuminate only the corresponding watch images. Sensor position, wireless routing and physical haptics remain unverified. The website does not present inferred engineering details as confirmed specifications.

## CAD and Blender sources

`blender/cad/TSI-REV3.step` and `blender/cad/TSI-Wrist-Band.step` are unchanged copies of the supplied files. Their manifests and tessellated solids are in `blender/cad/meshes/` and `blender/cad/watch-meshes/`. The web assets are `client/public/assets/tsi-rev3-cad.glb` and `client/public/assets/tsi-watch-cad.glb`. Editable Blender scenes are `blender/cad-product.blend` and `blender/watch-cad-product.blend`. Scripts under `blender/scripts/` regenerate the assets. STEP export requires `cadquery-ocp`; Blender 5.2 was used for the web exports and studio images.

## Git setup

```sh
git init
git add .
git commit -m "Initial commit: Techo Spark Industries website"
git branch -M main
```

Create an empty GitHub repository, then replace OWNER/REPOSITORY with its path:

```sh
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

Suggested follow-up commits: `feat: add verified product specifications`, `feat: configure inquiry notifications`, `design: add production product photography`. Dependencies, builds, credentials, private inquiries, and temporary editor files are ignored. No repository is published automatically.
