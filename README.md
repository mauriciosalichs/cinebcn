# CineLAB - Cineclub LGBTQ+ Website

Una página web completa para un cineclub LGBTQ+ en Barcelona, alojada en GitHub Pages.

**🌐 Sitio web:** [cinelabcn.es](https://cinelabcn.es)

---

## ⚠️ Aviso Importante / Important Notice

**ES:** Este repositorio es público únicamente porque se aloja en **GitHub Pages** como servicio de hosting gratuito para este proyecto sin fines de lucro. El código fuente **NO es visible** — solo se despliega código ofuscado y minificado. Consulta el archivo [LICENSE](LICENSE) para más detalles. Queda prohibida la copia, modificación o redistribución del código.

**EN:** This repository is public solely because it is hosted on **GitHub Pages** as a free hosting service for this non-profit project. The source code is **NOT visible** — only obfuscated and minified code is deployed. See the [LICENSE](LICENSE) file for details. Copying, modifying, or redistributing the code is prohibited.

---

## 🎬 Características

- ✅ **Responsive Design**: Adaptado para escritorio, tablet y móvil
- ✅ **Multi-idioma**: Español e inglés con selector en el menú
- ✅ **Menú de Navegación**: Hamburger menu en móvil, horizontal en escritorio
- ✅ **Agenda de Proyecciones**: Vista en calendario y lista con filtros por título, género y año
- ✅ **Detalles de Películas**: Modal con información completa (datos de OMDb)
- ✅ **Sistema de Usuarios**: Registro con email/contraseña y Google OAuth
- ✅ **Espacio Personal**: Perfil de usuario, historial de películas vistas, inscripción a proyecciones
- ✅ **Panel de Administración**: Gestión de perfiles de usuario (solo admins)
- ✅ **Fondo Animado**: Film-reel con fotogramas de películas en la sección hero
- ✅ **Firebase Backend**: Autenticación, Firestore y App Check
- ✅ **Configuración JSON**: Datos de películas y configuración del sitio personalizables
- ✅ **Mapa Integrado**: Google Maps embebido para la ubicación
- ✅ **Documentación Legal**: Política de Privacidad, Términos de Uso y Política de Cookies (ES/EN)

## 🏗️ Arquitectura del Proyecto

Este repositorio usa una arquitectura de **dos ramas**:

| Rama | Contenido | Propósito |
|------|-----------|-----------|
| **`main`** | Configuración, scripts de build, documentación | Desarrollo y gestión del pipeline |
| **`gh-pages`** | Código ofuscado/minificado listo para servir | GitHub Pages sirve desde aquí |

> **El código fuente (JS/HTML/CSS) vive en `/src` (excluido de git vía `.gitignore`).**
> **El código compilado se genera en `/dist` (también excluido de git) y se despliega a `gh-pages` con `npm run deploy`.**

## 📁 Estructura del Repositorio (rama `main`)

```
cinebcn/
├── scripts/
│   └── build.js                # Script de build (minificación + ofuscación)
├── src/                        # ⛔ EXCLUIDO DE GIT — código fuente local
│   ├── *.html                  # 8 páginas HTML
│   ├── partials/nav-menu.html  # Menú de navegación compartido
│   ├── js/                     # 13 archivos JavaScript originales
│   ├── css/                    # 6 archivos CSS
│   ├── data/                   # config.json, movies.json
│   └── images/                 # ~2200 fotogramas de películas
├── dist/                       # ⛔ EXCLUIDO DE GIT — output temporal del build
├── CNAME                       # Dominio personalizado (cinelabcn.es)
├── LICENSE                     # Licencia propietaria
├── DISCLAIMER.md               # Aviso legal (ES/EN)
├── BUILD_GUIDE.md              # Guía completa del pipeline de build
├── README.md                   # Este archivo
├── package.json                # Dependencias y scripts npm
└── .gitignore                  # Excluye /src, /dist, node_modules/, py/
```

## 🔐 Pipeline de Protección de Código

El pipeline automatiza la protección del código mediante:

1. **Minificación** (Terser) → Elimina comentarios, espacios, renombra variables
2. **Ofuscación** (javascript-obfuscator) → RC4, código muerto, anti-debugging, aplanamiento de control
3. **Minificación HTML** (html-minifier-terser) → Comprime HTML
4. **Copia de assets** → CSS, imágenes, datos se copian tal cual

Ver [BUILD_GUIDE.md](BUILD_GUIDE.md) para detalles completos del pipeline.

### Workflow de despliegue

```bash
# Después de modificar código en src/:
npm run deploy
```

Esto ejecuta `npm run build` (genera `/dist`) y luego publica `/dist` a la rama `gh-pages`.

## 🚀 Despliegue

Este sitio está desplegado en **GitHub Pages** desde la rama `gh-pages`, con el dominio personalizado **cinelabcn.es**.

### Servicios Externos Utilizados

| Servicio | Uso |
|---|---|
| **Firebase Authentication** | Autenticación de usuarios (email + Google) |
| **Cloud Firestore** | Base de datos de usuarios y asistencia a películas |
| **Firebase App Check** | Protección contra bots (reCAPTCHA v3) |
| **Google Maps Embed** | Mapa de ubicación del cineclub |
| **OpenStreetMap Nominatim** | Autocompletado de ciudades en registro |
| **Font Awesome 6.4.0** | Iconos (CDN) |
| **OMDb API** | Datos de películas (script Python) |

## ⚙️ Configuración

### Datos de Películas (`src/data/movies.json`)

Las películas se pueden añadir manualmente o usando el script Python:

```bash
python py/gen_movie_data.py <IMDB_CODE> [FECHA_PROYECCION] [HORA]
# Ejemplo:
python py/gen_movie_data.py tt3896198 2026-03-22 17:30
```

Cada película incluye: título, año, director, reparto, género, sinopsis (EN), sinopsis en español (añadida manualmente al campo `Plot_es`), póster, datos de proyección, puntuaciones y más datos de OMDb.

### Configuración del Sitio (`src/data/config.json`)

Contiene: ubicación del cineclub, datos de contacto, redes sociales, colores del tema y flags de features.

## 🌐 Idiomas

- **Español** (por defecto) e **Inglés**
- Selector de idioma en la cabecera de cada página
- Preferencia guardada en `localStorage`
- Todas las traducciones en `src/js/i18n.js`

## 🔒 Seguridad

- Código fuente **excluido del repositorio** (`.gitignore` protege `/src`)
- JavaScript **ofuscado** con múltiples capas de protección
- Autenticación gestionada por **Firebase Authentication**
- Acceso a datos protegido por **reglas de seguridad de Firestore**
- Protección contra bots con **Firebase App Check + reCAPTCHA v3**
- Comunicaciones cifradas vía **HTTPS**
- Roles de administrador gestionados en Firestore

## 📜 Documentación Legal

| Documento | Descripción |
|---|---|
| [LICENSE](LICENSE) | Licencia propietaria (no código abierto) |
| [DISCLAIMER.md](DISCLAIMER.md) | Aviso legal completo (ES/EN) |
| [Política de Privacidad](https://cinelabcn.es/privacy.html) | Cumplimiento RGPD/LOPDGDD (ES/EN) |
| [Términos de Uso](https://cinelabcn.es/terms.html) | Condiciones del servicio (ES/EN) |
| [Política de Cookies](https://cinelabcn.es/cookies.html) | Uso de cookies y localStorage (ES/EN) |

### Datos de Usuario

Los datos recopilados se utilizan **exclusivamente** para:
- Gestión de cuentas de usuario
- Gestión de asistencia a proyecciones de películas
- Registro de usuarios del cineclub

**No se comparten, venden ni ceden datos a terceros.** No se envía publicidad. No se realiza tracking.

## 🔧 Stack Técnico

| Capa | Tecnología |
|------|------------|
| **Frontend** | HTML5, CSS3, JavaScript vanilla (sin frameworks) |
| **Backend** | Firebase (Authentication + Firestore + App Check) |
| **Hosting** | GitHub Pages (rama `gh-pages`) |
| **Build** | Node.js (Terser + javascript-obfuscator + html-minifier-terser) |
| **Deploy** | gh-pages (npm) |
| **Iconos** | Font Awesome 6.4.0 (CDN) |
| **SDK** | Firebase v8.10.1 (UMD via unpkg CDN) |
| **Scripts** | Python 3 (scraping y generación de datos) |

## 📞 Contacto

- **Email**: contacto@cinelabcn.com
- **Instagram**: [@cinelabbcn](https://instagram.com/cinelabbcn)
- **Facebook**: [cinelabbcn](https://facebook.com/cinelabbcn)
- **Twitter**: [@cinelabbcn](https://twitter.com/cinelabbcn)

## 📝 Licencia

**Este proyecto NO es de código abierto.** Todos los derechos están reservados. El código fuente no es accesible públicamente. Ver [LICENSE](LICENSE).

---

**Hecho con ❤️ para la comunidad LGBTQ+ y hetero-friendly en Barcelona**