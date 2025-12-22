import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <--- Importante para que ande el botón
import { Card, CardBody, Button, Switch, Chip, Snippet } from "@nextui-org/react";
import { 
  Moon, Sun, Smartphone, CheckCircle, Coffee, Settings, Mail, HelpCircle
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import { usePWA } from "../../hooks/usePWA";

import UserSection from "./components/UserSection";
import DataSection from "./components/DataSection";

const ConfigPage = () => {
  const navigate = useNavigate(); // Hook para navegar
  const { user } = useUserStore();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDark, setIsDark] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Tema Inicial
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || !savedTheme) { 
        setIsDark(true);
        document.documentElement.classList.add("dark");
    } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
    }
    const isDeviceIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isDeviceIOS);
  }, []);

  const handleThemeChange = (isSelected) => {
    setIsDark(isSelected);
    if (isSelected) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:brunousain03@gmail.com?subject=Soporte Gestor Universitario";
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Settings size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-default-500 text-sm">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      {/* 1. SECCIÓN USUARIO (Siempre arriba) */}
      <UserSection />

      {/* 2. SECCIÓN AYUDA (Subida de nivel para visibilidad) */}
      <Card className="border border-primary/20 bg-primary/5 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-lg shadow-md shadow-primary/30">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">¿Cómo funciona?</p>
                  <p className="text-xs text-default-500">Repetir el tour de bienvenida.</p>
                </div>
              </div>
              
              <Button 
                size="sm"
                color="primary" 
                variant="solid" 
                className="font-medium"
                onPress={() => {
                    // 1. Guardamos la "orden"
                    localStorage.setItem("showTutorial", "true");
                    // 2. Ejecutamos la navegación al Dashboard
                    navigate("/");
                }}
              >
                Ver Tutorial
              </Button>
            </div>
          </CardBody>
        </Card>

      {/* 3. SECCIÓN GENERAL (Tema, PWA, Soporte) */}
      <div className="space-y-4">
          <h3 className="text-lg font-bold px-1 mt-4">General</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tema */}
              <Card className="border border-default-100 shadow-sm">
                <CardBody className="p-5 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-default-100 rounded-lg"><Moon size={20}/></div>
                        <div className="flex flex-col">
                            <span className="font-semibold">Modo Oscuro</span>
                            <span className="text-tiny text-default-500">Interfaz</span>
                        </div>
                    </div>
                    <Switch 
                        color="secondary"
                        isSelected={isDark} onValueChange={handleThemeChange}
                        thumbIcon={({ isSelected, className }) => isSelected ? <Moon className={className} /> : <Sun className={className} />}
                    />
                </CardBody>
              </Card>

              {/* PWA */}
              <Card className="border-none shadow-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <CardBody className="p-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md"><Smartphone size={20}/></div>
                            <div className="flex flex-col">
                                <span className="font-bold">App Móvil</span>
                                <span className="text-tiny text-white/80">Instalar</span>
                            </div>
                        </div>
                        {isInstalled ? (
                            <Chip className="bg-white/20 text-white border-white/30" variant="bordered" startContent={<CheckCircle size={14}/>}>Lista</Chip>
                        ) : isInstallable ? (
                            <Button size="sm" className="bg-white text-indigo-600 font-bold" onPress={installApp}>Bajar</Button>
                        ) : isIOS ? (
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Compartir &gt; Inicio</span>
                        ) : null}
                    </div>
                </CardBody>
              </Card>
          </div>

          {/* Soporte */}
          <Card className="border border-default-100 shadow-sm">
            <CardBody className="p-5 flex flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-default-100 rounded-lg"><Mail size={20}/></div>
                     <div>
                        <h3 className="font-bold text-sm">¿Necesitas ayuda?</h3>
                        <p className="text-xs text-default-500">Reportar bugs o consultas</p>
                     </div>
                </div>
                <Button size="sm" variant="flat" onPress={handleContactSupport}>
                    Contactar
                </Button>
            </CardBody>
          </Card>

          {/* Donación */}
          <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
            <CardBody className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900 dark:text-blue-300">
                        <Coffee size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100">Invítame un café</h3>
                        <p className="text-xs text-blue-700/80 dark:text-blue-300/80">Apoya el desarrollo</p>
                    </div>
                </div>
                <Snippet symbol="" className="w-full bg-white dark:bg-black border border-blue-100 dark:border-blue-900">
                    Bruno.Giraudo.s
                </Snippet>
            </CardBody>
          </Card>
      </div>

      {/* 4. SECCIÓN DATOS (Al final, zona de peligro) */}
      <div className="pt-4">
          <h3 className="text-lg font-bold px-1 mb-4 text-danger">Zona de Datos</h3>
          <DataSection />
      </div>

      <p className="text-center text-xs text-default-400 pt-8">
        Uplanner v3 • Bruno Giraudo
      </p>
    </div>
  );
};

export default ConfigPage;