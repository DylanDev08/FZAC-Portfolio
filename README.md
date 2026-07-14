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
- Se mantiene el acceso limitado a los emails administradores autorizados.
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
- Render Static Site para frontend
- Render Web Service para backend Express

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
    config/
    controllers/
    db/
    middleware/
    models/
    prisma/
    routes/
  render.yaml
  README.md
```

## Variables de entorno

Frontend: copiar `frontend/.env.example` a `frontend/.env` y completar:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
VITE_SUPABASE_STORAGE_BUCKET=crud-images
```

En produccion, Render inyecta `VITE_API_ORIGIN` con la URL publica del backend. El frontend agrega `/api` automaticamente; `VITE_API_URL` se conserva para desarrollo local o una configuracion manual.

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
ADMIN_EMAILS=[ADMIN_EMAIL_1],[ADMIN_EMAIL_2]
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
- `POST /api/auth/admin/bootstrap` (JWT de Supabase y email autorizado requeridos)
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
- `PATCH /api/admin/works/:id/status`
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
- El backend valida cada access token contra Supabase Auth antes de revisar la allowlist administrativa.
- El frontend renueva la sesion de Supabase antes de cada operacion privada y reintenta una vez ante un `401`.
- Prisma reutiliza una unica instancia y limita a una conexion por proceso sobre el pooler de Supabase.
- Solo los emails configurados en `ADMIN_EMAILS` pueden operar rutas privadas.
- No existe registro publico de administradores ni se envia la lista de emails autorizados al frontend.
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

1. Crear la cuenta desde Supabase Dashboard, en Authentication > Users, y confirmar su email.
2. Agregar ese email solamente a `ADMIN_EMAILS` en el backend y en las variables privadas del servicio de Render.
3. Ejecutar `npm run prisma:seed` para preparar los perfiles administrativos y el contenido inicial.
4. Ingresar por `/login`. La ruta protegida `POST /api/auth/admin/bootstrap` crea o actualiza de forma idempotente su fila en `admin_profiles`.

El frontend no contiene ni recibe la lista de administradores. Supabase valida la identidad y el backend valida el JWT y la allowlist antes de preparar el perfil o habilitar el CRUD. La ruta de bootstrap no crea usuarios de Auth y no puede utilizarse sin una sesion autorizada.

## Probar una subida

1. Iniciar backend en `http://localhost:4000` y frontend en `http://localhost:5173`.
2. Iniciar sesion en `/login`.
3. Abrir `Obras`, editar una ficha y seleccionar una portada o una etapa.
4. Confirmar el mensaje `Status 201` del upload y luego guardar la obra.
5. Verificar el objeto en el bucket `crud-images` y la fila correspondiente en `work_images`.

El backend registra nombre, MIME, bytes, folder, bucket y path. Nunca registra keys ni tokens.

## Deploy en Render

La arquitectura de produccion usa un solo repositorio y un solo Blueprint. Render crea dos servicios separados pero coordinados:

- `FZAC-Portfolio`: Web Service Node/Express con Root Directory `backend`.
- `FZAC-Portfolio-1`: Static Site React/Vite con Root Directory `frontend` y publicacion desde `dist`.

### Crear el Blueprint

1. En Render, elegir `New > Blueprint` y conectar este repositorio.
2. Seleccionar la rama `main` y usar `render.yaml` como Blueprint Path.
3. Completar una sola vez los secretos marcados con `sync: false`:

```env
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
ADMIN_EMAILS=[ADMIN_EMAIL_1],[ADMIN_EMAIL_2]
```

4. Confirmar la creacion de los dos servicios y esperar ambos builds.
5. Verificar `https://fzac-portfolio.onrender.com/health` y abrir `https://fzac-portfolio-1.onrender.com`.

El Blueprint enlaza automaticamente las URLs: el frontend recibe `VITE_API_ORIGIN`, mientras `CLIENT_URL` y `CORS_ORIGINS` reciben la URL del sitio estatico. `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` heredan los valores publicos del backend. La service role, Prisma y las conexiones PostgreSQL nunca llegan al frontend.

Los redirects historicos, headers de seguridad, cache de assets y fallback de React Router estan declarados en `render.yaml`. Para un dominio personalizado del frontend, agregarlo en el backend como `ADDITIONAL_CORS_ORIGINS`.

Render inyecta `PORT`; no es necesario definirlo. Express escucha en `0.0.0.0`. El plan gratuito del backend puede entrar en reposo y demorar el primer request; cambiar el plan no requiere modificar el codigo.

### Migraciones iniciales

Antes del primer deploy contra una base nueva, ejecutar una sola vez desde un entorno seguro:

```bash
cd backend
npm run prisma:deploy:portfolio
npm run prisma:seed
```

Las migraciones no se ejecutan automaticamente en cada deploy. No usar `prisma db push --accept-data-loss`.

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
- `CORS`: el dominio Render se configura automaticamente; agregar dominios personalizados a `ADDITIONAL_CORS_ORIGINS`, separados por comas.
- Imagen rota: revisar `image_url` y `image_path`; el frontend muestra el logo como fallback visual.

## Compatibilidad de datos

`Work`, `WorkImage`, `Category`, `SiteText` y `Profile` son la capa principal. `Obra`, `Trabajo`, `Evento` y sus rutas se conservan temporalmente para no romper URLs, contenido historico ni fallback local. El portfolio publico consulta primero `/api/fzac/works` y utiliza los datos locales cuando backend/Supabase no responde.
