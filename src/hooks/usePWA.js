import { useState, useEffect } from "react";

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está en modo App (Standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    // 2. Escuchar el evento mágico de Chrome
    const handleBeforeInstallPrompt = (e) => {
      // IMPORTANTE: Prevenir que Chrome muestre su barra automática abajo
      // para que nosotros tengamos el control con nuestro botón.
      e.preventDefault();

      // Guardamos el evento para usarlo después
      setDeferredPrompt(e);

      // Avisamos a la UI que muestre el botón
      setIsInstallable(true);
    };

    // 3. Detectar cuando se instaló exitosamente
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.error("No hay prompt de instalación guardado. Posiblemente ya instalado o bloqueado por el navegador.");
      return;
    }

    // Disparamos el prompt nativo
    deferredPrompt.prompt();

    // Esperamos la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;

    // Limpiamos la variable (solo sirve una vez)
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, isInstalled, installApp };
};