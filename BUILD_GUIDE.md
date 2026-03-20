# Guía de Build y Despliegue — CineBCN

## Arquitectura de ramas

| Rama | Contenido | Propósito |
|------|-----------|-----------|
| **`main`** | Scripts de build, package.json, documentación, CNAME, .gitignore | Desarrollo local |
| **`gh-pages`** | Código ofuscado/minificado (`dist/` publicado aquí) | GitHub Pages sirve desde esta rama |

> **`/src` y `/dist` están en `.gitignore`** — nunca se suben a `main`.
> El comando `npm run deploy` genera `/dist` y lo publica directamente a `gh-pages`.

---

## Qué hace el pipeline

Este pipeline automatiza la protección del código fuente JavaScript mediante un proceso de dos fases:

1. **Minificación con Terser** — Elimina comentarios, espacios, renombra variables y comprime el código.
2. **Ofuscación con javascript-obfuscator** — Aplica técnicas avanzadas de ofuscación:
   - Codificación de strings con RC4
   - Fragmentación de strings en trozos de 5 caracteres
   - Inyección de código muerto (40%)
   - Auto-defensa (anti-debugging)
   - Aplanamiento de flujo de control (50%)
   - Nombres de identificadores hexadecimales
3. **Minificación de HTML** — Elimina comentarios y espacios innecesarios del HTML.
4. **Copia de assets estáticos** — CSS, imágenes, datos y archivos de configuración se copian tal cual.

El resultado es una carpeta `/dist` local que se publica a la rama `gh-pages` con el código JS completamente ilegible.

---

## Archivos protegidos

### JavaScript (src/js/ → dist/js/)

| Archivo origen              | Archivo destino              |
| --------------------------- | ---------------------------- |
| `src/js/admin-profiles.js`  | `dist/js/admin-profiles.js`  |
| `src/js/agenda.js`          | `dist/js/agenda.js`          |
| `src/js/app.js`             | `dist/js/app.js`             |
| `src/js/auth.js`            | `dist/js/auth.js`            |
| `src/js/countries.js`       | `dist/js/countries.js`       |
| `src/js/database.js`        | `dist/js/database.js`        |
| `src/js/faq.js`             | `dist/js/faq.js`             |
| `src/js/film-reel.js`       | `dist/js/film-reel.js`       |
| `src/js/firebase-config.js` | `dist/js/firebase-config.js` |
| `src/js/i18n.js`            | `dist/js/i18n.js`            |
| `src/js/movie-service.js`   | `dist/js/movie-service.js`   |
| `src/js/nav-loader.js`      | `dist/js/nav-loader.js`      |
| `src/js/personal-space.js`  | `dist/js/personal-space.js`  |

### HTML (src/ → dist/)

| Archivo origen                | Archivo destino               |
| ----------------------------- | ----------------------------- |
| `src/index.html`              | `dist/index.html`             |
| `src/admin-profiles.html`     | `dist/admin-profiles.html`    |
| `src/agenda.html`             | `dist/agenda.html`            |
| `src/cookies.html`            | `dist/cookies.html`           |
| `src/faq.html`                | `dist/faq.html`               |
| `src/personal-space.html`     | `dist/personal-space.html`    |
| `src/privacy.html`            | `dist/privacy.html`           |
| `src/terms.html`              | `dist/terms.html`             |
| `src/partials/nav-menu.html`  | `dist/partials/nav-menu.html` |

### Assets copiados (sin modificación)

| Directorio origen | Directorio destino |
| ----------------- | ------------------ |
| `src/css/`        | `dist/css/`        |
| `src/data/`       | `dist/data/`       |
| `src/images/`     | `dist/images/`     |

---

## 🚀 Workflow de despliegue (comandos exactos)

### Primera vez (setup inicial)

```bash
# Instalar dependencias (solo una vez, o después de clonar)
npm install
```

### Cada vez que actualices código en src/

```bash
# Un solo comando: build + deploy a gh-pages
npm run deploy
```

Esto ejecuta internamente:
1. `npm run build` → Limpia `dist/`, ofusca JS, minifica HTML, copia assets
2. `npx gh-pages -d dist` → Publica el contenido de `dist/` a la rama `gh-pages` en GitHub

### Si además modificaste archivos de configuración en main (package.json, .gitignore, docs, etc.)

```bash
# Primero: commit y push de los cambios en main
git add -A
git commit -m "descripción del cambio"
git push origin main

# Después: build y deploy del código
npm run deploy
```

### Comandos individuales disponibles

| Comando | Qué hace |
|---------|----------|
| `npm run build` | Genera `/dist` (build completo sin publicar) |
| `npm run deploy` | Build + publica `dist/` a rama `gh-pages` |
| `npm run clean` | Elimina la carpeta `/dist` |

---

## Estructura resultante en /dist (y en gh-pages)

```
dist/
├── index.html
├── admin-profiles.html
├── agenda.html
├── cookies.html
├── faq.html
├── personal-space.html
├── privacy.html
├── terms.html
├── CNAME
├── css/
│   ├── admin-profiles.css
│   ├── faq.css
│   ├── film-reel.css
│   ├── legal-pages.css
│   ├── personal-space.css
│   └── styles.css
├── data/
│   ├── config.json
│   └── movies.json
├── images/
│   ├── manifest.json
│   └── *.jpg (todas las imágenes de películas)
├── js/
│   ├── admin-profiles.js   (ofuscado)
│   ├── agenda.js            (ofuscado)
│   ├── app.js               (ofuscado)
│   ├── auth.js              (ofuscado)
│   ├── countries.js         (ofuscado)
│   ├── database.js          (ofuscado)
│   ├── faq.js               (ofuscado)
│   ├── film-reel.js         (ofuscado)
│   ├── firebase-config.js   (ofuscado)
│   ├── i18n.js              (ofuscado)
│   ├── movie-service.js     (ofuscado)
│   ├── nav-loader.js        (ofuscado)
│   └── personal-space.js    (ofuscado)
└── partials/
    └── nav-menu.html
```

---

## Configuración de GitHub Pages

1. Ve a **Settings → Pages** en tu repositorio de GitHub.
2. En **Source**, selecciona:
   - Branch: **`gh-pages`**
   - Folder: **`/ (root)`**
3. Guarda. El sitio se servirá desde la rama `gh-pages`.

> El dominio personalizado `cinelabcn.es` se configura automáticamente gracias al archivo `CNAME` que se copia a `dist/` durante el build.

---

## Notas importantes

- ⚠️ **Los archivos fuente originales (`/src`) NUNCA se suben a GitHub.** El `.gitignore` ya está configurado para excluir `/src`.
- ⚠️ **`/dist` tampoco se sube a `main`** — solo se publica a `gh-pages` via `npm run deploy`.
- 🔒 **El único contenido público en GitHub Pages es el de la rama `gh-pages`** (código ofuscado).
- 🔄 **Ante cualquier cambio en `/src`, ejecutar `npm run deploy`.**
- 📦 La carpeta `node_modules/` está excluida del repo (solo se necesita para desarrollo local).
- 🐍 La carpeta `py/` contiene scripts auxiliares de scraping y NO se incluye en el build ni en el repo.
- 🧹 Para limpiar el build: `npm run clean`

---

## Dependencias de desarrollo

| Paquete                  | Versión | Propósito                              |
| ------------------------ | ------- | -------------------------------------- |
| `terser`                 | ^5.x    | Minificación de JavaScript             |
| `javascript-obfuscator`  | ^5.x    | Ofuscación de JavaScript               |
| `html-minifier-terser`   | ^7.x    | Minificación de HTML                   |
| `gh-pages`               | ^6.x    | Publicación de dist/ a rama gh-pages   |
