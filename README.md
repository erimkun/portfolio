# Erim Portfolio

Interactive single-page portfolio built with React, Vite, and GSAP-inspired motion patterns.

## Overview

This project is a custom portfolio experience with:

- Lock screen entry flow before revealing the main site shell
- Full-screen section navigation with snap-like scrolling behavior
- Layered visual effects (particle canvas + pixel river canvas)
- Distinct projects mosaic section with clipped tiles and expanded hover details
- Content-driven sections for about, education, experience, projects, and contact

## Tech Stack

- React 19
- Vite 8
- GSAP 3
- ESLint 9

## Project Structure

```text
.
|-- public/
|-- src/
|   |-- components/       # UI sections and visual components
|   |-- data/             # Portfolio content source
|   |-- hooks/            # Custom behavior hooks
|   |-- App.jsx
|   |-- main.jsx
|   |-- App.css
|   `-- index.css
|-- docs/                 # Design and implementation notes
|-- index.html
|-- package.json
`-- vite.config.js
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

The app will run on the local Vite server URL shown in terminal output.

## Available Scripts

- `npm run dev`: Start local development server
- `npm run build`: Create production build in dist/
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint checks

## Content Customization

Main editable content is in:

- `src/data/content.js` for education, experience, projects, and contact links

Core shell and section composition lives in:

- `src/components/SiteShell.jsx`
- `src/components/ProjectsSection.jsx`
- `src/components/LockScreen.jsx`

## Build and Deploy

Create optimized assets:

```bash
npm run build
```

Then deploy the generated dist/ folder to your hosting provider.

## Notes

- docs/superpowers/ contains design specs and implementation plans used during iteration.
- Backup artifacts live under src/_backup/ for reference.

## License

This repository currently has no explicit license file.
