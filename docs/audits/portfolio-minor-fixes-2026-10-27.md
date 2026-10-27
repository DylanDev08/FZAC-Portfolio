# Auditoría acotada de FZAC Portfolio — 27/10/2026

## Alcance
Revisión no destructiva de código y rutas públicas, sin modificar esquema de obras, catálogo, estado de obras, imágenes, textos comerciales, diseño, credenciales ni configuración de backend.

## Verificaciones
- La portada del despliegue de Vercel `https://fzac-portfolio-ntt3.vercel.app/` respondió correctamente y mostró servicios y acceso a obras.
- La ficha `/obra/marvel` mostró las galerías por sucursal y textos de la obra.
- `/proyectos` falló en **dos consultas de la web pública** con `Unable to preload CSS for .../assets/Projects-Bfm2oPAD.css`. No se confirma todavía si la causa es caché, archivos de compilación ausentes, o distribución del asset en Vercel.
- Los intentos de leer `https://fortalezaconstrucciones.com.ar/` y su variante `www` con un extractor externo no pudieron validar la URL (`invalid_url`). **Eso no demuestra por sí solo que el dominio esté caído**; se debe comprobar DNS y propiedad desde el panel de hosting si se usa como URL pública.
- La web usa React/Vite, cargas diferidas, galerías por sucursal y navegación con flechas. El código conserva el esquema y diseño existentes.
- `robots.txt`, `sitemap.xml`, metadatos y schema JSON-LD ya están presentes. Son archivos estáticos: el sitemap actual no incorpora automáticamente obras nuevas creadas por administración; automatizar esto requeriría un corte distinto.

## Cambios mínimos de esta rama
1. Recuperación acotada de error específico de Vite `vite:preloadError`: recarga **una sola vez en la ventana de un minuto** cuando el navegador intenta precargar un chunk CSS/JS viejo, sin recargas infinitas.
2. Página de error de React con texto claro para usuarios, sin exponer instrucciones internas de desarrollo.
3. Galerías: al salir con el mouse o el foco se desactiva la captura de las flechas; también se ignoran entradas editables. Se marca la miniatura seleccionada con `aria-pressed`.
4. Imagen de respaldo: se intenta una única vez si el recurso original falla, evitando bucles si también falta la imagen de respaldo.

## Sin cambios
- Ninguna modificación a obras, sucursales, portadas, videos o API.
- Ningún CSS reescrito ni cambios de colores, espacios o posiciones.
- No se modifican envíos de materiales, checkout, Merchant Center o el PR #47 del e-commerce.
- No se modifica Render, Vercel, Supabase, DNS ni variables de entorno.
- El PR no se fusiona ni despliega automáticamente.

## Validación después del merge/despliegue (pendiente)
1. Confirmar que Vercel sirve el CSS `/assets/Projects-*.css` del build desplegado y devuelve 200.
2. Probar `/proyectos`, `/obra/marvel`, `/obra/sliders-hamburger` en escritorio y celular sin errores de consola.
3. Comprobar cambios de sucursal, flechas, miniaturas, ampliación y cierre con Escape.
4. Abrir página tras un nuevo despliegue para comprobar recuperación de caché sin bucles de recarga.
5. Revisar dominio canónico, sitemap y Search Console del portfolio si se desea indexarlo, sin confundir este sitio institucional con el e-commerce de materiales.

## Segunda fase — build nuevo, móvil y optimización de fotos

- Se construyó un **preview en Vercel** desde el PR #6 (deployment `dpl_HbPQyYJDDXKau4YSHjfMXESGigjY`): Vite terminó en estado READY y generó `dist/assets/Projects-Bfm2oPAD.css`. El preview está protegido por Vercel Authentication, por lo que su navegación pública no se pudo comprobar desde el navegador externo; no se modificó Deployment Protection.
- Ese build identificó **dos referencias CSS a fotos ausentes**: `construccion-seco-01.jpg` y `IMG-20210509-WA0007-1-.jpeg`. Se corrigieron en `globals.css` y `projectsBackground.css`, usando una foto de drywall existente.
- **Fotografías:** 128 archivos de imagen estáticos, 49,09 MB de peso total inicial. Se evaluaron las ocho de mayor peso (20.786.168 bytes). Cinco admitieron optimización JPEG progresiva sin cambio de dimensiones, sumando **6.379.699 bytes menos (30,7% de la muestra)**; tres se conservaron porque no llegaban al umbral mínimo del 25%. No se modificaron nombres, rutas, galerías ni portadas.
- Se retiró el workflow temporal usado para comprimir fotografías, una vez realizado su commit. No quedaron tareas con permisos de escritura agregadas.
- **Prueba móvil real sobre build aislado**: [GitHub Actions 40504963065](https://github.com/DylanDev08/FZAC-Portfolio/actions/runs/40504963065), Chromium, viewport `390×844`. Cuatro rutas evaluadas: `/`, `/proyectos`, `/obra/marvel`, `/obra/sliders-hamburger`. Las cuatro tuvieron HTTP 200, título y encabezado correctos, CSS cargado (incluida la hoja `Projects-Cn3hr9S3.css`), sin errores JS, sin respuestas 4xx de recursos `/assets/` y sin desbordamiento horizontal.
- El workflow de Playwright se utilizó solo para la verificación y se eliminó después. El CI habitual del repositorio permanece sin cambios.
- El resultado demuestra estabilidad del **build aislado** y de la ruta móvil, pero no sustituye una comprobación pública tras el despliegue; tampoco es una medición oficial de Lighthouse o Core Web Vitals.
- El PR sigue separado de `main`. No se desplegó a producción ni se tocaron datos de obras, backend, hosting o Supabase.
