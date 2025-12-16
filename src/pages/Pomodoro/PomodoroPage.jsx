import { useState, useEffect, useRef } from "react";
import { 
  Button, Card, CardBody, CircularProgress, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure 
} from "@nextui-org/react";
import { Play, Pause, RotateCcw, Settings2, Timer, Coffee, Armchair } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PomodoroPage = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Para el modal de configuración

  // Configuración inicial (minutos)
  const [config, setConfig] = useState({
    focus: 25,
    short: 5,
    long: 15
  });

  // Estados del Timer
  const [mode, setMode] = useState("focus"); // 'focus', 'short', 'long'
  const [timeLeft, setTimeLeft] = useState(config.focus * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef(null);

  // Colores y textos según el modo
  const modeData = {
    focus: { color: "danger", icon: Timer, label: "Modo Enfoque", quote: "Mantente concentrado." },
    short: { color: "success", icon: Coffee, label: "Descanso Corto", quote: "Respira y estira." },
    long: { color: "primary", icon: Armchair, label: "Descanso Largo", quote: "Recarga energías." }
  };

  // Efecto del Cronómetro
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      // Aquí podrías poner un sonido de alarma en el futuro
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // Cambiar de modo
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(config[newMode] * 60);
  };

  // Formatear tiempo mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular porcentaje para el círculo (inverso: empieza lleno 100 y baja a 0)
  const totalTime = config[mode] * 60;
  const progressValue = (timeLeft / totalTime) * 100;

  // Guardar configuración nueva
  const handleSaveConfig = (newConfig) => {
    setConfig({
        focus: parseInt(newConfig.focus) || 25,
        short: parseInt(newConfig.short) || 5,
        long: parseInt(newConfig.long) || 15
    });
    // Si estamos editando el modo actual, reseteamos el tiempo
    if (mode === "focus") setTimeLeft((parseInt(newConfig.focus) || 25) * 60);
    if (mode === "short") setTimeLeft((parseInt(newConfig.short) || 5) * 60);
    if (mode === "long") setTimeLeft((parseInt(newConfig.long) || 15) * 60);
    
    setIsActive(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto min-h-screen flex flex-col">
      <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="mb-4 pl-0 text-default-500 self-start">
        Volver al Dashboard
      </Button>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        
        {/* Selector de Modos (Chips) */}
        <div className="flex gap-4 p-2 bg-default-100 rounded-full">
            {Object.keys(modeData).map((m) => (
                <Chip
                    key={m}
                    variant={mode === m ? "solid" : "light"}
                    color={mode === m ? modeData[m].color : "default"}
                    className="cursor-pointer transition-all px-4 py-5 font-bold"
                    onClick={() => switchMode(m)}
                >
                    {modeData[m].label}
                </Chip>
            ))}
        </div>

        {/* El Gran Reloj */}
        <div className="relative flex items-center justify-center">
            {/* Círculo de Fondo (Sombra) */}
            <CircularProgress
                classNames={{
                    svg: "w-[300px] h-[300px] drop-shadow-md",
                    indicator: `stroke-${modeData[mode].color}-500`,
                    track: "stroke-default-100",
                }}
                value={progressValue}
                strokeWidth={3}
                showValueLabel={false}
                size="lg"
                aria-label="Timer visual"
            />
            
            {/* Contenido Central */}
            <div className="absolute flex flex-col items-center gap-2">
                <span className={`text-7xl font-bold tracking-tighter text-${modeData[mode].color}-500 font-mono`}>
                    {formatTime(timeLeft)}
                </span>
                <p className="text-default-400 font-medium">{isActive ? "CORRIENDO" : "PAUSADO"}</p>
            </div>
        </div>

        {/* Cita motivacional dinámica */}
        <p className="text-xl text-default-500 font-light italic text-center max-w-md">
            "{modeData[mode].quote}"
        </p>

        {/* Controles Principales */}
        <div className="flex items-center gap-6">
            <Button 
                isIconOnly size="lg" radius="full" variant="flat" color="default"
                onPress={() => onOpen()}
            >
                <Settings2 />
            </Button>

            <Button 
                size="lg" radius="full" 
                color={modeData[mode].color} 
                variant="shadow"
                className="w-32 h-16 text-2xl"
                onPress={() => setIsActive(!isActive)}
            >
                {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </Button>

            <Button 
                isIconOnly size="lg" radius="full" variant="flat" color="default"
                onPress={() => { setIsActive(false); setTimeLeft(config[mode] * 60); }}
            >
                <RotateCcw />
            </Button>
        </div>

      </div>

      {/* Modal de Configuración */}
      <ConfigModal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        currentConfig={config} 
        onSave={handleSaveConfig} 
      />
    </div>
  );
};

// Componente pequeño para el modal de configuración
const ConfigModal = ({ isOpen, onOpenChange, currentConfig, onSave }) => {
    const [localConfig, setLocalConfig] = useState(currentConfig);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Personalizar Tiempos (minutos)</ModalHeader>
                        <ModalBody>
                            <div className="flex gap-4">
                                <Input type="number" label="Enfoque" value={localConfig.focus} onChange={(e) => setLocalConfig({...localConfig, focus: e.target.value})} />
                                <Input type="number" label="Descanso Corto" value={localConfig.short} onChange={(e) => setLocalConfig({...localConfig, short: e.target.value})} />
                                <Input type="number" label="Descanso Largo" value={localConfig.long} onChange={(e) => setLocalConfig({...localConfig, long: e.target.value})} />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={() => { onSave(localConfig); onClose(); }}>
                                Guardar Cambios
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PomodoroPage;