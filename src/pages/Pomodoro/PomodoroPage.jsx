import { useState, useEffect, useRef, useMemo } from "react";
import {
  Card, CardBody, Button, CircularProgress, Tooltip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure
} from "@nextui-org/react";
import {
  Play, Pause, RotateCcw, Coffee, BrainCircuit, Armchair,
  Settings, Volume2, VolumeX, Save, Bell, BellOff, BarChart3, Trophy
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { usePomodoroStats } from "./hooks/usePomodoroStats";

const ALARM_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const PomodoroPage = () => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("pomodoroMode");
    return saved || "focus";
  });

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("pomodoroConfig");
    return saved ? JSON.parse(saved) : {
      focus: 25,
      short: 5,
      long: 15,
      sound: true
    };
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("pomodoroTimeLeft");
    return saved ? parseInt(saved) : config[mode] * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem("pomodoroIsActive");
    return saved === "true";
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onOpenChange: onStatsOpenChange } = useDisclosure();
  const [tempConfig, setTempConfig] = useState(config);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const audioRef = useRef(new Audio(ALARM_SOUND));
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  const { stats, addSession } = usePomodoroStats();

  const MODES = {
    focus: { label: "Enfoque", color: "primary", icon: BrainCircuit },
    short: { label: "Corto", color: "success", icon: Coffee },
    long: { label: "Largo", color: "warning", icon: Armchair },
  };

  // Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem("pomodoroMode", mode);
    localStorage.setItem("pomodoroTimeLeft", timeLeft.toString());
    localStorage.setItem("pomodoroIsActive", isActive.toString());
  }, [mode, timeLeft, isActive]);

  // Timer con requestAnimationFrame
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    const tick = () => {
      if (!startTimeRef.current) {
        const elapsed = (config[mode] * 60) - timeLeft;
        startTimeRef.current = Date.now() - (elapsed * 1000);
      }

      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const newTime = Math.max(0, (config[mode] * 60) - elapsed);

      setTimeLeft(newTime);

      if (newTime > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        handleTimerComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, mode, config, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    setTimeLeft(0); // Ensure it shows 00:00
    startTimeRef.current = null;

    if (config.sound) {
      // Intentar reproducir sonido
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio play failed:", error);
          toast.error("No se pudo reproducir el sonido (bloqueado por navegador)");
        });
      }
    }

    if (Notification.permission === "granted") {
      new Notification("⏰ ¡Tiempo terminado!", {
        body: mode === "focus" ? "¡Bien hecho! Tómate un descanso." : "Hora de volver a estudiar.",
        icon: "/pwa-192x192.png"
      });
    }

    addSession(mode, config[mode]);
    toast.success(mode === "focus" ? "🎉 ¡Sesión completada!" : "✨ Descanso terminado");
  };



  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.title = `${timeStr} - ${MODES[mode].label}`;
    return () => document.title = "Gestor Universitario";
  }, [timeLeft, mode]);

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(config[newMode] * 60);
    startTimeRef.current = null;
  };

  const toggle = () => {
    if (!isActive) {
      // HACK: "Desbloquear" el audio en interacción del usuario (móviles/chrome)
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => { });
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(config[mode] * 60);
    startTimeRef.current = null;
  };

  const handleSaveConfig = () => {
    setConfig(tempConfig);
    localStorage.setItem("pomodoroConfig", JSON.stringify(tempConfig));
    setIsActive(false);
    setTimeLeft(tempConfig[mode] * 60);
    startTimeRef.current = null;
    onOpenChange(false);
    toast.success("Configuración guardada");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = ((config[mode] * 60 - timeLeft) / (config[mode] * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-2 md:p-4 max-w-2xl mx-auto">

      {/* Selector de Modo */}
      <div className="flex gap-2 mb-3 md:mb-4 bg-content2 p-1 rounded-full shadow-inner w-full max-w-sm">
        {Object.entries(MODES).map(([key, data]) => (
          <Button
            key={key}
            size="sm"
            variant={mode === key ? "solid" : "light"}
            color={mode === key ? data.color : "default"}
            onPress={() => changeMode(key)}
            className="rounded-full font-medium flex-1"
            startContent={<data.icon size={14} />}
          >
            <span className="hidden sm:inline">{data.label}</span>
            <span className="sm:hidden">{data.label.slice(0, 3)}</span>
          </Button>
        ))}
      </div>

      {/* Timer Card */}
      <Card className="w-full shadow-xl border border-default-100 bg-gradient-to-br from-content1 to-default-50">

        <CardBody className="flex flex-col items-center justify-center py-6 md:py-8 relative overflow-hidden">

          <CircularProgress
            classNames={{
              svg: "w-48 h-48 md:w-56 md:h-56 drop-shadow-lg transform rotate-[-90deg]",
              indicator: mode === "focus" ? "stroke-primary" : mode === "short" ? "stroke-success" : "stroke-warning",
              track: "stroke-default-100/50",
            }}
            value={progress}
            strokeWidth={3}
            showValueLabel={false}
            aria-label="Progreso"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums text-foreground drop-shadow-sm">
              {formatTime(timeLeft)}
            </span>
            <p className="text-default-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mt-1 md:mt-2 opacity-80">
              {isActive ? "EN PROGRESO" : "LISTO"}
            </p>
          </div>

          {/* Botones superiores */}
          <div className="absolute top-2 md:top-3 right-2 md:right-3 flex gap-1">
            <Tooltip content="Ver Estadísticas">
              <Button isIconOnly size="sm" variant="light" onPress={onStatsOpen}>
                <BarChart3 size={18} className="text-default-400" />
              </Button>
            </Tooltip>
            <Tooltip content={notificationPermission === "granted" ? "Notificaciones ON" : "Notificaciones OFF"}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={notificationPermission === "granted" ? "text-success" : "text-default-400"}
                onPress={() => {
                  if (notificationPermission !== "granted") {
                    Notification.requestPermission().then(permission => {
                      setNotificationPermission(permission);
                      if (permission === "granted") {
                        toast.success("¡Notificaciones activadas!");
                      }
                    });
                  }
                }}
              >
                {notificationPermission === "granted" ? <Bell size={18} /> : <BellOff size={18} />}
              </Button>
            </Tooltip>
            <Tooltip content={JSON.stringify(config.sound) ? "Sonido ON" : "Sonido OFF"}>
              {/* Fixed logic in toggle tooltip or similar if needed, keeping simple here */}
              <Button isIconOnly size="sm" variant="light" onPress={() => { setTempConfig(config); onOpen(); }}>
                <Settings size={18} className="text-default-400" />
              </Button>
            </Tooltip>
          </div>

        </CardBody>
      </Card>

      {/* Controles */}
      <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-6">

        <Tooltip content="Reiniciar">
          <Button isIconOnly radius="full" variant="flat" size="sm" className="bg-default-100 text-default-500" onPress={reset}>
            <RotateCcw size={18} />
          </Button>
        </Tooltip>

        <Button
          size="lg"
          radius="full"
          color={isActive ? "default" : MODES[mode].color}
          variant={isActive ? "flat" : "solid"}
          className="w-20 h-20 md:w-24 md:h-24 shadow-2xl transition-transform active:scale-95"
          onPress={toggle}
        >
          {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
        </Button>

        <Tooltip content={config.sound ? "Sonido ON" : "Sonido OFF"}>
          <Button
            isIconOnly radius="full" variant="flat" size="sm"
            className={config.sound ? "bg-primary/10 text-primary" : "bg-default-100 text-default-400"}
            onPress={() => {
              const newConfig = { ...config, sound: !config.sound };
              setConfig(newConfig);
              localStorage.setItem("pomodoroConfig", JSON.stringify(newConfig));
            }}
          >
            {config.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
        </Tooltip>

      </div>

      {/* Tip */}
      <p className="mt-3 md:mt-4 text-center text-[10px] md:text-xs text-default-400 max-w-[220px] md:max-w-[250px] leading-relaxed">
        {mode === "focus"
          ? "💡 Evita mirar el celular hasta que suene la campana."
          : "🧘 Levántate, estira y toma agua."}
      </p>

      {/* Modal de Configuración */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Configuración</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-sm text-default-500">Tiempos en minutos:</p>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      label="Enfoque"
                      labelPlacement="outside"
                      size="sm"
                      endContent={<span className="text-default-400 text-xs">min</span>}
                      value={tempConfig.focus}
                      onChange={(e) => setTempConfig({ ...tempConfig, focus: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      label="Corto"
                      labelPlacement="outside"
                      size="sm"
                      endContent={<span className="text-default-400 text-xs">min</span>}
                      value={tempConfig.short}
                      onChange={(e) => setTempConfig({ ...tempConfig, short: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      label="Largo"
                      labelPlacement="outside"
                      size="sm"
                      endContent={<span className="text-default-400 text-xs">min</span>}
                      value={tempConfig.long}
                      onChange={(e) => setTempConfig({ ...tempConfig, long: Number(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} />
                      <span className="text-sm font-medium">Sonido</span>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={tempConfig.sound}
                      onValueChange={(val) => setTempConfig({ ...tempConfig, sound: val })}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" size="sm" onPress={onClose}>Cancelar</Button>
                <Button color="primary" size="sm" onPress={handleSaveConfig} startContent={<Save size={16} />}>
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Estadísticas */}
      <Modal isOpen={isStatsOpen} onOpenChange={onStatsOpenChange} backdrop="blur" size="md" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Trophy className="text-warning" size={20} />
                Estadísticas
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-primary/10 border-2 border-primary/20">
                      <CardBody className="text-center p-3">
                        <p className="text-3xl font-black text-primary">{stats.totalSessions}</p>
                        <p className="text-[10px] text-default-500 mt-1 font-medium">Sesiones</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-success/10 border-2 border-success/20">
                      <CardBody className="text-center p-3">
                        <p className="text-3xl font-black text-success">{stats.totalMinutes}</p>
                        <p className="text-[10px] text-default-500 mt-1 font-medium">Minutos</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-warning/10 border-2 border-warning/20">
                      <CardBody className="text-center p-3">
                        <p className="text-3xl font-black text-warning">{stats.streak}🔥</p>
                        <p className="text-[10px] text-default-500 mt-1 font-medium">Racha</p>
                      </CardBody>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-default-100 rounded-lg p-3">
                      <p className="text-xs text-default-500 mb-1">Hoy</p>
                      <p className="text-xl font-bold">{stats.todaySessions}</p>
                    </div>
                    <div className="bg-default-100 rounded-lg p-3">
                      <p className="text-xs text-default-500 mb-1">Enfoque/Break</p>
                      <p className="text-xl font-bold">{stats.focusSessions}/{stats.breakSessions}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-success/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-sm font-medium text-center">
                      {stats.totalSessions === 0 && "¡Comienza tu primera sesión!"}
                      {stats.totalSessions > 0 && stats.totalSessions < 10 && "¡Buen comienzo! 💪"}
                      {stats.totalSessions >= 10 && stats.totalSessions < 50 && "¡Vas muy bien! 🚀"}
                      {stats.totalSessions >= 50 && stats.totalSessions < 100 && "¡Imparable! 🔥"}
                      {stats.totalSessions >= 100 && "¡Leyenda! 👑"}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" size="sm" onPress={onClose}>Cerrar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default PomodoroPage;
