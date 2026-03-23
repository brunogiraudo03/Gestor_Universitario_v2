import { useState } from "react";
import {
    Button, Card, CardBody, Chip, Skeleton, Input,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Tooltip, Select, SelectItem,
    Popover, PopoverTrigger, PopoverContent, ScrollShadow
} from "@nextui-org/react";
import {
    ArrowLeft, ExternalLink, BookOpen, Notebook,
    CheckCircle2, XCircle, Clock, Pencil, Save, BookMarked,
    RefreshCw, AlertTriangle, Trash2, Check
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCursando } from "../../hooks/useCursando";
import { toast } from "sonner";

import ParcialesSection from "./components/ParcialesSection";
import CondicionesSection from "./components/CondicionesSection";
import NotasLinksSection from "./components/NotasLinksSection";
import ProfesoresSection from "./components/ProfesoresSection";
import HorariosSection from "./components/HorariosSection";

const COLORES = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#71717a", "#78716c", "#0f172a"
];

const ESTADOS = [
    { value: "Aprobada", label: "Aprobada ✓", color: "success" },
    { value: "Regular", label: "Regular", color: "warning" },
    { value: "Desaprobada", label: "Desaprobada ✗", color: "danger" },
    { value: "Pendiente", label: "Pendiente", color: "default" },
];

const ESTADO_CONFIG = {
    "Cursando": { color: "primary", icon: <Clock size={14} /> },
    "Aprobada": { color: "success", icon: <CheckCircle2 size={14} /> },
    "Regular": { color: "warning", icon: <CheckCircle2 size={14} /> },
    "Desaprobada": { color: "danger", icon: <XCircle size={14} /> },
    "Pendiente": { color: "default", icon: null },
};

const SectionCard = ({ children, className = "" }) => (
    <Card className={`border border-default-100 shadow-sm h-full ${className}`}>
        <CardBody className="p-5 flex flex-col gap-0">
            {children}
        </CardBody>
    </Card>
);

const CursandoPage = () => {
    const { materiaId } = useParams();
    const navigate = useNavigate();
    const {
        materia, cursandoInfo, loading,
        agregarParcial, editarParcial, borrarParcial,
        guardarCondiciones,
        agregarNota, borrarNota,
        agregarProfesor, borrarProfesor,
        guardarNotebookLM,
        agregarHorario, borrarHorario,
        cambiarEstado, cambiarColor,
    } = useCursando(materiaId);

    // Modal NotebookLM
    const { isOpen: isNbOpen, onOpen: onNbOpen, onOpenChange: onNbOpenChange, onClose: onNbClose } = useDisclosure();
    const [nbUrl, setNbUrl] = useState('');
    const [nbSaving, setNbSaving] = useState(false);

    // Modal Cambiar Estado
    const { isOpen: isEstOpen, onOpen: onEstOpen, onOpenChange: onEstOpenChange, onClose: onEstClose } = useDisclosure();
    const [nuevoEstado, setNuevoEstado] = useState("Aprobada");
    const [borrarDatos, setBorrarDatos] = useState(false);
    const [estSaving, setEstSaving] = useState(false);

    const handleSaveNb = async () => {
        setNbSaving(true);
        try { await guardarNotebookLM(nbUrl.trim()); onNbClose(); }
        finally { setNbSaving(false); }
    };

    const handleAbrirCambioEstado = () => {
        setNuevoEstado("Aprobada");
        setBorrarDatos(false);
        onEstOpen();
    };

    const handleCambiarEstado = async () => {
        if (!materia) return;
        setEstSaving(true);
        try {
            await cambiarEstado(nuevoEstado, borrarDatos);
            toast.success(`Estado cambiado a ${nuevoEstado} ✓`);
            onEstClose();
            navigate("/cursando");
        } catch {
            toast.error("Error al cambiar el estado");
        } finally {
            setEstSaving(false);
        }
    };

    // ── Skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!materia) {
        return (
            <div className="p-8 text-center">
                <p className="text-default-500">Materia no encontrada.</p>
                <Button variant="light" onPress={() => navigate("/cursando")} className="mt-4">Volver</Button>
            </div>
        );
    }

    const estadoConf = ESTADO_CONFIG[materia.estado] || ESTADO_CONFIG["Pendiente"];
    const aprobados = cursandoInfo.parciales.filter(p => p.aprobado === true).length;
    const totalParciales = cursandoInfo.parciales.length;

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">

            {/* Back */}
            <Button
                variant="light"
                startContent={<ArrowLeft size={16} />}
                onPress={() => navigate("/cursando")}
                className="pl-0 text-default-500 -mb-2"
            >
                Volver a Cursando
            </Button>

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl shadow-lg shadow-primary/20 flex-shrink-0">
                        <BookOpen className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black leading-tight">{materia.nombre}</h1>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {materia.nivel && (
                                <Chip size="sm" variant="flat" color="default" className="font-semibold">
                                    Año {materia.nivel}
                                </Chip>
                            )}
                            <Chip
                                size="sm"
                                color={estadoConf.color}
                                variant="dot"
                                startContent={estadoConf.icon}
                                className="font-semibold"
                            >
                                {materia.estado}
                            </Chip>
                            {totalParciales > 0 && (
                                <Chip size="sm" variant="flat" color="primary" className="font-semibold">
                                    {aprobados}/{totalParciales} evaluaciones ✓
                                </Chip>
                            )}
                            {/* Color picker inline */}
                            <Popover placement="bottom" showArrow>
                                <Tooltip content="Cambiar color">
                                    <PopoverTrigger>
                                        <button
                                            className="w-5 h-5 rounded-full border-2 border-default-200 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: materia.color || '#3b82f6' }}
                                        />
                                    </PopoverTrigger>
                                </Tooltip>
                                <PopoverContent className="p-3">
                                    <p className="text-xs font-semibold mb-2">Color de la materia</p>
                                    <ScrollShadow orientation="horizontal" className="pb-1">
                                        <div className="flex gap-1.5">
                                            {COLORES.map(c => (
                                                <button
                                                    key={c}
                                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${materia.color === c ? 'border-foreground scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                                                        }`}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => cambiarColor(c)}
                                                >
                                                    {materia.color === c && <Check size={12} className="text-white drop-shadow" />}
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollShadow>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    {/* Cambiar estado */}
                    <Button
                        variant="bordered"
                        size="md"
                        startContent={<RefreshCw size={15} />}
                        onPress={handleAbrirCambioEstado}
                        className="font-semibold"
                    >
                        Cambiar estado
                    </Button>

                    {/* NotebookLM */}
                    {cursandoInfo.notebookLMUrl ? (
                        <div className="flex items-center gap-1.5">
                            <Button
                                color="primary"
                                variant="shadow"
                                size="md"
                                startContent={<BookMarked size={16} />}
                                endContent={<ExternalLink size={14} />}
                                onPress={() => window.open(cursandoInfo.notebookLMUrl, '_blank')}
                                className="font-bold"
                            >
                                NotebookLM
                            </Button>
                            <Tooltip content="Cambiar link">
                                <Button isIconOnly size="sm" variant="light"
                                    onPress={() => { setNbUrl(cursandoInfo.notebookLMUrl); onNbOpen(); }}>
                                    <Pencil size={14} className="text-default-400" />
                                </Button>
                            </Tooltip>
                        </div>
                    ) : (
                        <Button
                            variant="bordered"
                            size="md"
                            startContent={<BookMarked size={16} />}
                            onPress={() => { setNbUrl(''); onNbOpen(); }}
                            className="font-semibold border-dashed"
                        >
                            + NotebookLM
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* ── Grid ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-4"
            >
                {/* Col izquierda (3/5) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <SectionCard>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-default-100">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            <h2 className="font-bold text-base">Parciales y TPs</h2>
                        </div>
                        <ParcialesSection
                            parciales={cursandoInfo.parciales}
                            condiciones={cursandoInfo.condicionesAprobacion}
                            onAgregar={agregarParcial}
                            onEditar={editarParcial}
                            onBorrar={borrarParcial}
                        />
                    </SectionCard>
                    <SectionCard>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-default-100">
                            <div className="w-1 h-6 bg-secondary rounded-full" />
                            <h2 className="font-bold text-base">Notas y Links</h2>
                        </div>
                        <NotasLinksSection
                            notas={cursandoInfo.notas}
                            onAgregar={agregarNota}
                            onBorrar={borrarNota}
                        />
                    </SectionCard>
                </div>

                {/* Col derecha (2/5) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <SectionCard>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-default-100">
                            <div className="w-1 h-6 bg-warning rounded-full" />
                            <h2 className="font-bold text-base">Condiciones de Aprobación</h2>
                        </div>
                        <CondicionesSection
                            condiciones={cursandoInfo.condicionesAprobacion}
                            onGuardar={guardarCondiciones}
                        />
                    </SectionCard>
                    <SectionCard>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-default-100">
                            <div className="w-1 h-6 bg-orange-500 rounded-full" />
                            <h2 className="font-bold text-base">Horarios de Cursada</h2>
                        </div>
                        <HorariosSection
                            materiaId={materia.id}
                            materiaNombre={materia.nombre}
                            materiaColor={materia.color}
                            horarios={cursandoInfo.horarios || []}
                            onAgregar={agregarHorario}
                            onBorrar={borrarHorario}
                        />
                    </SectionCard>
                    <SectionCard>
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-default-100">
                            <div className="w-1 h-6 bg-success rounded-full" />
                            <h2 className="font-bold text-base">Profesores</h2>
                        </div>
                        <ProfesoresSection
                            profesores={cursandoInfo.profesores}
                            onAgregar={agregarProfesor}
                            onBorrar={borrarProfesor}
                        />
                    </SectionCard>
                </div>
            </motion.div>

            {/* ── Modal NotebookLM ── */}
            <Modal isOpen={isNbOpen} onOpenChange={onNbOpenChange} size="md" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <BookMarked size={18} /> Link de NotebookLM
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="URL del notebook"
                                    placeholder="https://notebooklm.google.com/notebook/..."
                                    type="url"
                                    value={nbUrl}
                                    onValueChange={setNbUrl}
                                    startContent={<Notebook size={14} className="text-default-400" />}
                                    autoFocus
                                />
                                <p className="text-xs text-default-400">
                                    Pegá la URL de tu notebook en NotebookLM para acceder con un clic.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onNbClose}>Cancelar</Button>
                                <Button color="primary" isLoading={nbSaving} startContent={<Save size={14} />} onPress={handleSaveNb}>
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* ── Modal Cambiar Estado ── */}
            <Modal isOpen={isEstOpen} onOpenChange={onEstOpenChange} size="md" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <RefreshCw size={18} /> Cambiar estado de la materia
                            </ModalHeader>
                            <ModalBody className="gap-4">
                                <Select
                                    label="Nuevo estado"
                                    selectedKeys={[nuevoEstado]}
                                    onSelectionChange={(keys) => setNuevoEstado([...keys][0])}
                                >
                                    {ESTADOS.map(e => (
                                        <SelectItem key={e.value} color={e.color}>{e.label}</SelectItem>
                                    ))}
                                </Select>

                                {/* Pregunta sobre borrar datos */}
                                <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-warning-700 mb-1">¿Qué hacemos con los datos de la cursada?</p>
                                            <p className="text-xs text-default-500 mb-3">
                                                Parciales, condiciones, links y profes que cargaste para esta materia.
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium border transition-all ${!borrarDatos ? 'border-success bg-success/10 text-success-700' : 'border-default-200 text-default-500 hover:bg-default-50'}`}
                                                    onClick={() => setBorrarDatos(false)}
                                                >
                                                    <CheckCircle2 size={16} className={!borrarDatos ? 'text-success' : 'text-default-300'} />
                                                    Guardar como historial
                                                </button>
                                                <button
                                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium border transition-all ${borrarDatos ? 'border-danger bg-danger/10 text-danger-700' : 'border-default-200 text-default-500 hover:bg-default-50'}`}
                                                    onClick={() => setBorrarDatos(true)}
                                                >
                                                    <Trash2 size={16} className={borrarDatos ? 'text-danger' : 'text-default-300'} />
                                                    Borrar todos los datos
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onEstClose}>Cancelar</Button>
                                <Button
                                    color={ESTADOS.find(e => e.value === nuevoEstado)?.color || 'default'}
                                    isLoading={estSaving}
                                    onPress={handleCambiarEstado}
                                >
                                    Confirmar cambio
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CursandoPage;
