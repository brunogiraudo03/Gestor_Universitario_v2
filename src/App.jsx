import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "./config/firebase";
import useUserStore from "./stores/useUserStore";
import { Spinner } from "@nextui-org/react";

// --- TUS COMPONENTES ORIGINALES ---
import LoginPage from "./pages/Auth/LoginPage";
import OnboardingPage from "./pages/Auth/OnboardingPage"; 
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlanEstudioPage from "./pages/PlanEstudio/PlanEstudioPage"; // <--- Tu nombre correcto
import ElectivasPage from "./pages/Electivas/ElectivasPage"; 
import CorrelativasPage from "./pages/Correlativas/CorrelativasPage";
import AgendaPage from "./pages/Agenda/AgendaPage";
import PomodoroPage from "./pages/Pomodoro/PomodoroPage";
import HorariosPage from "./pages/Horarios/HorariosPage";
import ConfigPage from "./pages/Config/ConfigPage";

// --- EL NUEVO LAYOUT (Para celular) ---
import Layout from "./components/Layout"; 

function App() {
  const { user, setUser } = useUserStore();
  const [appLoading, setAppLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().carrera) {
          setUserData(docSnap.data());
          setUser(currentUser);
          setNeedsOnboarding(false);
        } else {
          setUser(currentUser);
          setNeedsOnboarding(true);
        }
      } else {
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
        <Spinner size="lg" color="primary" label="Iniciando motores..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      
      {user && needsOnboarding ? (
        <Route path="*" element={<OnboardingPage onComplete={handleOnboardingComplete} />} />
      ) : (
        <>
          {/* AQUÍ ESTÁ LA MAGIA:
             Envolvemos tus páginas dentro de <Layout>...</Layout>
             para que tengan el menú lateral y la versión móvil.
          */}
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
          <Route path="/config" element={user ? <Layout><ConfigPage /></Layout> : <Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default App;