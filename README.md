# 🎓 Uplanner - Gestor Universitario Inteligente

![Uplanner Banner](public/pwa-512x512.png) 
**Uplanner** es una Progressive Web App (PWA) diseñada para estudiantes universitarios que buscan organizar su carrera académica de manera eficiente, visual e inteligente. Más que una simple agenda, es un asistente que te ayuda a tomar decisiones sobre tu cursada.

🔗 **Demo en vivo:** [https://uplanner.web.app](https://uplanner.web.app)

---

## 🚀 Características Principales

### 📊 Dashboard Académico
Panel de control centralizado con estadísticas en tiempo real:
- **Promedio General:** Cálculo automático basado en tus notas finales.
- **Progreso de Carrera:** Visualización del porcentaje de materias aprobadas vs. total.
- **Estado Actual:** Detección inteligente de si estás en "Modo Vacaciones" o cursando actualmente.
- **Próximos Vencimientos:** Alertas de entregas o exámenes cercanos.

### 📅 Sistema de Horarios Inteligente
- **Grilla Interactiva:** Visualización semanal de clases con detección de superposiciones.
- **Tarjeta "En Vivo":** El dashboard te muestra automáticamente qué materia estás cursando ahora o cuál es la siguiente, filtrando las que ya terminaron en el día.
- **Personalización:** Asignación de colores, aulas y comisiones por materia.

### 🔗 Mapa de Correlativas (Graph View)
- Visualización de nodos interconectados para entender el plan de estudios.
- **Semáforo Académico:**
  - 🟢 **Habilitada:** Materias que puedes cursar (correlativas cumplidas).
  - 🔴 **Bloqueada:** Materias que aún no puedes cursar.
  - ✅ **Aprobada:** Materias ya finalizadas.

### 🏆 Gestión de Electivas y Metas
- Sistema de "créditos" gamificado.
- Configuración de metas personalizadas (ej: "Juntar 20 créditos para el título intermedio").
- Barras de progreso dinámicas para cada objetivo.

### 🔥 Sistema de Hábitos
- **Rastreador de Hábitos Diarios:** Crea y monitorea hábitos académicos y personales.
- **Estadísticas Detalladas:** Visualiza tu progreso con gráficos de racha, tasa de éxito y calendario de actividad.
- **Categorías Personalizables:** Organiza hábitos por tipo (Estudio, Salud, Productividad, etc.).
- **Recordatorios:** Configura notificaciones para no olvidar tus hábitos.

### 📋 Tableros Kanban
- **Organización Visual:** Gestiona proyectos y tareas con tableros estilo Trello/Notion.
- **Listas y Tarjetas:** Crea listas personalizadas y arrastra tarjetas entre ellas.
- **Integración con Agenda:** Convierte tarjetas en tareas con fechas de vencimiento.
- **Sincronización Automática:** Eliminar una lista borra todas sus tareas asociadas en la agenda.
- **Fondos Personalizados:** Elige entre gradientes modernos para cada tablero.

### 🍅 Pomodoro Timer Mejorado
- **Mascota Interactiva:** Acompañante animado que reacciona a tu estado (estudiando, cansado, descansando).
- **Timer de Alta Precisión:** Usa `requestAnimationFrame` para eliminar delays (sin retraso de Google).
- **Persistencia en Background:** El timer sigue funcionando aunque salgas de la página.
- **Sistema de Estadísticas:** Rastrea sesiones completadas, minutos estudiados y racha de días.
- **Gamificación:** Mensajes motivacionales basados en tu progreso.
- **Diseño Compacto:** Optimizado para móvil, todo visible sin scroll.

### 📱 PWA (Progressive Web App)
- **Instalable:** Funciona como una app nativa en Android/iOS.
- **Offline First:** Consulta tus datos básicos sin conexión.
- **Modo Oscuro:** Interfaz adaptativa (Dark/Light mode) automática o manual.

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue construido utilizando un stack moderno y escalable:

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** JavaScript (ES6+)
- **Estilos & UI:** [Tailwind CSS](https://tailwindcss.com/) + [NextUI](https://nextui.org/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Hosting)
- **Gestión de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Fechas:** [Date-fns](https://date-fns.org/)
- **Visualización de Grafos:** [React Flow](https://reactflow.dev/)
- **Notificaciones:** [Sonner](https://sonner.emilkowal.ski/)

---

## 👨‍💻 Autor

Desarrollado por **Bruno Giraudo**.
Estudiante de Ingeniería en Sistemas.

---

*Uplanner © 2025 - Todos los derechos reservados.*