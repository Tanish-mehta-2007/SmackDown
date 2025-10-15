CORS and local development

The backend no longer sets CORS headers by default. If you're running the frontend locally and your backend is hosted (e.g., on Render), you have two options:

- Use the Vite dev proxy (already configured in `vite.config.ts`) so local requests to `/api` are forwarded to the hosted backend without CORS issues.
- Or update the hosted backend to allow your frontend origin(s) in production (configure allowed origins in the server or via platform settings).

If you see CORS-related errors in the browser console, prefer using the Vite proxy during local development as it avoids cross-origin requests from the browser.