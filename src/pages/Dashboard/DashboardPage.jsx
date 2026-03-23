import { useState, useEffect, useMemo, useRef } from "react";
import { Button, Card, CardBody, Progress, Chip, Skeleton } from "@nextui-org/react";
import {
    Trophy, TrendingUp, ChevronRight, ChevronLeft, Network, School,
    CalendarClock, Sun, MapPin, AlertCircle, BookOpen, GraduationCap,
    LayoutGrid, Clock, CheckCircle2, Calendar, Sparkles, X, BookMarked, FileText, ExternalLink, CalendarRange
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

// Hooks
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas";
import { useTodos } from "../../hooks/useTodos";
import { useHorarios } from "../../hooks/useHorarios";

import { useTableros } from "../../hooks/useTableros";

// Tutorial
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { tutorialSteps } from "../../config/tutorialSteps";

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, userData } = useUserStore();
    const driverRef = useRef(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    // Datos
    const { materias, loading: loadingPlan } = useMaterias();
    const { electivas, configMetas, loading: loadingElectivas } = useElectivas();
    const { todos, loading: loadingAgenda } = useTodos();
    const { horarios, loading: loadingHorarios } = useHorarios();
    const { tableros, loading: loadingTableros } = useTableros();

    const isLoading = loadingPlan || loadingElectivas || loadingAgenda || loadingHorarios || loadingTableros;

    // Tutorial
    useEffect(() => {
        if (!isLoading) {
            const forceShow = localStorage.getItem("showTutorial") === "true";
            const alreadySeen = localStorage.getItem("hasSeenTutorial");

            if (forceShow || !alreadySeen) {
                if (forceShow) localStorage.removeItem("showTutorial");

                const timer = setTimeout(() => {
                    if (!document.getElementById("sidebar-menu")) return;

                    driverRef.current = driver({
                        showProgress: true,
                        animate: true,
                        allowClose: true,
                        popoverClass: 'driverjs-theme',
                        nextBtnText: 'Siguiente',
                        prevBtnText: 'Atrás',
                        doneBtnText: '¡Entendido!',
                        steps: tutorialSteps,
                        onDestroyStarted: () => {
                            if (driverRef.current) {
                                driverRef.current.destroy();
                                driverRef.current = null;
                            }
                            localStorage.setItem("hasSeenTutorial", "true");
                        },
                    });

                    driverRef.current.drive();
                }, 1500);

                return () => {
                    clearTimeout(timer);
                    if (driverRef.current) driverRef.current.destroy();
                };
            }
        }
    }, [isLoading]);

    // Estadísticas CORREGIDAS
    const stats = useMemo(() => {
        // 1. MATERIAS Y PROMEDIO
        const totalMaterias = materias.length;
        const aprobadasPlan = materias.filter(m => m.estado === "Aprobada");
        const materiasFaltantes = totalMaterias - aprobadasPlan.length;
        const conNota = aprobadasPlan.filter(m => m.nota && !isNaN(parseFloat(m.nota)));
        const promedio = conNota.length > 0
            ? (conNota.reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / conNota.length).toFixed(2)
            : "-";

        // 2. PROGRESO POR AÑO
        const niveles = [...new Set(materias.map(m => m.nivel))].sort((a, b) => a - b).filter(n => !isNaN(n));
        const progresoPorNivel = niveles.map(nivel => {
            const matsNivel = materias.filter(m => m.nivel === nivel);
            const aproNivel = matsNivel.filter(m => m.estado === "Aprobada").length;
            return {
                nivel: `Año ${nivel}`,
                aprobadas: aproNivel,
                pendientes: matsNivel.length - aproNivel, // New: for stacked bar
                total: matsNivel.length,
                porcentaje: matsNivel.length > 0 ? Math.round((aproNivel / matsNivel.length) * 100) : 0
            };
        });

        // 3. ELECTIVAS Y METAS
        const aprobadasElectivas = electivas.filter(e => e.estado === "Aprobada");
        const metasSafe = Array.isArray(configMetas.metas) ? configMetas.metas : [];
        const metasStats = metasSafe.map(meta => {
            const objetivo = meta.creditos || 1;
            const creditosAcumuladosMeta = aprobadasElectivas.reduce((acc, curr) => {
                const aplicaAMeta = curr.metasIds ? curr.metasIds.includes(String(meta.id)) : true;
                return aplicaAMeta ? acc + (curr.creditos || 0) : acc;
            }, 0);
            const porcentaje = Math.min(Math.round((creditosAcumuladosMeta / objetivo) * 100), 100);
            return { ...meta, creditosAcumulados: creditosAcumuladosMeta, porcentaje };
        });

        // 4. AGENDA Y TAREAS - CORREGIDO
        const pendientes = todos.filter(t => !t.completado);
        const todayStr = now.toISOString().split('T')[0];
        const proximos = pendientes.filter(t => t.fechaEntrega >= todayStr).sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
        const proximoEvento = proximos.length > 0 ? proximos[0] : null;

        // 5. HORARIOS Y CLASES
        const modoVacaciones = horarios.length === 0;
        const hoyDiaNombre = now.toLocaleDateString('es-ES', { weekday: 'long' });
        const horaActual = now.getHours();
        const minutosActuales = now.getMinutes();

        const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const clasesHoy = horarios
            .filter(h => {
                const esHoy = normalizar(h.dia) === normalizar(hoyDiaNombre);
                if (!esHoy) return false;

                const horaFin = parseInt(h.fin.split(":")[0]);
                const minFin = parseInt(h.fin.split(":")[1] || "0");

                if (horaFin > horaActual) return true;
                if (horaFin === horaActual && minFin > minutosActuales) return true;

                return false;
            })
            .sort((a, b) => a.inicio.localeCompare(b.inicio));

        // 6. PROGRESO GENERAL
        const progresoGeneral = totalMaterias > 0
            ? Math.round((aprobadasPlan.length / totalMaterias) * 100)
            : 0;

        // Calcular desaprobadas
        const desaprobadasCount = materias.filter(m => m.estado === "Desaprobada").length;
        const pendientesCount = materias.filter(m => !m.estado || m.estado === "Pendiente").length;

        return {
            promedio,
            totalMaterias,
            aprobadasCount: aprobadasPlan.length,
            desaprobadasCount,
            pendientesCount,
            materiasFaltantes,
            progresoPorNivel,
            metasStats,
            proximoEvento,
            modoVacaciones,
            clasesHoy,
            todosPendientes: pendientes.length,
            tablerosActivos: tableros.length,
            progresoGeneral
        };
    }, [materias, electivas, configMetas, todos, horarios, now, tableros]);

    // Materias y Electivas en estado Cursando para la sección dedicada
    const materiasCursando = useMemo(() => {
        const mat = materias.filter(m => m.estado === "Cursando").map(m => ({ ...m, isElectiva: false }));
        const ele = electivas.filter(e => e.estado === "Cursando").map(e => ({ ...e, isElectiva: true }));
        return [...mat, ...ele];
    }, [materias, electivas]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <Skeleton className="h-12 w-80 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Hola, {user?.displayName?.split(' ')[0] || 'Estudiante'} 👋
                        </h1>
                        <p className="text-default-500 mt-1 flex items-center gap-2 text-sm">
                            <Calendar size={16} />
                            {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Chip color="success" variant="flat" size="sm" startContent={<CheckCircle2 size={14} />}>
                            {stats.aprobadasCount} Aprobadas
                        </Chip>
                        {stats.desaprobadasCount > 0 && (
                            <Chip color="danger" variant="flat" size="sm" startContent={<X size={14} />}>
                                {stats.desaprobadasCount} Desaprobadas
                            </Chip>
                        )}
                        <Chip color="warning" variant="flat" size="sm" startContent={<Clock size={14} />}>
                            {stats.todosPendientes} Tareas Pendientes
                        </Chip>
                    </div>
                </div>
            </motion.header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Promedio */}
                <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg cursor-pointer" isPressable onPress={() => navigate("/plan")}>
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4 min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-white/80 text-sm font-bold uppercase mb-3 tracking-wide">Promedio</p>
                                <p className="text-6xl font-black leading-none">{stats.promedio}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Trophy size={32} />
                            </div>
                        </div>
                        <Chip size="sm" className="bg-black/20 text-white font-medium self-start">
                            {stats.aprobadasCount} materias
                        </Chip>
                    </CardBody>
                </Card>

                {/* Progreso */}
                <Card className="border-2 border-success/30 bg-gradient-to-br from-success/10 to-transparent cursor-pointer" isPressable onPress={() => navigate("/plan")}>
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4 min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-success-600 text-sm font-bold uppercase mb-3 tracking-wide">Progreso</p>
                                <p className="text-6xl font-black text-success leading-none">{stats.progresoGeneral}%</p>
                            </div>
                            <div className="p-3 bg-success/20 rounded-xl">
                                <TrendingUp className="text-success" size={32} />
                            </div>
                        </div>
                        <div>
                            <Progress value={stats.progresoGeneral} color="success" size="md" className="mb-2" />
                            <p className="text-sm text-default-500 font-medium">{stats.materiasFaltantes} restantes</p>
                        </div>
                    </CardBody>
                </Card>

                {/* Horarios del Día */}
                <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent cursor-pointer" isPressable onPress={() => navigate("/horarios")}>
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4 min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-orange-600 text-sm font-bold uppercase mb-2 tracking-wide">
                                    Hoy — {new Date().toLocaleDateString('es-AR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase())}
                                </p>
                                {stats.clasesHoy && stats.clasesHoy.length > 0 ? (
                                    <div className="flex flex-col gap-1.5">
                                        {stats.clasesHoy.slice(0, 3).map((c, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || '#f97316' }} />
                                                <span className="text-xs font-semibold truncate flex-1">{c.materia}</span>
                                                <span className="text-xs text-default-500 flex-shrink-0">{c.inicio}–{c.fin}</span>
                                            </div>
                                        ))}
                                        {stats.clasesHoy.length > 3 && (
                                            <p className="text-xs text-default-400">+{stats.clasesHoy.length - 3} más</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-2xl font-black text-orange-500">¡Día libre! 🎉</p>
                                        <p className="text-xs text-default-400 mt-1">Sin clases hoy</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-orange-500/20 rounded-xl flex-shrink-0">
                                <CalendarRange className="text-orange-500" size={28} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Próximo Vencimiento */}
                <Card className="border-2 border-default-200 cursor-pointer bg-content1" isPressable onPress={() => navigate("/agenda")}>
                    <CardBody className="p-6 md:p-8 flex flex-col gap-4 min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <p className="text-default-600 text-sm font-bold uppercase tracking-wide">Próximo</p>
                            <div className="p-2.5 bg-danger/10 rounded-xl">
                                <CalendarClock className="text-danger" size={28} />
                            </div>
                        </div>
                        {stats.proximoEvento ? (
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="text-xl font-bold truncate mb-2 leading-tight">{stats.proximoEvento.texto}</h4>
                                <Chip size="sm" color="danger" variant="flat" className="font-bold border border-danger/20 self-start">
                                    {formatDistanceToNow(parseISO(stats.proximoEvento.fechaEntrega), { addSuffix: true, locale: es })}
                                </Chip>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="text-xl font-bold text-success mb-2">¡Todo al día! 🎉</h4>
                                <p className="text-sm text-default-500">Sin tareas urgentes</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* ── Cursando este Cuatrimestre ── */}
            <motion.section
                key="cursando"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        Cursando este Cuatrimestre
                    </h2>
                    <div className="flex items-center gap-3">
                        {materiasCursando.length > 0 && (
                            <Chip color="primary" variant="flat" size="sm" className="font-semibold hidden xs:flex">
                                {materiasCursando.length} {materiasCursando.length === 1 ? 'materia' : 'materias'}
                            </Chip>
                        )}
                        {materiasCursando.length > 0 && (
                            <div className="hidden sm:flex gap-1.5">
                                <Button isIconOnly size="sm" variant="flat" color="default" className="text-default-500 hover:text-foreground" onPress={() => {
                                    document.getElementById('cursando-scroll-container')?.scrollBy({ left: -320, behavior: 'smooth' });
                                }}>
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button isIconOnly size="sm" variant="flat" color="default" className="text-default-500 hover:text-foreground" onPress={() => {
                                    document.getElementById('cursando-scroll-container')?.scrollBy({ left: 320, behavior: 'smooth' });
                                }}>
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {materiasCursando.length === 0 ? (
                    /* Vacation state */
                    <Card className="border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <CardBody className="p-8 flex flex-col sm:flex-row items-center gap-6">
                            <div className="text-6xl flex-shrink-0">🏖️</div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-black mb-1">¡Estás de vacaciones!</h3>
                                <p className="text-default-500 text-sm mb-4 max-w-md">
                                    Todavía no tenés materias marcadas como "Cursando" este cuatrimestre.
                                    Cuando empiece el ciclo, marcalas desde el Plan de Estudio y aparecerán acá.
                                </p>
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    onPress={() => navigate("/plan")}
                                >
                                    Ir al Plan de Estudio
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <div id="cursando-scroll-container" className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory pt-2 scrollbar-hide">
                        {materiasCursando.map((materia) => {
                            const info = materia.cursandoInfo || {};
                            const parciales = info.parciales || [];
                            const aprobados = parciales.filter(p => p.aprobado === true).length;
                            const total = Math.max(parseInt(info.condicionesAprobacion?.numParciales) || 0, parciales.length);
                            const pct = total > 0 ? Math.round((aprobados / total) * 100) : 0;
                            const color = materia.color || '#3b82f6';

                            return (
                                <Card
                                    key={materia.id}
                                    isPressable
                                    onPress={() => navigate(`/cursando/${materia.id}`)}
                                    className="border border-default-100 hover:border-primary/40 transition-all cursor-pointer group flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] snap-center overflow-hidden"
                                    style={{ borderLeft: `4px solid ${color}` }}
                                >
                                    <CardBody className="p-4 flex flex-col h-full">
                                        {/* Nombre + año */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                        {materia.nombre}
                                                    </p>
                                                    {materia.nivel && (
                                                        <Chip size="sm" variant="flat" color="default" className="mt-2 text-xs h-6">
                                                            Año {materia.nivel}
                                                        </Chip>
                                                    )}
                                                </div>
                                                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
                                            </div>
                                        </div>

                                        <div className="mt-auto flex flex-col gap-4">
                                            {/* Progreso parciales */}
                                            {total > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-xs text-default-500 flex items-center gap-1">
                                                            <FileText size={11} /> {aprobados}/{total} eval.
                                                        </span>
                                                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-default-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-default-400 italic">Sin evaluaciones cargadas</p>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-1 border-t border-default-100">
                                                {info.notebookLMUrl ? (
                                                    <button
                                                        className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                                                        style={{ color }}
                                                        onClick={(e) => { e.stopPropagation(); window.open(info.notebookLMUrl, '_blank'); }}
                                                    >
                                                        <BookMarked size={13} /> NotebookLM
                                                        <ExternalLink size={10} />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-default-400">
                                                        {info.condicionesAprobacion ? '✓ Con condiciones' : 'Sin condiciones'}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 text-xs text-default-400 group-hover:text-primary transition-colors font-semibold">
                                                    Ver detalle
                                                    <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </motion.section>


            <div className="w-full mb-4 md:mb-6">
                <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg w-full">
                    <CardBody className="p-6 md:p-8 flex flex-col justify-center w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-2">
                                    <Network className="text-blue-400" size={28} />
                                    ¿Qué curso ahora?
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Descubre qué materias puedes cursar según tus correlativas
                                </p>
                            </div>
                            <Button
                                onPress={() => navigate("/correlativas")}
                                className="bg-white text-black font-bold w-full sm:w-auto"
                                size="lg"
                                endContent={<ChevronRight />}
                            >
                                Ver Mapa
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
                {/* Progreso por Año */}
                <Card className="border-2 border-default-200 h-full">
                    <CardBody className="p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                                <BookOpen size={20} className="text-success" />
                                Progreso por Año
                            </h3>
                        </div>
                        <div className="flex-1 min-h-[220px] flex items-center">
                            {stats.progresoPorNivel.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.progresoPorNivel} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="nivel"
                                            tick={{ fontSize: 11, fill: "#71717a" }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            hide
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-content1 dark:bg-content1 p-3 rounded-xl shadow-xl border border-default-200 min-w-[150px]">
                                                            <p className="font-bold text-small mb-2 text-default-500 uppercase tracking-wider">{label}</p>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-success" />
                                                                        <span className="text-sm font-medium">Aprobadas</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold">{data.aprobadas}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-default-200" />
                                                                        <span className="text-sm font-medium">Restantes</span>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-default-400">{data.pendientes}</span>
                                                                </div>
                                                                <div className="pt-2 mt-2 border-t border-default-100 flex justify-between items-center">
                                                                    <span className="text-xs font-semibold text-default-500">TOTAL</span>
                                                                    <span className="text-sm font-black">{data.total}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {/* Stacked Bars: Aprobadas (Bottom) + Pendientes (Top) = Total Height */}
                                        <Bar dataKey="aprobadas" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="pendientes" stackId="a" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full flex items-center justify-center text-default-400">
                                    <p className="text-sm">Sin datos</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Estado de Materias */}
                <Card className="border-2 border-default-200 h-full">
                    <CardBody className="p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                                <GraduationCap size={20} className="text-warning" />
                                Estado Materias
                            </h3>
                        </div>
                        <div className="flex-1 min-h-[220px] flex items-center">
                            {stats.totalMaterias > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Aprobadas', value: stats.aprobadasCount, color: '#22c55e' },
                                                { name: 'Desaprobadas', value: stats.desaprobadasCount, color: '#ef4444' },
                                                { name: 'Pendientes', value: stats.pendientesCount, color: '#d4d4d8' }
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            outerRadius={90}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Aprobadas', value: stats.aprobadasCount, color: '#22c55e' },
                                                { name: 'Desaprobadas', value: stats.desaprobadasCount, color: '#ef4444' },
                                                { name: 'Pendientes', value: stats.pendientesCount, color: '#d4d4d8' }
                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-content1 dark:bg-content1 p-3 rounded-xl shadow-xl border border-default-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                                                <span className="font-bold text-small text-foreground">{data.name}</span>
                                                            </div>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-2xl font-black text-foreground">{data.value}</span>
                                                                <span className="text-xs text-default-500 mb-1">materias</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full flex items-center justify-center text-default-400">
                                    <p className="text-sm">Sin materias</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Metas + Tableros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Metas */}
                <Card className="border-2 border-default-200">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                                <GraduationCap size={20} className="text-secondary" />
                                Metas Electivas
                            </h3>
                            <Button size="sm" variant="light" onPress={() => navigate("/electivas")}>
                                Ver
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {stats.metasStats.length > 0 ? (
                                stats.metasStats.map((meta, idx) => (
                                    <div key={idx} className="bg-default-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-sm">{meta.nombre}</span>
                                            <Chip size="sm" color={meta.porcentaje === 100 ? "success" : "secondary"} variant="flat">
                                                {meta.creditosAcumulados}/{meta.creditos}
                                            </Chip>
                                        </div>
                                        <Progress value={meta.porcentaje} color={meta.porcentaje === 100 ? "success" : "secondary"} size="sm" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-default-400">
                                    <AlertCircle className="mx-auto mb-2" size={36} />
                                    <p className="text-sm">Sin metas configuradas</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Tableros */}
                <Card className="border-2 border-default-200">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                                <LayoutGrid size={20} className="text-purple-500" />
                                Mis Tableros
                            </h3>
                            <Button size="sm" variant="light" onPress={() => navigate("/tableros")}>
                                Ver
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {tableros.length > 0 ? (
                                tableros.slice(0, 4).map((tablero) => (
                                    <div
                                        key={tablero.id}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-default-50 hover:bg-default-100 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/tableros/${tablero.id}`)}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm flex-shrink-0"
                                            style={{
                                                background: tablero.fondo?.tipo === 'gradient'
                                                    ? tablero.fondo.value
                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        >
                                            {tablero.icono || '📋'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{tablero.nombre}</p>
                                            <p className="text-xs text-default-500 truncate">{tablero.descripcion || 'Sin descripción'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-default-400" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-default-400">
                                    <LayoutGrid className="mx-auto mb-2" size={36} />
                                    <p className="text-sm mb-3">Sin tableros</p>
                                    <Button size="sm" color="primary" variant="flat" onPress={() => navigate("/tableros")}>
                                        Crear Tablero
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Footer Motivacional */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                <CardBody className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="text-warning" size={24} fill="currentColor" />
                        <p className="text-lg md:text-xl font-bold">
                            {stats.progresoGeneral >= 75 ? "¡Excelente! Estás muy cerca 🎉"
                                : stats.progresoGeneral >= 50 ? "¡Vas muy bien! Sigue así 💪"
                                    : "¡Cada paso cuenta! 🚀"}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-default-600">
                        <span>{stats.aprobadasCount}/{stats.totalMaterias} materias</span>
                        <span>•</span>
                        <span>{stats.tablerosActivos} proyectos activos</span>
                    </div>
                </CardBody>
            </Card>
        </div >
    );
};

export default DashboardPage;