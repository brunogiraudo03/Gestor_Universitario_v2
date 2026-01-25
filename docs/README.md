# Documentación de Gestor Universitario v2

Bienvenido a la documentación oficial del **Gestor Universitario v2**. Esta carpeta contiene información detallada sobre la arquitectura, configuración, características y guías de uso de la aplicación.

## Índice de Contenidos

1. **[Introducción y Configuración (SETUP)](./SETUP.md)**
   - Requisitos previos (Node.js, Firebase).
   - Instalación de dependencias.
   - Variables de entorno.
   - Comandos disponibles (`npm run dev`, `build`, etc.).

2. **[Arquitectura del Proyecto (ARCHITECTURE)](./ARCHITECTURE.md)**
   - Estructura de carpetas (`src/pages`, `src/stores`, etc.).
   - Stack tecnológico (React 19, Vite, TailwindCSS, Firebase).
   - Gestión de estado con Zustand.
   - Flujo de autenticación y rutas.

3. **[Características y Funcionalidades (FEATURES)](./FEATURES.md)**
   - **Dashboard**: Vista general y métricas.
   - **Plan de Estudio**: Gestión de materias y progreso.
   - **Agenda**: Calendario de entregas y eventos.
   - **Horarios**: Organización semanal de cursada.
   - **Pomodoro**: Timer de estudio integrado.
   - **Hábitos**: Tracker de hábitos diarios/semanales.
   - **Tableros**: Gestión de tareas estilo Kanban.

4. **[Guía de Estilos y Contribución (GUIDELINES)](./GUIDELINES.md)**
   - Convenciones de código.
   - Estilos UI (NextUI + Tailwind).
   - Buenas prácticas (Componentes, Hooks).

---

## Resumen Rápido

El **Gestor Universitario v2** es una PWA (Progressive Web App) diseñada para ayudar a estudiantes universitarios a organizar su vida académica. Permite llevar un control exhaustivo de materias, notas, horarios, tareas y hábitos de estudio, todo sincronizado en la nube mediante Firebase.

### Tecnologías Principales

- **Frontend**: React 19 + Vite
- **UI Framework**: NextUI v2 + TailwindCSS
- **Backend/DB**: Firebase Authentication & Firestore
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Charts**: Recharts

Para comenzar, revisa la guía de [Configuración](./SETUP.md).
