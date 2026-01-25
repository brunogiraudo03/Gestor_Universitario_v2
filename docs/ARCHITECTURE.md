# Arquitectura del Proyecto

Este documento describe la estructura técnica y las decisiones de diseño del **Gestor Universitario v2**.

## Estructura de Directorios

El código fuente se encuentra en la carpeta `src/`. A continuación, se detalla la organización:

```
src/
├── components/       # Componentes reutilizables (Botones, Layouts, Loaders)
├── config/           # Configuración de servicios externos (Firebase)
├── hooks/            # Custom Hooks (Lógica reutilizable)
├── pages/            # Vistas principales (Rutas de la aplicación)
│   ├── Agenda/       # Módulo de calendario y eventos
│   ├── Auth/         # Login y Onboarding
│   ├── Config/       # Configuración de usuario y datos
│   ├── Dashboard/    # Pantalla principal con métricas
│   ├── Electivas/    # Gestión de materias electivas
│   ├── Habitos/      # Tracker de hábitos
│   ├── Horarios/     # Grilla semanal de cursada
│   ├── PlanEstudio/  # Visualización y control de carrera
│   ├── Pomodoro/     # Herramienta de enfoque
│   └── Tableros/     # Kanban y tareas pendientes
├── stores/           # Gestión de estado global (Zustand)
├── utils/            # Funciones auxiliares y helpers
├── App.jsx           # Componente raíz con Rutas y Lógica de Auth
└── main.jsx          # Punto de entrada de React
```

## Tecnologías y Decisiones

### 1. Frontend: React + Vite
Se eligió **React 19** por su ecosistema y **Vite** por su velocidad de compilación. El uso de **Lazy Loading** (`React.lazy` y `Suspense`) en `App.jsx` optimiza la carga inicial, dividiendo el código por rutas.

### 2. Estilos: TailwindCSS + NextUI
- **TailwindCSS**: Para estilos utilitarios rápidos y responsivos.
- **NextUI**: Proporciona componentes de UI accesibles y estéticos (Cards, Modals, Buttons) que aceleran el desarrollo y mantienen una consistencia visual "Pro".
- **Framer Motion**: Se utiliza para animaciones de transición (entradas de página, modales, listas).

### 3. Autenticación y Datos: Firebase
- **Authentication**: Maneja el registro y login de usuarios.
- **Firestore**: Base de datos NoSQL.
  - Estructura de datos centrada en el usuario: `usuarios/{uid}/...`
  - Subcolecciones principales: `materias`, `horarios`, `todos` (tareas), `habitos`.

### 4. Estado Global: Zustand
Se utiliza **Zustand** por su simplicidad frente a Redux o Context API para estados globales complejos.
- `useUserStore`: Almacena el objeto `user` de Firebase y datos del perfil (`userData`), evitando prop-drilling de la sesión.
- `useUIStore`: Maneja estados de interfaz como modales abiertos o sidebar colapsado.

### 5. Rutas
**React Router v6** gestiona la navegación.
- Rutas protegidas: Verifican si `user` existe; de lo contrario redirigen a `/login`.
- Ruta de Onboarding: Si el usuario es nuevo (`needsOnboarding`), se fuerza la vista de configuración inicial.

## Flujo de Datos

1. **Login**: El usuario se autentica.
2. **Carga Inicial (`App.jsx`)**:
   - `onAuthStateChanged` detecta la sesión.
   - Se consulta Firestore para obtener `userData`.
   - Se guarda la información en `useUserStore`.
3. **Interacción**:
   - Las páginas (ej. `DashboardPage`) leen del store o hacen suscripciones en tiempo real a Firestore.
   - Las acciones (crear tarea, completar hábito) escriben directamente en Firestore.

## Consideraciones de Rendimiento

- **Code Splitting**: Las páginas pesadas (Tableros, Plan de Estudio) se cargan bajo demanda.
- **Optimistic Updates**: En algunas interacciones UI se actualiza el estado local antes de confirmar con el backend (donde aplica).
- **PWA**: Configurado con `vite-plugin-pwa` para permitir instalación y caché básico.
