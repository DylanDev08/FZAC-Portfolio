import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const backendRoot = process.cwd();
const repoRoot = path.resolve(backendRoot, '..');
const failures = [];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json']);

async function filesAt(relativePath) {
  const absolute = path.join(repoRoot, relativePath);
  const entries = await readdir(absolute, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...await filesAt(child));
    else files.push(child);
  }
  return files;
}

const frontendFiles = [
  ...(await filesAt('frontend/src')),
  'frontend/vercel.json',
].filter((file) => sourceExtensions.has(path.extname(file)));

const forbiddenServerNames =
  /SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|DIRECT_URL|MERCADOPAGO_(?:ACCESS_TOKEN|WEBHOOK_SECRET)|RESEND_API_KEY|WHATSAPP_(?:ACCESS_TOKEN|APP_SECRET)|CLIENT_SECRET|PRIVATE_KEY/i;
const credentialValues =
  /sb_secret_[A-Za-z0-9_-]{20,}|APP_USR-[A-Za-z0-9-]{20,}|re_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}/;

for (const file of frontendFiles) {
  const content = await readFile(path.join(repoRoot, file), 'utf8').catch(() => '');
  if (forbiddenServerNames.test(content)) failures.push(`${file}: referencia un secreto exclusivo de servidor.`);
  if (credentialValues.test(content)) failures.push(`${file}: contiene una credencial con formato real.`);
}

const workflowFiles = await filesAt('.github/workflows');
for (const file of workflowFiles) {
  const content = await readFile(path.join(repoRoot, file), 'utf8');
  const unpinned = content.match(/^\s*-?\s*uses:\s*[^\s#]+@(?![a-f0-9]{40}(?:\s|#|$))[^\s#]+/gim);
  if (unpinned) failures.push(`${file}: las GitHub Actions externas deben fijarse por SHA.`);
}

const securityMiddleware = await readFile(path.join(backendRoot, 'middleware/security.js'), 'utf8');
if (securityMiddleware.includes('protectRoutes')) {
  failures.push('middleware/security.js: no debe existir un guard que valide solo la presencia de Bearer.');
}

const renderConfig = await readFile(path.join(repoRoot, 'render.yaml'), 'utf8');
if (/connect-src[^\n]*https?:\/\/localhost|connect-src[^\n]*ws:\/\/localhost/i.test(renderConfig)) {
  failures.push('render.yaml: la CSP productiva no debe permitir conexiones a localhost.');
}

if (failures.length) {
  failures.forEach((failure) => process.stderr.write(`${failure}\n`));
  process.exitCode = 1;
} else {
  process.stdout.write('Portfolio security check OK.\n');
}
