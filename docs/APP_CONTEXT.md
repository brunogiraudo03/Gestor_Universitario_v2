# Contexto General de la App — Uplanner

> Documento de referencia rápida para desarrolladores e IAs que trabajen en el proyecto por primera vez.

---

## ¿Qué es Uplanner?

**Uplanner** (Gestor Universitario v2) es una **PWA** (Progressive Web App) para organización académica universitaria. Fue construida para uso personal por un grupo reducido de estudiantes (el autor + amigos cercanos) para gestionar el cursado de la carrera de **Ingeniería en Sistemas** a lo largo del ciclo lectivo.

No es un producto SaaS ni tiene usuarios masivos: las restricciones del plan gratuito de Firebase (Spark) son asumibles para el volumen real de uso.

---

## Usuarios y Contexto de Uso

| Campo | Valor |
|---|---|
| **Usuarios** | El creador + amigos (grupo pequeño, < 10 personas) |
| **Carrera** | Ingeniería en Sistemas (universidad argentina) |
| **Año** | 3er año en adelante |
| **Ciclo de vida** | App en uso durante todo el ciclo lectivo |
| **Deploy** | Firebase Hosting (plan gratuito Spark) |
| **Plataforma** | Web (responsive, instalable como PWA) |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework UI** | React 19 + Vite |
| **Componentes** | NextUI v2 |
| **Estilos** | TailwindCSS v3 |
| **Animaciones** | Framer Motion |
| **Backend / Auth** | Firebase Authentication + Firestore |
| **Estado global** | Zustand |
| **Router** | React Router v6 |
| **Charts** | Recharts |
| **Fechas** | date-fns |
| **Drag & Drop** | @hello-pangea/dnd |
| **Tour** | driver.js |
| **Notificaciones** | sonner (toasts) |
| **Íconos** | lucide-react |

---

## Módulos Principales

| Módulo | Ruta | Hook principal | Descripción |
|---|---|---|---|
| Dashboard | `/` | múltiples | Vista general con métricas, gráficos, clase del día y próximas entregas |
| Plan de Estudio | `/plan` | `useMaterias` | Gestión de materias, estado, notas y promedio |
| Electivas | `/electivas` | `useElectivas` | Materias optativas y metas de créditos |
| Correlativas | `/correlativas` | `useMaterias` | Mapa visual de correlatividades |
| Tableros | `/tableros` | `useTableros` + `useTarjetas` + `useListas` | Kanban estilo Trello |
| Agenda | `/agenda` | `useTodos` | Calendario de entregas y eventos académicos |
| Horarios | `/horarios` | `useHorarios` | Grilla semanal de cursada |
| Pomodoro | `/pomodoro` | local state | Timer de estudio + sonidos ambientales |
| Config | `/config` | `useUserStore` | Perfil, tema, backup/restore/reset |
| Auth | `/login` | Firebase Auth | Login con Google / Email |

---

## Modelo de Datos en Firestore

Toda la información está centrada en el usuario bajo el path `usuarios/{uid}/`:

```
usuarios/{uid}
├── (documento raíz)   → { carrera, nombre, ... }   # userData
├── materias/          → colección de materias del plan de estudio
├── horarios/          → bloques horarios semanales
├── todos/             → tareas y eventos de la agenda
├── tableros/          → tableros Kanban (doc raíz)
│   └── {tableroId}/listas/   → listas dentro del tablero
│       └── {listaId}/tarjetas/ → tarjetas de cada lista
└── electivas/         → materias electivas cursadas/aprobadas
```

> ⚠️ **Nota**: Las configuraciones de metas de electivas se guardan como un documento especial `configMetas` dentro de la colección `electivas`.

---

## Flujo de Autenticación

1. `App.jsx` escucha `onAuthStateChanged` de Firebase Auth.
2. Si hay usuario, busca el documento `usuarios/{uid}` en Firestore.
3. Si el doc tiene el campo `carrera` → usuario existente → app normal.
4. Si no tiene `carrera` → usuario nuevo → se muestra `OnboardingPage`.
5. El loader de la app es un `BookLoader` animado mientras carga.
6. Los datos del usuario se guardan en `useUserStore` (Zustand) para evitar prop-drilling.

---

## Decisiones de Diseño Importantes

### Tema visual
- Modo oscuro por defecto (se lee `localStorage.getItem("theme")`).
- Anti-flash: el tema se aplica en el primer render antes de que React hidrate.
- Toggle de tema disponible en `/config`.

### Sidebar
- Colapsable (estado en `useUIStore`).
- En mobile: drawer/overlay. En desktop: sidebar fijo.
- El orden de los ítems refleja la prioridad de uso.

### Dashboard
- Carga datos de 5 módulos en paralelo (hooks independientes con `onSnapshot`).
- `isLoading` se resuelve cuando todos los hooks terminan de cargar.
- La sección de gráficos usa **2 columnas** con `lg:grid-cols-2`.
- Las 4 KPI cards de cabecera son: Promedio, Progreso, Tableros, Próximo.

### Onboarding & Tutorial
- El tutorial usa `driver.js` y se muestra automáticamente la primera vez.
- Se puede relanzar desde `/config`.
- Los pasos del tutorial están definidos en `src/config/tutorialSteps.js`.
