# Manual de Despliegue — Frontend AhorrApp en Vercel

Guía para desplegar **solo el frontend** (React + Vite) en Vercel, siguiendo los pasos realizados: crear un repositorio personal en GitHub, copiar allí el proyecto y desplegar únicamente la carpeta `Frontend/`.

---

## 1. Prerrequisitos

1. **Tener una cuenta de GitHub** en [github.com](https://github.com/).
2. **Tener una cuenta de Vercel** en [vercel.com](https://vercel.com/) (se puede iniciar sesión con la misma cuenta de GitHub).
3. **Git y Node.js instalados en local** para poder subir el código y probar el build:
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/) LTS (v18 o superior)

---

## 2. Paso 1 — Crear un repositorio en la cuenta personal

1. Entrar a [github.com](https://github.com/) con la cuenta personal.
2. Dar clic en el botón **+** (esquina superior derecha) → **New repository**.
3. Completar:
   - **Owner:** la cuenta personal (ej. `Davidb22444`)
   - **Repository name:** nombre del repositorio de despliegue (ej. `ahorrapp-despliegue`)
   - Seleccionar **Public** (o **Private** si se prefiere)
   - **No** marcar "Add a README" (el repositorio debe quedar vacío para copiar el proyecto existente)
4. Dar clic en **Create repository**.
5. GitHub mostrará la URL del repositorio, por ejemplo:
   ```
   https://github.com/Davidb22444/ahorrapp-despliegue.git
   ```

---

## 3. Paso 2 — Copiar el proyecto al nuevo repositorio personal

Desde la carpeta del proyecto en local, agregar el nuevo repositorio como remoto y subir todo el código:

```bash
# Ubicarse en la raíz del proyecto
cd Ahorrapp-REACT

# Ver el estado (debe decir "nothing to commit, working tree clean")
git status

# Agregar el repositorio personal como remoto llamado "deploy"
git remote add deploy https://github.com/Davidb22444/ahorrapp-despliegue.git

# Subir el proyecto completo a la rama main
git push -u deploy main
```

> ⚠️ Si aparece `Repository not found` revisar el nombre exacto del repositorio. Si aparece `Permission denied`, verificar que las credenciales de GitHub correspondan a la cuenta del repositorio personal.

Verificar que el proyecto quedó copiado: abrir la URL del repositorio en el navegador y confirmar que se ven las carpetas `Frontend/`, `Backend/`, `SQL/`, etc.

---

## 4. Paso 3 — Tener cuenta en Vercel y desplegar el frontend

### 4.1 Vincular el repositorio en Vercel

1. Entrar a [vercel.com](https://vercel.com/) e iniciar sesión (con la cuenta personal de GitHub).
2. Dar clic en **Add New... → Project**.
3. En **Import Git Repository** seleccionar el repositorio personal creado en el paso 1 (`ahorrapp-despliegue`) y dar clic en **Import**.
   - Si el repositorio no aparece, dar clic en **Adjust GitHub App Permissions** y otorgarle acceso.
4. En **Configure Project** ajustar los siguientes campos:

   | Campo | Valor |
   |---|---|
   | **Framework Preset** | `Vite` (se detecta automáticamente) |
   | **Root Directory** | `Frontend`  ← **paso clave: desplegar solo el frontend, el backend no interfiere** |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. **No** agregar variables de entorno: la URL del backend está fija en el código (`Frontend/src/services/api.js`).
6. Dar clic en **Deploy** y esperar (~30 s). Al terminar aparece el mensaje **Congratulations!** y la URL pública del sitio:
   ```
   https://ahorrapp-despliegue.vercel.app
   ```

### 4.2 Rutas directas (SPA rewrites)

React Router maneja rutas como `/login` o `/dashboard`. Sin esta configuración, recargar la página o entrar directo a una ruta devuelve **404**.

Crear el archivo **`Frontend/vercel.json`** con:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Subirlo al repositorio personal:

```bash
git add Frontend/vercel.json
git commit -m "agregar rewrites SPA para vercel"
git push deploy main
```

Vercel detecta el cambio y redespliega automáticamente.

---

## 5. Despliegues posteriores

Cada vez que haya cambios en el frontend:

```bash
git add .
git commit -m "descripcion del cambio"
git push deploy main
```

- Vercel detecta el push a `main` y redespliega **automáticamente** (~30 s).
- No hay que entrar al panel salvo que se cambie la configuración (Root Directory, comandos, etc.).

---

## 6. Verificación post-despliegue

1. Abrir la URL pública de Vercel → carga el login sin errores.
2. Abrir DevTools (F12) → pestaña **Console**: no debe haber errores rojos.
3. Pestaña **Network**: las llamadas al backend (`...onrender.com/api/...`) deben responder **200/201**.
4. Probar registro e inicio de sesión.
5. Probar recargar la página en una ruta interna (ej. `/dashboard`) → no debe dar 404 (si da 404, falta el `vercel.json`).

---

## 7. Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| El deploy intenta instalar dependencias del backend o falla raro | Root Directory mal configurado | En Vercel: **Settings → Build & Development → Root Directory = `Frontend`** |
| Build falla con error de `certs/private.key` | No debe ocurrir (solo aplica a `npm run dev`); probablemente es otro error de build | Reproducir en local: `cd Frontend && npm run build` y corregir el error |
| 404 al recargar o entrar directo a una ruta | Falta `Frontend/vercel.json` con rewrites | Crearlo como en el paso 4.2 |
| Pantalla en blanco al abrir el sitio | Error de JavaScript en consola | Revisar Console del navegador; verificar build local |
| Peticiones a la API bloqueadas (error CORS en consola) | El backend no tiene la URL de Vercel permitida | Reportar al equipo del backend: agregar la URL de Vercel a los orígenes permitidos en `Backend/index.js` |
| `Repository not found` al copiar el proyecto | Nombre o URL mal escritos | Verificar el nombre exacto del repositorio creado |
| `Permission denied` al hacer push | Credenciales de otra cuenta de GitHub | Regenerar credenciales o pedir acceso al repositorio |
| Vercel no redespliega al hacer push | El proyecto no está vinculado a la rama `main` | En Vercel: **Settings → Git → Production Branch = `main`** |
