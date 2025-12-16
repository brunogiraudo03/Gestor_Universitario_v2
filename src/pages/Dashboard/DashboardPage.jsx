import { useMemo } from "react";
import { Button, Card, CardBody, User, Spacer, Progress, Divider, Spinner, Chip } from "@nextui-org/react";
import { 
  LogOut, LayoutDashboard, BookOpen, GraduationCap, Trophy, 
  TrendingUp, ChevronRight, Network, CheckSquare, School, 
  CalendarClock, CalendarRange, Sun, MapPin, AlertCircle, Timer 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import useUserStore from "../../stores/useUserStore";
import { formatDistanceToNow, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";

// Hooks
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas";
import { useTodos } from "../../hooks/useTodos";
import { useHorarios } from "../../hooks/useHorarios";

const DashboardPage = ({ userData }) => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  
  // Traemos TODOS los datos
  const { materias, loading: loadingPlan } = useMaterias();
  const { electivas, configMetas, loading: loadingElectivas } = useElectivas();
  const { todos, loading: loadingAgenda } = useTodos();
  const { horarios, loading: loadingHorarios } = useHorarios();

  const handleLogout = () => {
    auth.signOut();
    clearUser();
  };

  // --- LÓGICA ESTADÍSTICAS ---
  const stats = useMemo(() => {
    // 1. PROMEDIO Y AVANCE
    const totalMaterias = materias.length;
    const aprobadasPlan = materias.filter(m => m.estado === "Aprobada");
    const materiasFaltantes = totalMaterias - aprobadasPlan.length;
    
    const conNota = aprobadasPlan.filter(m => m.nota && !isNaN(parseFloat(m.nota)));
    const sumaNotas = conNota.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
    const promedio = conNota.length > 0 ? (sumaNotas / conNota.length).toFixed(2) : "-";

    // 2. PROGRESO POR AÑO
    const niveles = [...new Set(materias.map(m => m.nivel))].sort((a,b) => a - b).filter(n => !isNaN(n));
    const progresoPorNivel = niveles.map(nivel => {
        const matsNivel = materias.filter(m => m.nivel === nivel);
        const aproNivel = matsNivel.filter(m => m.estado === "Aprobada").length;
        return { 
            nivel, 
            total: matsNivel.length, 
            aprobadas: aproNivel, 
            porcentaje: matsNivel.length > 0 ? (aproNivel / matsNivel.length) * 100 : 0 
        };
    });

    // 3. METAS (Electivas)
    const aprobadasElectivas = electivas.filter(e => e.estado === "Aprobada");
    const metasSafe = Array.isArray(configMetas.metas) ? configMetas.metas : [];
    
    const metasStats = metasSafe.map(meta => {
        const objetivo = meta.creditos || 1;
        const creditosAcumuladosMeta = aprobadasElectivas.reduce((acc, curr) => {
            const aplicaAMeta = curr.metasIds ? curr.metasIds.includes(String(meta.id)) : true; 
            return aplicaAMeta ? acc + (curr.creditos || 0) : acc;
        }, 0);
        const porcentaje = Math.min((creditosAcumuladosMeta / objetivo) * 100, 100);
        return { ...meta, creditosAcumulados: creditosAcumuladosMeta, porcentaje };
    });

    // 4. PRÓXIMO EVENTO (Agenda)
    const pendientes = todos.filter(t => !t.completado).sort((a,b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
    const proximoEvento = pendientes.length > 0 ? pendientes[0] : null;

    // 5. PRÓXIMA CLASE (Horarios)
    // Lógica simple: Si no hay horarios -> Vacaciones. Si hay, buscamos hoy.
    const modoVacaciones = horarios.length === 0;
    const hoyDiaNombre = new Date().toLocaleDateString('es-ES', { weekday: 'long' }); // "lunes", "martes"...
    
    // Normalizamos para comparar (quitar tildes y minusculas)
    const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const clasesHoy = horarios
        .filter(h => normalizar(h.dia) === normalizar(hoyDiaNombre))
        .sort((a,b) => a.inicio.localeCompare(b.inicio));

    return { 
        promedio, totalMaterias, aprobadasCount: aprobadasPlan.length,
        materiasFaltantes, progresoPorNivel, metasStats,
        proximoEvento,
        modoVacaciones,
        clasesHoy
    };
  }, [materias, electivas, configMetas, todos, horarios]);

  if (loadingPlan || loadingElectivas || loadingAgenda || loadingHorarios) {
    return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Sincronizando..." color="primary"/></div>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-divider p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-gradient-to-tr from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <School className="text-white" size={26} />
            </div>
            <span className="text-lg font-bold tracking-tight leading-tight">Gestor<br/>Universitario</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="flat" color="primary" startContent={<LayoutDashboard size={20}/>} className="justify-start font-medium">Dashboard</Button>
          <Button variant="light" startContent={<BookOpen size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/plan")}>Plan de Estudio</Button>
          <Button variant="light" startContent={<Trophy size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/electivas")}>Electivas</Button>
          <Button variant="light" startContent={<Network size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/correlativas")}>Correlativas</Button>
          <Button variant="light" startContent={<CalendarClock size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/agenda")}>Agenda</Button>
          <Button variant="light" startContent={<CalendarRange size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/horarios")}>Horarios</Button>
          <Button variant="light" startContent={<Timer size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/pomodoro")}>Pomodoro</Button>
        </nav>

        <div className="border-t border-divider pt-4">
            <User   
                name={user?.displayName?.split(" ")[0] || "Estudiante"}
                description={userData?.carrera || "Estudiante"} 
                avatarProps={{ src: user?.photoURL, size: "sm" }}
                classNames={{name: "font-bold", description: "text-default-400 text-xs"}}
            />
            <Spacer y={2} />
            <Button onPress={handleLogout} color="danger" variant="light" startContent={<LogOut size={18}/>} fullWidth className="justify-start">Cerrar Sesión</Button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Hola, {user?.displayName?.split(' ')[0]} 👋</h1>
            <p className="text-default-500">
                Tienes <strong>{stats.proximoEvento ? "pendientes en la agenda" : "todo al día"}</strong>. ¡A darle duro!
            </p>
        </header>
        
        {/* --- KPI CARDS (TOP ROW) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            
            {/* 1. PROMEDIO */}
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-none shadow-xl shadow-orange-500/20 text-white">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/80 font-medium text-sm">Promedio General</span>
                            <span className="text-4xl font-bold">{stats.promedio}</span>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg"><Trophy className="text-white" size={24}/></div>
                    </div>
                    <div className="mt-4"><Chip size="sm" variant="flat" classNames={{base: "bg-black/20 text-white"}}>Nota Final</Chip></div>
                </CardBody>
            </Card>
            
            {/* 2. AVANCE */}
            <Card className="bg-content1 border border-default-200 shadow-sm">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-default-500 font-medium text-sm">Avance Obligatorio</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-foreground">{stats.aprobadasCount}</span>
                                <span className="text-default-400 text-sm">/ {stats.totalMaterias}</span>
                            </div>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="text-primary" size={24}/></div>
                    </div>
                    <p className="text-xs text-default-400 mt-4">Faltan <strong>{stats.materiasFaltantes}</strong> materias.</p>
                </CardBody>
            </Card>

            {/* 3. AGENDA (PRÓXIMO EVENTO) - REEMPLAZA A CRÉDITOS */}
            <Card className="bg-content1 border border-default-200 shadow-sm" onPress={() => navigate("/agenda")} isPressable>
                <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-default-500 font-medium text-sm">Próximo Vencimiento</span>
                        <div className="p-2 bg-danger/10 rounded-lg"><CalendarClock className="text-danger" size={24}/></div>
                    </div>

                    {stats.proximoEvento ? (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold truncate">{stats.proximoEvento.texto}</h4>
                            </div>
                            <Chip size="sm" color="danger" variant="flat" className="mb-2 uppercase font-bold text-[10px]">
                                {stats.proximoEvento.tipo || "Tarea"}
                            </Chip>
                            <p className="text-xs text-default-500">
                                {formatDistanceToNow(parseISO(stats.proximoEvento.fechaEntrega), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center h-full">
                            <h4 className="text-lg font-bold text-success">¡Todo al día! 🎉</h4>
                            <p className="text-xs text-default-400">No hay tareas urgentes.</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>

        {/* --- MIDDLE ROW (CORRELATIVAS + HORARIO) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* IZQUIERDA: CORRELATIVAS (Ancho 2/3) */}
            <div className="lg:col-span-2">
                <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 text-white h-full shadow-lg">
                    <CardBody className="flex flex-row items-center justify-between p-8">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
                                <Network className="text-blue-400"/> ¿Qué curso ahora?
                            </h3>
                            <p className="text-gray-300 text-sm max-w-md">
                                El sistema de correlatividades analiza tu situación académica y te dice qué materias están habilitadas.
                            </p>
                        </div>
                        <Button 
                            onPress={() => navigate("/correlativas")} 
                            className="bg-white text-black font-bold shadow-lg"
                            size="lg"
                            endContent={<ChevronRight/>}
                        >
                            Ver Mapa
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* DERECHA: PRÓXIMA CLASE (Ancho 1/3) */}
            <div className="lg:col-span-1">
                <Card className="h-full border border-default-200 bg-content1">
                    <CardBody className="p-5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        {/* DECORACIÓN DE FONDO */}
                        <div className={`absolute top-0 w-full h-1 ${stats.modoVacaciones ? "bg-warning" : "bg-primary"}`}></div>

                        {stats.modoVacaciones ? (
                            <>
                                <div className="bg-warning/20 p-4 rounded-full mb-3">
                                    <Sun size={32} className="text-warning-600 animate-pulse"/>
                                </div>
                                <h4 className="text-xl font-bold">Modo Vacaciones</h4>
                                <p className="text-sm text-default-400 mt-1">
                                    No hay horarios cargados. ¡A disfrutar! 🏖️
                                </p>
                                <Button size="sm" variant="light" className="mt-2" onPress={() => navigate("/horarios")}>
                                    Configurar
                                </Button>
                            </>
                        ) : (
                            <>
                                {stats.clasesHoy.length > 0 ? (
                                    <div className="w-full">
                                        <div className="flex items-center gap-2 justify-center mb-3 text-primary">
                                            <School size={20}/>
                                            <span className="font-bold uppercase text-xs">Cursas Hoy</span>
                                        </div>
                                        {/* Solo mostramos la primera del día o un resumen */}
                                        <h3 className="text-lg font-bold truncate mb-1">{stats.clasesHoy[0].materia}</h3>
                                        <Chip size="sm" variant="flat" color="primary" className="mb-2">
                                            {stats.clasesHoy[0].inicio} - {stats.clasesHoy[0].fin}
                                        </Chip>
                                        {stats.clasesHoy[0].aula && (
                                            <div className="flex items-center justify-center gap-1 text-xs text-default-400">
                                                <MapPin size={12}/> Aula {stats.clasesHoy[0].aula}
                                            </div>
                                        )}
                                        {stats.clasesHoy.length > 1 && (
                                            <p className="text-xs text-default-400 mt-3 border-t border-divider pt-2">
                                                + {stats.clasesHoy.length - 1} materias más hoy
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-default-100 p-4 rounded-full mb-3">
                                            <CalendarRange size={32} className="text-default-500"/>
                                        </div>
                                        <h4 className="text-lg font-bold">Día Libre</h4>
                                        <p className="text-sm text-default-400">Hoy no tienes cursada.</p>
                                        <Button size="sm" variant="light" className="mt-2" onPress={() => navigate("/horarios")}>Ver semana</Button>
                                    </>
                                )}
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>

        {/* --- BOTTOM ROW (METAS + PROGRESO) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. METAS DE TÍTULOS (Detalle de créditos) */}
            <Card className="p-2 h-full border border-default-200">
                <CardBody>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <GraduationCap size={20} className="text-secondary"/> Metas de Títulos
                        </h3>
                        <Button size="sm" variant="light" onPress={() => navigate("/electivas")}>Detalles</Button>
                    </div>

                    <div className="space-y-6">
                        {stats.metasStats.length > 0 ? (
                            stats.metasStats.map((meta, idx) => (
                                <div key={idx} className="bg-default-50 p-4 rounded-xl border border-default-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">{meta.nombre}</span>
                                        <Chip size="sm" color={meta.porcentaje === 100 ? "success" : "secondary"} variant="flat">
                                            {meta.creditosAcumulados} / {meta.creditos} Créditos
                                        </Chip>
                                    </div>
                                    <Progress 
                                        size="md" 
                                        value={meta.porcentaje} 
                                        color={meta.porcentaje === 100 ? "success" : "secondary"} 
                                        showValueLabel={true}
                                        className="max-w-full"
                                    />
                                    <p className="text-xs text-default-400 mt-2">
                                        {meta.porcentaje === 100 
                                            ? "¡Requisito completado! 🎓" 
                                            : `Faltan ${Math.max(0, meta.creditos - meta.creditosAcumulados)} créditos.`}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-default-400">
                                <AlertCircle className="mx-auto mb-2" />
                                <p>No hay metas configuradas.</p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* 2. AVANCE POR AÑO */}
            <Card className="p-2 h-full border border-default-200">
                <CardBody>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen size={20} className="text-primary"/> Avance por Año
                        </h3>
                        <Button size="sm" variant="light" onPress={() => navigate("/plan")}>Ir al Plan</Button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.progresoPorNivel.map((nivel) => (
                            <div key={nivel.nivel} className="flex items-center gap-4">
                                <div className="w-16 flex-shrink-0">
                                    <span className="text-small font-bold text-default-500">AÑO {nivel.nivel}</span>
                                </div>
                                <div className="flex-1">
                                    <Progress 
                                        size="sm" 
                                        value={nivel.porcentaje} 
                                        color={nivel.porcentaje === 100 ? "success" : "primary"} 
                                        className="max-w-full"
                                    />
                                </div>
                                <div className="w-12 text-right">
                                    <span className="text-small font-bold">{Math.round(nivel.porcentaje)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Divider className="my-4"/>
                    
                    <div className="bg-primary/5 rounded-lg p-3 flex gap-3 items-center">
                        <div className="bg-primary/20 p-1.5 rounded-full text-primary"><School size={16}/></div>
                        <p className="text-xs text-default-500">
                            Completa los años secuencialmente para desbloquear correlativas más rápido.
                        </p>
                    </div>
                </CardBody>
            </Card>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;