import { createApp } from './api/app.js';
import { env } from './config/env.js';

const app = createApp();
const initialPort = env.port;

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Backend FZAC corriendo en http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.warn(`Puerto ${port} ocupado. Probando ${port + 1}...`);
      server.close(() => startServer(port + 1, attemptsLeft - 1));
      return;
    }

    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  });
}

startServer(initialPort);
