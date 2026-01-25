# Guías de Estilo y Contribución

Para mantener la calidad y consistencia del código en **Gestor Universitario v2**, seguimos estas directrices.

## Convenciones de Código

### React y JSX
- **Componentes Funcionales**: Usar siempre functional components con Hooks.
- **Nombres**: PascalCase para componentes (`MiComponente.jsx`), camelCase para funciones y variables (`miFuncion`).
- **Imports**: Agrupar imports por categoría:
  1. React y librerías externas (`react`, `framer-motion`).
  2. Componentes internos (`../components/...`).
  3. Hooks y Stores (`../stores/...`).
  4. Utils y Configs.

### Estilos (Tailwind CSS)
- Priorizar clases de utilidad sobre estilos en línea (`style={{...}}`).
- Usar prefijos `sm:`, `md:`, `lg:` para diseño responsivo.
- Mantener el modo oscuro en mente: usar prefijos `dark:` (ej. `bg-white dark:bg-zinc-900`).

### Estado (Zustand)
- El estado global debe ser mínimo. Si un estado solo pertenece a un componente, usar `useState`.
- Nombrar las acciones del store claramente: `setUserData`, `updateMateria`, etc.

## Estructura de Componentes

Un componente típico debe seguir este orden:

```jsx
import { useState } from "react";
// otros imports...

const MiComponente = ({ propEjemplo }) => {
  // 1. Hooks (Store, Router, Customs)
  const { user } = useUserStore();

  // 2. Estados locales
  const [isOpen, setIsOpen] = useState(false);

  // 3. Efectos (useEffect)
  
  // 4. Handlers / Funciones
  const handleClick = () => { ... };

  // 5. Render
  return (
    <div className="p-4">
      {/* JSX */}
    </div>
  );
};

export default MiComponente;
```

## Manejo de Errores

- Usar bloques `try/catch` para operaciones asíncronas (llamadas a Firebase).
- Mostrar feedback al usuario usando `sonner` (`toast.success`, `toast.error`).
- No dejar `console.log` en producción salvo par debugeo crítico.

## Git Workflow

- **Commits**: Mensajes claros e imperativos.
  - Bien: "Agrega filtro de materias en Dashboard"
  - Mal: "fix", "cambios"
- **Ramas**: Trabajar en ramas separadas para features grandes (`feature/pomodoro-mejoras`) antes de mergear a `main`.
