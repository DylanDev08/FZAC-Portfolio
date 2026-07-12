# Portfolio FZAC - Fortaleza Construcciones

Portfolio web institucional y comercial de Fortaleza Construcciones. La web muestra obras, trabajos varios, eventos, servicios, galerias visuales por proyecto y canales de contacto para clientes de Rosario, Santa Fe y alrededores.

El proyecto queda administrable desde un panel privado para que una persona no tecnica pueda cargar obras, imagenes, videos, titulos, textos y nuevos items del portfolio sin tocar codigo.

## Que se realizo

- Se migro la capa de datos a Supabase.
- Se agrego Prisma como ORM del backend contra Postgres de Supabase.
- Se implemento Supabase Auth para el acceso privado.
- Se implemento Supabase Storage para imagenes mediante backend y service role.
- Se eliminaron configuraciones del proveedor anterior.
- Se mantuvo el panel admin y se agrego CRUD backend para obras, categorias, textos e imagenes.
- Se conserva el fallback local del portfolio cuando backend/Supabase no responde.
- Se mantiene el registro limitado al email administrador autorizado.
- Se mantiene la proteccion de la ruta admin con sesion Supabase.
- Se mantiene el backend Express con Helmet, CORS, rate limits y validaciones.

## Tecnologias

- React 18
- Vite
- React Router
- Supabase Auth
- Supabase Storage
- Supabase Postgres
- Prisma
- Node.js
- Express
- Helmet
- express-rate-limit
- JWT Supabase
- Vercel o hosting estatico para frontend

## Estructura

```text
fzac_work/
  frontend/
    src/
      components/
      data/
      pages/
      services/
      styles/
      supabase/
  backend/
    api/
    config/
    controllers/
    db/
    middleware/
    models/
    prisma/
    routes/
  vercel.json
  README.md
```

## Variables de entorno

Frontend: copiar `frontend/.env.example` a `frontend/.env` y completar:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
VITE_SUPABASE_STORAGE_BUCKET=crud-images
VITE_ADMIN_EMAILS=fortalezaconstruccionesrosario@gmail.com,materialezfzacecommerce@gmail.com,dylansalcedo333@gmail.com
```

Backend: copiar `backend/.env.example` a `backend/.env` y completar:

```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
SUPABASE_STORAGE_BUCKET=crud-images
MAX_UPLOAD_SIZE_MB=25
ALLOWED_UPLOAD_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,image/bmp,image/tiff
JWT_SECRET="jwt_secret_de_supabase"
AUTH_REQUIRED=true
ADMIN_EMAILS=fortalezaconstruccionesrosario@gmail.com,materialezfzacecommerce@gmail.com,dylansalcedo333@gmail.com
CORS_ORIGINS=http://localhost:5173
```

No se deben publicar credenciales reales ni service role keys.

## Como correr backend

```bash
cd backend
npm install
npm run catalog:sync
npm run prisma:generate
npm run prisma:deploy:portfolio
npm run prisma:seed
npm run dev
```

Las migraciones son aditivas: crean o completan `admin_profiles`, `categories`, `works`, `work_images` y `site_texts` sin borrar tablas internas de Supabase Auth. `prisma:deploy:portfolio` usa `prisma/direct-schema.prisma`, por lo tanto se conecta mediante `DIRECT_URL`. No ejecutar `prisma db push --accept-data-loss`.

El seed incorpora solamente las obras del portfolio que falten. No pisa obras ya editadas desde el panel.

`catalog:sync` genera `backend/data/portfolio-catalog.js` desde el fallback local. Ejecutarlo antes del seed o del deploy del backend cuando se modifiquen las obras o galerias de `frontend/src/data/projects.js`. El backend desplegado usa esa copia interna y no depende de archivos ubicados fuera de su carpeta.

## Como correr frontend

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Endpoints principales

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/fzac/obras`
- `POST /api/fzac/obras`
- `PUT /api/fzac/obras/:id`
- `DELETE /api/fzac/obras/:id`
- `GET /api/fzac/trabajos`
- `GET /api/fzac/eventos`
- `POST /api/contactos`
- `GET /api/contactos`
- `PATCH /api/contactos/:id`
- `GET /api/login-logs`
- `GET /api/site-settings/main`
- `POST /api/admin/uploads`
- `GET /api/fzac/works`
- `GET /api/admin/works`
- `POST /api/admin/works/sync-catalog`
- `POST /api/admin/works`
- `PUT /api/admin/works/:id`
- `DELETE /api/admin/works/:id`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/site-texts`
- `POST /api/admin/site-texts`
- `PUT /api/admin/site-texts/:id`
- `DELETE /api/admin/site-texts/:id`
- `GET /api/admin/work-images`
- `POST /api/admin/work-images`
- `PUT /api/admin/work-images/:id`
- `DELETE /api/admin/work-images/:id`

Las rutas de escritura validan JWT de Supabase y el email administrador.

## Control de galerias

- El portfolio y el panel leen la misma coleccion `works/work_images`.
- La secuencia publica es portada, antes, proceso y resultado final.
- El admin puede subir, reordenar, cambiar de etapa, describir y eliminar cada foto.
- Las obras agrupadas permiten editar nombre, direccion, portada y galeria de cada sucursal.
- El boton `Sincronizar obras actuales` agrega fichas locales faltantes sin sobrescribir cambios existentes.

## Seguridad

- `/admin` queda protegido con Supabase Auth.
- El backend valida JWT con `JWT_SECRET` de Supabase.
- El frontend renueva la sesion de Supabase antes de cada operacion privada y reintenta una vez ante un `401`.
- Prisma reutiliza una unica instancia y limita a una conexion por proceso sobre el pooler de Supabase.
- Solo el email administrador puede operar rutas privadas.
- El registro admin del backend usa service role y restringe el email permitido.
- Supabase Storage sube imagenes desde el backend con `SUPABASE_SERVICE_ROLE_KEY`; el frontend nunca recibe esa key.
- La base guarda imagenes en `work_images` como `image_url` e `image_path`.
- Helmet, CORS y rate limiting siguen activos en Express.
- Para DDoS volumetrico se recomienda CDN/WAF, por ejemplo Cloudflare, y politicas RLS/Storage ajustadas en Supabase.

## Supabase Storage

Crear un bucket para el CRUD, por defecto:

```text
crud-images
```

El backend intenta crear el bucket como publico si no existe. Las imagenes cargadas desde admin se suben a `/api/admin/uploads` con `multipart/form-data` y se guardan luego en `work_images`.

## Crear administradores

1. Agregar el email a `ADMIN_EMAILS` y `VITE_ADMIN_EMAILS`.
2. Reiniciar backend y frontend.
3. Desde `/login`, registrar el email autorizado o crearlo desde Supabase Auth.
4. El backend crea o actualiza su fila en `admin_profiles` al operar el CRUD.

Los emails deben existir en ambas variables. El frontend solo decide si muestra el panel; el backend vuelve a validar JWT y email en cada ruta privada.

## Probar una subida

1. Iniciar backend en `http://localhost:4000` y frontend en `http://localhost:5173`.
2. Iniciar sesion en `/login`.
3. Abrir `Obras`, editar una ficha y seleccionar una portada o una etapa.
4. Confirmar el mensaje `Status 201` del upload y luego guardar la obra.
5. Verificar el objeto en el bucket `crud-images` y la fila correspondiente en `work_images`.

El backend registra nombre, MIME, bytes, folder, bucket y path. Nunca registra keys ni tokens.

## Deploy

### Frontend Vercel

- Crear un proyecto usando la raiz del repositorio y el `vercel.json` principal.
- Configurar las variables `VITE_*` con la URL publica del backend.
- Ejecutar `npm run build` desde `frontend` para validar antes del deploy.

### Backend Vercel

- Crear un segundo proyecto Vercel con Root Directory `backend`.
- El archivo `backend/vercel.json` envia `/api/*` y `/health` a la funcion Express.
- Cargar todas las variables del backend, incluyendo `CORS_ORIGINS` con el dominio final del frontend.
- Ejecutar localmente `npm run prisma:deploy:portfolio` y `npm run prisma:seed` antes del primer deploy.

Para cargas cercanas a 25MB se recomienda Render, Railway o un servidor Node persistente: las funciones serverless de Vercel pueden imponer un límite de request inferior aunque la aplicación permita 25MB.

Tambien se puede desplegar `backend/` en Render, Railway o un servidor Node persistente usando `npm start`.

## Comprobaciones

Backend:

```bash
cd backend
npm run check
node scripts/check-admin-prisma.js
```

Frontend:

```bash
cd frontend
npm run check
```

## Errores frecuentes

- `Token JWT invalido`: cerrar sesion, volver a ingresar y verificar que frontend/backend usen el mismo proyecto Supabase.
- `Puerto 4000 ocupado`: cerrar la instancia anterior. El backend ya no cambia de puerto silenciosamente.
- `P3005` o tablas de `auth`: usar `npm run prisma:deploy:portfolio`, nunca `db push --accept-data-loss`.
- `400` al subir: revisar el mensaje JSON, MIME permitido, limite de 25MB y nombre del bucket.
- `CORS`: agregar el origen exacto del frontend a `CORS_ORIGINS`, separado por comas.
- Imagen rota: revisar `image_url` y `image_path`; el frontend muestra el logo como fallback visual.

## Compatibilidad de datos

`Work`, `WorkImage`, `Category`, `SiteText` y `Profile` son la capa principal. `Obra`, `Trabajo`, `Evento` y sus rutas se conservan temporalmente para no romper URLs, contenido historico ni fallback local. El portfolio publico consulta primero `/api/fzac/works` y utiliza los datos locales cuando backend/Supabase no responde.
