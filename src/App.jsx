import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "./config/firebase";
import useUserStore from "./stores/useUserStore";
import { Spinner } from "@nextui-org/react";
import { Toaster } from 'sonner'; // Notificaciones lindas

// --- TUS PÁGINAS ---
import LoginPage from "./pages/Auth/LoginPage";
import OnboardingPage from "./pages/Auth/OnboardingPage"; 
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlanEstudioPage from "./pages/PlanEstudio/PlanEstudioPage"; 
import ElectivasPage from "./pages/Electivas/ElectivasPage"; 
import CorrelativasPage from "./pages/Correlativas/CorrelativasPage";
import AgendaPage from "./pages/Agenda/AgendaPage";
import PomodoroPage from "./pages/Pomodoro/PomodoroPage";
import HorariosPage from "./pages/Horarios/HorariosPage";
import ConfigPage from "./pages/Config/ConfigPage";

// --- LAYOUT PRINCIPAL ---
import Layout from "./components/Layout"; 

function App() {
  const { user, setUser } = useUserStore();
  const [appLoading, setAppLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userData, setUserData] = useState(null); 

  // 1. Efecto Inicial (Tema + Auth)
  useEffect(() => {
    
    // A. Lógica Anti-Flash del Tema Oscuro
    const savedTheme = localStorage.getItem("theme");
    // Si es dark O si no hay nada (default dark)
    if (savedTheme === "dark" || !savedTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // B. Escuchar cambios de Autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Si hay usuario, buscamos sus datos extra en Firestore
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().carrera) {
          // Usuario viejo (ya tiene carrera)
          setUserData(docSnap.data());
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
      setAppLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    window.location.reload(); 
  };

  if (appLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" color="primary" label="Iniciando Uplanner..." />
      </div>
    );
  }

  return (
    <>    
      {/* Sistema de Notificaciones Global */}
      <Toaster position="top-center" richColors />
      
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
    </>
  );
}

export default App;