# VoteX frontend

This is a vanilla HTML, CSS, and JavaScript frontend. Vite is used only as the local npm development server and proxy; no frontend framework or UI library is used.

## Run locally

1. In the project root, make sure the backend environment variables are configured, then start the API:

   ```powershell
   npm start
   ```

2. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Open the local URL shown by Vite, normally `http://localhost:5173`.

The Vite proxy sends every frontend request beginning with `/api` to `http://localhost:3000`, so candidates and live vote counts load from the existing backend without modifying its code or requiring backend CORS configuration.
