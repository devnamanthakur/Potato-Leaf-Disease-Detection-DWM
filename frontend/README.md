# Potato & Papaya Disease Detector — Frontend

Vite + React + Tailwind single-page app that fronts two models in one UI:

- **Potato** — fine-tuned EfficientNetB3 (Early Blight / Healthy / Late Blight)
- **Papaya** — fine-tuned MobileNetV2 (Healthy / Diseased)

Switch between the two with the segmented control in the header. Upload an image (or, for potato, pick a sample from `External_Test_Data/`) and the FastAPI backend in `../backend` returns the predicted class, confidence, per-class probabilities, and a Grad-CAM explanation.

## Run

From the repository root, start the API and this dev server together:

```bash
./start-demo.sh
```

Or manually, with the backend already running on port 8000:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API base URL defaults to `http://localhost:8000` and can be overridden with `VITE_API_URL`.

## Project layout

- `src/constants.js` — the `PROJECTS` registry (per-project class metadata, copy, stats)
- `src/components/ProjectSwitch.jsx` — Potato / Papaya switcher
- `src/api.js` — project-aware API client (`/api` vs `/api/papaya`)

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run lint` — Oxlint
- `npm run preview` — serve the production build
