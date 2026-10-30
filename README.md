# Techo Spark Industries

A local full-stack product website with React, TypeScript, Vite, Tailwind, GSAP ScrollTrigger, Lenis, Framer Motion, Express, Zod, optional MongoDB/Mongoose, and optional Nodemailer notifications.

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
│   │   ├── hooks/       # GSAP/Lenis lifecycle and responsive motion
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

All five supplied images are included. The supplied handle photographs are shown as-is through CSS framing; a full walking-stick photo was not supplied. The single watch photograph is reused for the two-watch ecosystem. Hardware layers illustrate structure and are not a physically verified exploded view. Unknown specifications are explicitly “To be specified”; edit the specification list in `client/src/sections/Story.tsx` when verified information is available. No sensor types, protocols, ranges, battery capacities, accuracy, certifications, addresses, or phone numbers have been invented.

Desktop scroll storytelling uses a pinned GSAP timeline. Tablets and phones use natural document flow. Reduced motion disables smooth scrolling, pinned scenes, decorative loops, and reveal animations. GSAP contexts and ticker listeners are cleaned up on unmount. Framer Motion respects reduced motion. Process tabs support arrow keys/Home/End; navigation and forms support keyboard operation. Content is present independent of animation initialization.

Original JPEGs remain in `client/public/assets`; see the asset README for mapping. Replace them with matching filenames to update the site. A future render sequence can be introduced inside `ProductVisual` while preserving the existing composition and timeline interface; no frame sequence is currently used.

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
