# NC Tutoring Prototype

A browser-based React prototype for exploring student onboarding, curriculum tutoring, content-ingestion, and analytics workflows. It is a frontend demonstration, not a complete or validated tutoring service.

## Run locally

Use a Node.js version supported by Vite 8, then run:

```sh
npm ci
npm run dev
```

The development server prints the local URL. The other project checks are:

```sh
npm run lint
npm run build
npm run preview
```

## Project structure

- `index.html` — Vite entry page and document metadata.
- `src/main.jsx` — React application bootstrap and global stylesheet import.
- `src/App.jsx` — application shell and workflow navigation.
- `src/components/Student/` — onboarding and tutoring screens.
- `src/components/Admin/` — content-ingestion and analytics screens.
- `src/mockApi.js` — local demo data and the server-side tutor API client.
- `src/index.css` — global Tailwind setup and application styles.

## Prototype limits

- Onboarding advances through the same placeholder puzzle repeatedly. Answers are not saved or scored; the displayed profile is fixed sample data.
- Content ingestion only demonstrates file selection. Files are not uploaded, read, or indexed.
- Analytics values are illustrative sample data, not observations about real learners.
- Tutoring sends `POST /api/tutor` on the same origin with `{ "query": string, "learnerState": object | null }`. No backend is included. The endpoint must return JSON with a non-empty string `text` field and a string-array `citations` field. Provider credentials belong on that server, never in this browser bundle.
- Voice input, speech output, curriculum retrieval, verification, and learner-data persistence are not implemented.

Do not enter real student data or use the displayed profile, analytics, or tutoring interface for educational, clinical, placement, or other high-stakes decisions.
