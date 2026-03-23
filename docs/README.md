# Documentación de Gestor Universitario v2 (Uplanner)

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
   - **Electivas**: Créditos y metas optativas.
   - **Correlativas**: Mapa de habilitaciones.
   - **Tableros**: Kanban para proyectos y tareas.
   - **Agenda**: Calendario de entregas y eventos.
   - **Horarios**: Organización semanal de cursada.
   - **Pomodoro**: Timer de estudio integrado.

4. **[Guía de Estilos y Contribución (GUIDELINES)](./GUIDELINES.md)**
   - Convenciones de código.
   - Estilos UI (NextUI + Tailwind).
   - Buenas prácticas (Componentes, Hooks).

5. **[Contexto General de la App (APP_CONTEXT)](./APP_CONTEXT.md)**
   - Quiénes usan la app y para qué.
   - Modelo de datos en Firestore.
   - Decisiones de diseño importantes.

6. **[Reglas para IAs (AI_RULES)](./AI_RULES.md)**
   - Qué no romper.
   - Patrones a seguir.
   - Precauciones con Firebase.

---

## Resumen Rápido

El **Gestor Universitario v2 (Uplanner)** es una PWA (Progressive Web App) diseñada para ayudar a estudiantes universitarios a organizar su vida académica. Permite llevar un control exhaustivo de materias, notas, horarios, tareas y proyectos, todo sincronizado en la nube mediante Firebase.

### Tecnologías Principales

- **Frontend**: React 19 + Vite
- **UI Framework**: NextUI v2 + TailwindCSS
- **Backend/DB**: Firebase Authentication & Firestore
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Animaciones**: Framer Motion

Para comenzar, revisa la guía de [Configuración](./SETUP.md).
