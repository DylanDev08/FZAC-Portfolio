import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fallbackProjects } from '../../frontend/src/data/projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, '..', 'data', 'portfolio-catalog.js');
const source = `// Archivo generado por npm run catalog:sync. No editar a mano.\nexport const portfolioCatalog = ${JSON.stringify(fallbackProjects, null, 2)};\n`;

fs.writeFileSync(outputPath, source, 'utf8');
console.log(`[catalog] ${fallbackProjects.length} obras exportadas a backend/data/portfolio-catalog.js`);
