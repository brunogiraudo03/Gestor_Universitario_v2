# Configuración e Instalación

Esta guía te ayudará a configurar el entorno de desarrollo para el **Gestor Universitario v2**.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js**: Versión 18 o superior.
- **npm**: Generalmente incluido con Node.js.
- **Git**: Para el control de versiones.

## Clonar el Repositorio

Si aún no tienes el proyecto, clónalo desde el repositorio remoto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd gestor-universitario-v2
```

## Instalación de Dependencias

Instala todas las librerías necesarias ejecutando:

```bash
npm install
```

Esto descargará dependencias clave como `react`, `vite`, `firebase`, `@nextui-org/react`, `zustand`, entre otras.

## Configuración de Firebase

El proyecto utiliza Firebase para autenticación y base de datos.
La configuración se encuentra en `src/config/firebase.js`.

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Authentication** (Google y Email/Password).
3. Habilita **Firestore Database**.
4. Crea un archivo `.env.local` en la raíz del proyecto (si no existe) y agrega tus credenciales (aunque actualmente el proyecto puede tenerlas hardcodeadas en `src/config/firebase.js`, se recomienda usar variables de entorno para mayor seguridad).

**Ejemplo de `.env.local`:**

```env
VITE_API_KEY=tu_api_key
VITE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_PROJECT_ID=tu_proyecto
VITE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_MESSAGING_SENDER_ID=123456789
VITE_APP_ID=1:123456789:web:abcdef
```

## Comandos Disponibles

En el `package.json` encontrarás los siguientes scripts:

### Desarrollo

Inicia el servidor de desarrollo local (generalmente en http://localhost:5173):

```bash
npm run dev
```

### Producción

Construye la aplicación para producción (genera la carpeta `dist`):

```bash
npm run build
```

Previsualiza la build de producción localmente:

```bash
npm run preview
```

### Linting

Ejecuta ESLint para analizar el código en busca de errores:

```bash
npm run lint
```

## Despliegue (Deploy)

Si tienes configurado Firebase Hosting:

1. Asegúrate de tener instalada la CLI de Firebase: `npm install -g firebase-tools`
2. Logueate: `firebase login`
3. Construye el proyecto: `npm run build`
4. Despliega: `firebase deploy`
