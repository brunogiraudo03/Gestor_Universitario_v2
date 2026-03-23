# Reglas para IAs — Uplanner

> Este documento establece las convenciones, restricciones y patrones que toda IA o desarrollador debe respetar al trabajar en este proyecto.

---

## 🛑 Lo que NUNCA debes hacer

1. **No borrar ni modificar `src/config/firebase.js`** sin entender bien las consecuencias. Es el punto central de conexión con Firebase.

2. **No cambiar la estructura de Firestore** (rutas de colecciones) sin actualizar también los hooks correspondientes. Un cambio de path rompe todo el acceso a datos silenciosamente.

3. **No agregar dependencias nuevas pesadas** sin justificación. El bundle ya tiene NextUI, Recharts, Framer Motion, Firebase SDK y driver.js. Buscar primero si la funcionalidad ya existe en el proyecto.

4. **No romper el layout del Dashboard**. Es la página más importante y más compleja. Tiene 5 hooks cargando en paralelo, un `useMemo` con toda la lógica de stats, y una grilla responsive específica. Cambiar el layout sin entender la estructura puede romper la carga o la responsividad.

5. **No eliminar el `BookLoader`**. El loader de libro animado es intencional y forma parte de la identidad visual. El mínimo de carga es 800ms.

6. **No tocar `useUserStore`** sin entender que `user` (Firebase Auth object) y `userData` (Firestore doc) son cosas distintas. Muchos componentes dependen de ambos.

---

## ✅ Patrones que debes seguir

### Agregar un nuevo módulo (página)

Un módulo nuevo sigue este patrón exacto:

1. **Crear carpeta** en `src/pages/NombreModulo/` con `NombreModuloPage.jsx` (y subcarpeta `components/` si hay subcomponentes).
2. **Crear hook** en `src/hooks/useNombreModulo.js` que maneje la lógica de Firestore (CRUD + onSnapshot).
3. **Registrar la ruta** en `src/App.jsx` con lazy import y la ruta protegida.
4. **Agregar al sidebar** en `src/components/Sidebar.jsx` en el array `menuItems`.
5. **Agregar paso al tutorial** en `src/config/tutorialSteps.js` si corresponde.

### Estructura de un hook de datos

```js
export const useNombreModulo = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserStore();

    const datosRef = useMemo(
        () => user ? collection(db, 'usuarios', user.uid, 'nombreColeccion') : null,
        [user]
    );

    useEffect(() => {
        if (!user || !datosRef) { setLoading(false); return; }
        const unsubscribe = onSnapshot(datosRef, (snap) => {
            setDatos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, datosRef]);

    // Funciones CRUD: agregar, editar, borrar...

    return { datos, loading, agregar, editar, borrar };
};
```

### Mostrar feedback al usuario

Siempre usar `sonner` para toasts. Nunca usar `alert()`:

```js
import { toast } from 'sonner';
toast.success('Guardado correctamente');
toast.error('Error al guardar');
```

### Estilos y diseño

- Usar **clases de TailwindCSS** para estilos. Evitar `style={{}}` en línea salvo para valores dinámicos (colores de usuario, gradientes de tablero).
- Usar los componentes de **NextUI** para inputs, modales, botones, cards. No crear componentes de UI desde cero si NextUI ya lo tiene.
- Mantener el **modo oscuro**: usar clases `dark:` cuando los colores de fondo/texto sean distintos en dark mode.
- El breakpoint principal es `lg:` para layouts de columnas (sidebar ocurre en `md:`).

---

## ⚠️ Comportamientos no obvios a tener en cuenta

### El `isLoading` del Dashboard
El dashboard considera que está cargando si **cualquiera** de sus hooks de datos aún no terminó. Si agregás un nuevo hook al dashboard, debés incluir su `loading` en la condición `isLoading`.

### Firestore y suscripciones en tiempo real
Los hooks usan `onSnapshot` que crea una suscripción en tiempo real. Siempre retornar el `unsubscribe` en el cleanup del `useEffect`. Si no, habrá memory leaks.

### Orden del sidebar
El orden de `menuItems` en `Sidebar.jsx` refleja la prioridad de uso del producto. Si agregás módulos, respetá la lógica: primero lo académico (Plan, Electivas, Correlativas), luego herramientas (Tableros, Agenda, Horarios, Pomodoro).

### Tutorial (driver.js)
El tutorial se lanza cuando `isLoading` pasa a `false` por primera vez. Los `element` en `tutorialSteps.js` deben coincidir con los `id` de los elementos del DOM. Si un elemento no existe, driver.js puede crashear silenciosamente en ese paso.

### El Onboarding
Si un usuario está autenticado pero su documento en Firestore no tiene `carrera`, se redirige a `OnboardingPage`. Esta lógica está en `App.jsx`. No modificar sin entender este flujo o los usuarios nuevos quedarán bloqueados.

### Modo vacaciones en Dashboard
Si el hook `useHorarios` devuelve un array vacío, el Dashboard muestra "Modo Vacaciones". Esto es intencional para los períodos sin cursada.

---

## 📁 Estructura de archivos de referencia rápida

| Necesito... | Mirar en... |
|---|---|
| La ruta de una página | `src/App.jsx` |
| Los ítems del menú | `src/components/Sidebar.jsx` |
| Los datos del usuario logueado | `src/stores/useUserStore.js` |
| Los pasos del tutorial | `src/config/tutorialSteps.js` |
| La config de Firebase | `src/config/firebase.js` |
| La lógica de una sección del Dashboard | `src/pages/Dashboard/DashboardPage.jsx` (useMemo `stats`) |
| Los fondos de los tableros | `src/utils/boardBackgrounds.js` |

---

## 📝 Convenciones de nomenclatura

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `HabitCard.jsx`, `DashboardPage.jsx` |
| Custom Hooks | camelCase con prefijo `use` | `useMaterias.js`, `useTableros.js` |
| Funciones handler | camelCase con prefijo `handle` | `handleSubmit`, `handleDelete` |
| Variables de estado | camelCase descriptivo | `isLoading`, `selectedMateria` |
| Colecciones Firestore | camelCase en plural | `materias`, `tableros`, `horarios` |
| IDs de Firestore | auto-generados por `addDoc` (no crear manualmente) | — |
