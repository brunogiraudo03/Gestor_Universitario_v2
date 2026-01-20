import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import useUserStore from "./stores/useUserStore";
import { Spinner } from "@nextui-org/react";
import { Toaster } from 'sonner';

// --- TUS PÁGINAS (LAZY LOADING) ---
const LoginPage = lazy(() => import("./pages/Auth/LoginPage"));
const OnboardingPage = lazy(() => import("./pages/Auth/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage"));
const PlanEstudioPage = lazy(() => import("./pages/PlanEstudio/PlanEstudioPage"));
const ElectivasPage = lazy(() => import("./pages/Electivas/ElectivasPage"));
const CorrelativasPage = lazy(() => import("./pages/Correlativas/CorrelativasPage"));
const TablerosPage = lazy(() => import("./pages/Tableros/TablerosPage"));
const BoardView = lazy(() => import("./pages/Tableros/BoardView"));
const HabitosPage = lazy(() => import("./pages/Habitos/HabitosPage"));
const AgendaPage = lazy(() => import("./pages/Agenda/AgendaPage"));
const PomodoroPage = lazy(() => import("./pages/Pomodoro/PomodoroPage"));
const HorariosPage = lazy(() => import("./pages/Horarios/HorariosPage"));
const ConfigPage = lazy(() => import("./pages/Config/ConfigPage"));

// --- LAYOUT PRINCIPAL ---
import Layout from "./components/Layout";
import BookLoader from "./components/BookLoader"; // <--- IMPORTADO
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const { user, setUser, userData, setUserData } = useUserStore();

  const [appLoading, setAppLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);


  // 1. Efecto Inicial (Tema + Auth)
  useEffect(() => {

    // A. Lógica Anti-Flash del Tema Oscuro
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || !savedTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // B. Escuchar cambios de Autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // delay artificial mínimo para ver la animación de carga si carga muy rápido
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));

      if (currentUser) {
        // Si hay usuario, buscamos sus datos extra en Firestore
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().carrera) {
          // Usuario viejo (ya tiene carrera)
          setUserData(docSnap.data()); // <--- GUARDAMOS EN STORE GLOBAL
          setUser(currentUser);
          setNeedsOnboarding(false);
        } else {
          // Usuario nuevo (necesita onboarding)
          setUser(currentUser);
          setNeedsOnboarding(true);
        }
      } else {
        // No logueado
        setUser(null);
        setUserData(null);
      }

      await minLoadTime; // Esperar mínimo
      setAppLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserData]);

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    window.location.reload();
  };

  return (
    <>
      <Toaster position="top-center" richColors />

      <AnimatePresence mode="wait">
        {appLoading ? (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }} // Dar tiempo a que el libro se cierre
          >
            <BookLoader label="Preparando tu estudio..." />
          </motion.div>
        ) : (
          <div key="app-content">
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Cargando..." /></div>}>
              <Routes>
                {/* Ruta Login Pública */}
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

                {/* Rutas Privadas */}
                {user && needsOnboarding ? (
                  // Si necesita onboarding, bloqueamos todo lo demás
                  <Route path="*" element={<OnboardingPage onComplete={handleOnboardingComplete} />} />
                ) : (
                  // App Normal
                  <>
                    <Route path="/" element={user ? (
                      <Layout>
                        <DashboardPage userData={userData} />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/plan" element={user ? (
                      <Layout>
                        <PlanEstudioPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/electivas" element={user ? (
                      <Layout>
                        <ElectivasPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/correlativas" element={user ? (
                      <Layout>
                        <CorrelativasPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/tableros" element={user ? (
                      <Layout>
                        <TablerosPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/tableros/:id" element={user ? (
                      <Layout>
                        <BoardView />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/habitos" element={user ? (
                      <Layout>
                        <HabitosPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/agenda" element={user ? (
                      <Layout>
                        <AgendaPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/pomodoro" element={user ? (
                      <Layout>
                        <PomodoroPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/horarios" element={user ? (
                      <Layout>
                        <HorariosPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />

                    <Route path="/config" element={user ? (
                      <Layout>
                        <ConfigPage />
                      </Layout>
                    ) : <Navigate to="/login" />} />
                  </>
                )}
              </Routes>
            </Suspense>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;