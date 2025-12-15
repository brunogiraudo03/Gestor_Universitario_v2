import { useMemo } from "react";
import { Button, Card, CardBody, User, Spacer, Progress, Divider, Spinner, Chip } from "@nextui-org/react";
import { LogOut, LayoutDashboard, BookOpen, GraduationCap, Trophy, Coins, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import useUserStore from "../../stores/useUserStore";

// Hooks de datos
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas";

// AHORA RECIBIMOS 'userData' COMO PROP (Aquí vienen los datos de la carrera)
const DashboardPage = ({ userData }) => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  
  // 1. Traemos TODOS los datos (Plan y Electivas)
  const { materias, loading: loadingPlan } = useMaterias();
  const { electivas, configMetas, loading: loadingElectivas } = useElectivas();

  const handleLogout = () => {
    auth.signOut();
    clearUser();
  };

  // 2. CÁLCULOS ESTADÍSTICOS UNIFICADOS 🧠
  const stats = useMemo(() => {
    // --- PLAN DE ESTUDIOS ---
    const totalMaterias = materias.length;
    const aprobadasPlan = materias.filter(m => m.estado === "Aprobada");
    const materiasFaltantes = totalMaterias - aprobadasPlan.length;
    
    // Promedio
    const conNota = aprobadasPlan.filter(m => m.nota && !isNaN(parseFloat(m.nota)));
    const sumaNotas = conNota.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
    const promedio = conNota.length > 0 ? (sumaNotas / conNota.length).toFixed(2) : "-";

    // Progreso por Año
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

    // --- ELECTIVAS Y METAS ---
    const aprobadasElectivas = electivas.filter(e => e.estado === "Aprobada");
    const totalCreditos = aprobadasElectivas.reduce((acc, curr) => acc + (curr.creditos || 0), 0);
    
    // Mapeamos las metas configuradas
    const metasSafe = Array.isArray(configMetas.metas) ? configMetas.metas : [];
    const metasStats = metasSafe.map(meta => {
        const objetivo = meta.creditos || 1;
        const porcentaje = Math.min((totalCreditos / objetivo) * 100, 100);
        return { ...meta, porcentaje };
    });

    return { 
        promedio, 
        totalMaterias, 
        aprobadasCount: aprobadasPlan.length,
        materiasFaltantes,
        totalCreditos,
        progresoPorNivel,
        metasStats
    };
  }, [materias, electivas, configMetas]);

  if (loadingPlan || loadingElectivas) {
    return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Sincronizando..." color="primary"/></div>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-divider p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg">
                <GraduationCap className="text-primary" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Gestor V2</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="flat" color="primary" startContent={<LayoutDashboard size={20}/>} className="justify-start font-medium">
            Dashboard
          </Button>
          <Button variant="light" startContent={<BookOpen size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/plan")}>
            Plan de Estudio
          </Button>
          <Button variant="light" startContent={<Coins size={20}/>} className="justify-start text-default-500 hover:text-foreground" onPress={() => navigate("/electivas")}>
            Electivas
          </Button>
        </nav>

        <div className="border-t border-divider pt-4">
            {/* AQUÍ MOSTRAMOS LA CARRERA EN EL PERFIL */}
            <User   
                name={user?.displayName?.split(" ")[0] || "Estudiante"}
                description={userData?.carrera || "Estudiante"} 
                avatarProps={{ src: user?.photoURL, size: "sm" }}
                classNames={{name: "font-bold", description: "text-default-400 text-xs"}}
            />
            <Spacer y={2} />
            <Button onPress={handleLogout} color="danger" variant="light" startContent={<LogOut size={18}/>} fullWidth className="justify-start">
                Cerrar Sesión
            </Button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold">Hola, {user?.displayName?.split(' ')[0]} 👋</h1>
            {/* AQUÍ MOSTRAMOS LA CARRERA EN EL TÍTULO */}
            <p className="text-default-500">
                Resumen de <strong>{userData?.carrera || "tu carrera"}</strong> al día de hoy.
            </p>
        </header>
        
        {/* KPI CARDS (Métricas Principales) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-900 border-none shadow-xl shadow-blue-500/20">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-white/70 font-medium">Promedio General</span>
                            <span className="text-4xl font-bold text-white">{stats.promedio}</span>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl"><Trophy className="text-white" size={24}/></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Chip size="sm" variant="flat" classNames={{base: "bg-white/20 text-white"}}>Nota Final</Chip>
                    </div>
                </CardBody>
            </Card>
            
            <Card className="border border-default-200 shadow-sm bg-content1">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-default-500 font-medium">Avance del Plan</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-foreground">{stats.aprobadasCount}</span>
                                <span className="text-default-400 text-sm">/ {stats.totalMaterias}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-default-100 rounded-xl"><TrendingUp className="text-default-600" size={24}/></div>
                    </div>
                    <p className="text-sm text-default-400 mt-4">Te faltan <strong>{stats.materiasFaltantes}</strong> materias obligatorias.</p>
                </CardBody>
            </Card>

            <Card className="border border-default-200 shadow-sm bg-content1">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-default-500 font-medium">Créditos Electivos</span>
                            <span className="text-4xl font-bold text-foreground">{stats.totalCreditos}</span>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-xl"><Coins className="text-warning" size={24}/></div>
                    </div>
                    <p className="text-sm text-default-400 mt-4">Acumulados en materias electivas.</p>
                </CardBody>
            </Card>
        </div>

        {/* SECCIÓN DE METAS Y PROGRESO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMNA 1: Metas de Títulos (Créditos) */}
            <Card className="p-2 h-full">
                <CardBody>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <GraduationCap size={20} className="text-primary"/> Metas de Electivas
                        </h3>
                        <Button size="sm" variant="light" color="primary" onPress={() => navigate("/electivas")}>Ver detalles</Button>
                    </div>

                    <div className="space-y-6">
                        {stats.metasStats.length > 0 ? (
                            stats.metasStats.map((meta, idx) => (
                                <div key={idx} className="bg-default-50 p-4 rounded-xl border border-default-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">{meta.nombre}</span>
                                        <Chip size="sm" color={meta.porcentaje === 100 ? "success" : "primary"} variant="flat">
                                            {stats.totalCreditos} / {meta.creditos} Créditos
                                        </Chip>
                                    </div>
                                    <Progress 
                                        size="md" 
                                        value={meta.porcentaje} 
                                        color={meta.porcentaje === 100 ? "success" : "primary"} 
                                        showValueLabel={true}
                                        className="max-w-full"
                                    />
                                    <p className="text-xs text-default-400 mt-2">
                                        {meta.porcentaje === 100 
                                            ? "¡Requisito de créditos completado! 🎉" 
                                            : `Faltan ${Math.max(0, meta.creditos - stats.totalCreditos)} créditos para el objetivo.`}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-default-400">
                                <p>No hay metas configuradas.</p>
                                <Button size="sm" variant="flat" className="mt-2" onPress={() => navigate("/electivas")}>Configurar ahora</Button>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* COLUMNA 2: Avance por Año (Plan Obligatorio) */}
            <Card className="p-2 h-full">
                <CardBody>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen size={20} className="text-secondary"/> Avance Académico
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
                                        color={nivel.porcentaje === 100 ? "success" : "secondary"} 
                                        className="max-w-full"
                                    />
                                </div>
                                <div className="w-12 text-right">
                                    <span className="text-small font-bold">{Math.round(nivel.porcentaje)}%</span>
                                </div>
                                <div className="w-20 text-right text-xs text-default-400 hidden sm:block">
                                    {nivel.aprobadas}/{nivel.total} Mat.
                                </div>
                            </div>
                        ))}
                        {stats.progresoPorNivel.length === 0 && (
                            <p className="text-center text-default-400 py-10">Aún no has cargado materias en el Plan.</p>
                        )}
                    </div>
                    
                    <Divider className="my-4"/>
                    
                    <div className="bg-default-50 rounded-lg p-3 flex gap-3 items-center">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">💡</div>
                        <p className="text-xs text-default-500">
                            <strong>Tip:</strong> Para obtener tu título intermedio, asegúrate de completar al 100% los años correspondientes y cumplir la meta de créditos electivos.
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