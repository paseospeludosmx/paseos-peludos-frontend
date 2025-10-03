// paseos_peludos-frontend/config.js
// Config cloud-first: obliga a definir EXPO_PUBLIC_API_URL (tu API en Render).
const raw = process.env.EXPO_PUBLIC_API_URL || '';
const base = raw.replace(/\/$/, '');

if (!base) {
  // Falla en voz alta para no usar localhost por accidente en producción.
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL. Define en tu .env la URL de tu API en Render, por ejemplo:\n' +
    'EXPO_PUBLIC_API_URL=https://paseos-api-xxxx.onrender.com'
  );
}

export const API_URL = `${base}/api`;
