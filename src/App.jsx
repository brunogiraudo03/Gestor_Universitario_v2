import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "./config/firebase";
import useUserStore from "./stores/useUserStore";
import { Spinner } from "@nextui-org/react";

import LoginPage from "./pages/Auth/LoginPage";
import OnboardingPage from "./pages/Auth/OnboardingPage"; 
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlanEstudioPage from "./pages/PlanEstudio/PlanEstudioPage";
import ElectivasPage from "./pages/Electivas/ElectivasPage"; 
import CorrelativasPage from "./pages/Correlativas/CorrelativasPage";
import AgendaPage from "./pages/Agenda/AgendaPage";
import PomodoroPage from "./pages/Pomodoro/PomodoroPage";
import HorariosPage from "./pages/Horarios/HorariosPage";

function App() {
  const { user, setUser, loading: storeLoading } = useUserStore();
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
          <Route path="/" element={user ? <DashboardPage userData={userData} /> : <Navigate to="/login" />} />
          <Route path="/plan" element={user ? <PlanEstudioPage /> : <Navigate to="/login" />} />
          <Route path="/electivas" element={user ? <ElectivasPage /> : <Navigate to="/login" />} />
          <Route path="/correlativas" element={user ? <CorrelativasPage /> : <Navigate to="/login" />} />
          <Route path="/agenda" element={user ? <AgendaPage /> : <Navigate to="/login" />} />
          <Route path="/pomodoro" element={user ? <PomodoroPage /> : <Navigate to="/login" />} />
          <Route path="/horarios" element={user ? <HorariosPage /> : <Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default App;