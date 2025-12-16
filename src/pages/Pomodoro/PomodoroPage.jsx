import { useState, useEffect, useRef } from "react";
import { 
  Card, CardBody, Button, CircularProgress, Tooltip, 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure
} from "@nextui-org/react";
import { 
  Play, Pause, RotateCcw, Coffee, BrainCircuit, Armchair, 
  Settings, Volume2, VolumeX, Save 
} from "lucide-react";

// Sonido de campana
const ALARM_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const PomodoroPage = () => {
  // --- ESTADOS ---
  const [mode, setMode] = useState("focus"); // focus, short, long
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  // Configuración Personalizada (Carga desde localStorage o usa defaults)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("pomodoroConfig");
    return saved ? JSON.parse(saved) : {
      focus: 25,
      short: 5,
      long: 15,
      sound: true
    };
  });

  // Modal de Configuración
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Estado temporal para el formulario del modal
  const [tempConfig, setTempConfig] = useState(config); 

  const audioRef = useRef(new Audio(ALARM_SOUND));

  // --- EFECTOS ---

  // 1. Pedir permiso de notificaciones al inicio
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. Título de la pestaña
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.title = `${timeStr} - ${MODES[mode].label}`;
    return () => document.title = "Gestor Universitario";
  }, [timeLeft, mode]);

  // --- FUNCIONES ---

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (config.sound) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error(e));
    }

    if (Notification.permission === "granted") {
      new Notification("⏰ ¡Tiempo terminado!", {
        body: mode === "focus" ? "¡Bien hecho! Tómate un descanso." : "Hora de volver a estudiar.",
        icon: "/pwa-192x192.png"
      });
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config[mode] * 60);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(config[newMode] * 60);
  };

  const handleSaveConfig = () => {
    // Guardar en Estado y LocalStorage
    setConfig(tempConfig);
    localStorage.setItem("pomodoroConfig", JSON.stringify(tempConfig));
    
    // Aplicar cambios al timer actual (Reiniciar)
    setIsActive(false);
    setTimeLeft(tempConfig[mode] * 60);
    onOpenChange(false); // Cerrar modal
  };

  // --- DATOS VISUALES ---
  const MODES = {
    focus: { label: "Enfoque", color: "primary", icon: BrainCircuit },
    short: { label: "Corto", color: "success", icon: Coffee },
    long: { label: "Largo", color: "warning", icon: Armchair },
  };

  const totalTime = config[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 max-w-md mx-auto">
      
      {/* 1. SELECCIÓN DE MODO */}
      <div className="flex gap-2 mb-8 bg-content2 p-1.5 rounded-full shadow-inner">
        {Object.entries(MODES).map(([key, data]) => (
          <Button
            key={key}
            size="sm"
            variant={mode === key ? "solid" : "light"}
            color={mode === key ? data.color : "default"}
            onPress={() => changeMode(key)}
            className="rounded-full font-medium min-w-[80px]"
            startContent={<data.icon size={16} />}
          >
            {data.label}
          </Button>
        ))}
      </div>

      {/* 2. RELOJ PRINCIPAL */}
      <Card className="w-full shadow-xl border border-default-100 bg-gradient-to-br from-content1 to-default-50">
        <CardBody className="flex flex-col items-center justify-center py-12 relative overflow-hidden">
            
            {/* Círculo de Progreso */}
            <CircularProgress 
                classNames={{
                    svg: "w-72 h-72 drop-shadow-lg transform rotate-[-90deg]",
                    indicator: mode === "focus" ? "stroke-primary" : mode === "short" ? "stroke-success" : "stroke-warning",
                    track: "stroke-default-100/50",
                }}
                value={progress}
                strokeWidth={3}
                showValueLabel={false} 
                aria-label="Progreso"
            />

            {/* Texto del Reloj */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-7xl font-black tracking-tighter tabular-nums text-foreground drop-shadow-sm">
                    {formatTime(timeLeft)}
                </span>
                <p className="text-default-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 opacity-80">
                    {isActive ? "TIEMPO RESTANTE" : "LISTO PARA EMPEZAR"}
                </p>
            </div>
            
            {/* Botón Flotante Configuración (Dentro de la card para diseño limpio) */}
            <div className="absolute top-4 right-4">
                <Button isIconOnly size="sm" variant="light" onPress={() => { setTempConfig(config); onOpen(); }}>
                    <Settings size={20} className="text-default-400 hover:text-foreground transition-colors"/>
                </Button>
            </div>

        </CardBody>
      </Card>

      {/* 3. CONTROLES INFERIORES */}
      <div className="flex items-center gap-8 mt-10">
        
        <Tooltip content="Reiniciar Reloj">
            <Button isIconOnly radius="full" variant="flat" className="bg-default-100 text-default-500" onPress={resetTimer}>
                <RotateCcw size={22} />
            </Button>
        </Tooltip>

        <Button 
            size="lg" 
            radius="full" 
            className={`w-24 h-24 shadow-2xl transition-transform active:scale-95 ${isActive ? "bg-default-200 text-default-600" : `bg-${MODES[mode].color} text-white`}`}
            onPress={toggleTimer}
        >
            {isActive ? <Pause size={38} className="fill-current"/> : <Play size={38} className="fill-current ml-1"/>}
        </Button>

        <Tooltip content={config.sound ? "Sonido Activado" : "Silenciado"}>
            <Button 
                isIconOnly radius="full" variant="flat" 
                className={config.sound ? "bg-primary/10 text-primary" : "bg-default-100 text-default-400"}
                onPress={() => setConfig({...config, sound: !config.sound})}
            >
                {config.sound ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </Button>
        </Tooltip>

      </div>

      <p className="mt-8 text-center text-xs text-default-400 max-w-[250px] leading-relaxed">
        {mode === "focus" 
            ? "💡 Tip: Evita mirar el celular hasta que suene la campana." 
            : "🧘 Tip: Levántate, estira las piernas y toma agua."}
      </p>

      {/* --- MODAL DE CONFIGURACIÓN --- */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Configuración del Timer</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                    <p className="text-sm text-default-500">Ajusta los tiempos en minutos:</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <Input 
                            type="number" 
                            label="Enfoque" 
                            labelPlacement="outside"
                            placeholder="25"
                            endContent={<span className="text-default-400 text-xs">min</span>}
                            value={tempConfig.focus}
                            onChange={(e) => setTempConfig({...tempConfig, focus: Number(e.target.value)})}
                        />
                        <Input 
                            type="number" 
                            label="Corto" 
                            labelPlacement="outside"
                            placeholder="5"
                            endContent={<span className="text-default-400 text-xs">min</span>}
                            value={tempConfig.short}
                            onChange={(e) => setTempConfig({...tempConfig, short: Number(e.target.value)})}
                        />
                        <Input 
                            type="number" 
                            label="Largo" 
                            labelPlacement="outside"
                            placeholder="15"
                            endContent={<span className="text-default-400 text-xs">min</span>}
                            value={tempConfig.long}
                            onChange={(e) => setTempConfig({...tempConfig, long: Number(e.target.value)})}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg mt-4">
                        <div className="flex items-center gap-2">
                            <Volume2 size={18} />
                            <span className="text-sm font-medium">Sonido de Campana</span>
                        </div>
                        <Switch 
                            size="sm" 
                            isSelected={tempConfig.sound} 
                            onValueChange={(val) => setTempConfig({...tempConfig, sound: val})}
                        />
                    </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={handleSaveConfig} startContent={<Save size={18}/>}>
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default PomodoroPage;