import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Importamos esto
import { auth, db } from "./config/firebase";
import useUserStore from "./stores/useUserStore";
import { Spinner } from "@nextui-org/react";

import LoginPage from "./pages/Auth/LoginPage";
import OnboardingPage from "./pages/Auth/OnboardingPage"; // Importamos la nueva página
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlanEstudioPage from "./pages/PlanEstudio/PlanEstudioPage";
import ElectivasPage from "./pages/Electivas/ElectivasPage"; 

function App() {
  const { user, setUser, loading: storeLoading } = useUserStore();
  const [appLoading, setAppLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Usamos estado local para datos extra del usuario (como la carrera)
  const [userData, setUserData] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. Usuario logueado, buscamos sus datos en Firestore
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().carrera) {
          // Ya tiene carrera -> Todo OK
          setUserData(docSnap.data());
          setUser(currentUser);
          setNeedsOnboarding(false);
        } else {
          // No tiene carrera -> Necesita Onboarding
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

  // Función para recargar la app después del onboarding
  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    window.location.reload(); // Recarga simple para asegurar que todo cargue bien
  };

  if (appLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" color="primary" label="Iniciando motores..." />
      </div>
    );
  }

  // Lógica de Rutas Protegidas
  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      
      {/* Si está logueado pero necesita onboarding, mostramos SÓLO esa página */}
      {user && needsOnboarding ? (
        <Route path="*" element={<OnboardingPage onComplete={handleOnboardingComplete} />} />
      ) : (
        <>
          {/* Rutas normales de la App (Solo accesibles si NO necesita onboarding) */}
          <Route path="/" element={user ? <DashboardPage userData={userData} /> : <Navigate to="/login" />} />
          <Route path="/plan" element={user ? <PlanEstudioPage /> : <Navigate to="/login" />} />
          <Route path="/electivas" element={user ? <ElectivasPage /> : <Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default App;