# Potato Leaf Disease Detector — Frontend

Vite + React + Tailwind single-page app for the Potato Leaf Disease Detection project. Upload a leaf image (or pick a sample from `External_Test_Data/`) and the FastAPI backend in `../backend` returns the predicted class, confidence, per-class probabilities, and a Grad-CAM explanation.

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

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run lint` — Oxlint
- `npm run preview` — serve the production build
