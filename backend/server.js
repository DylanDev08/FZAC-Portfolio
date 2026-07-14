import { createApp } from './app.js';
import { env, validateEnvironment } from './config/env.js';

const app = createApp();
const { missing } = validateEnvironment();
if (missing.length) console.warn(`[config] Variables opcionales durante desarrollo sin completar: ${missing.join(', ')}`);

const host = '0.0.0.0';
const server = app.listen(env.port, host, () => {
  console.log(`Backend FZAC escuchando en ${host}:${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${env.port} ya está ocupado. Cerrá la instancia anterior del backend y volvé a iniciar.`);
  } else {
    console.error('No se pudo iniciar el servidor:', error.message);
  }
  process.exit(1);
});
