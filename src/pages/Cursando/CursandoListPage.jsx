import { useState, useMemo } from "react";
import {
    Card, CardBody, Chip, Button, Popover, PopoverTrigger, PopoverContent, Tooltip,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    CheckboxGroup, Checkbox
} from "@nextui-org/react";
import { BookOpen, ChevronRight, BookMarked, ExternalLink, FileText, GraduationCap, Palette, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useUserStore from "../../stores/useUserStore";
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas";
import { toast } from "sonner";

const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#71717a", "#78716c", "#0f172a"
];

// Inline color picker popover for a materia
const ColorPicker = ({ color, onSelect }) => (
    <Popover placement="right" showArrow>
        <Tooltip content="Cambiar color" placement="top">
            <PopoverTrigger>
                <button
                    className="w-5 h-5 rounded-full border-2 border-default-200 flex-shrink-0 hover:scale-110 transition-transform focus:outline-none"
                    style={{ backgroundColor: color || '#3b82f6' }}
                    onClick={e => e.stopPropagation()}
                />
            </PopoverTrigger>
        </Tooltip>
        <PopoverContent className="p-3">
            <p className="text-xs font-semibold mb-2 text-default-600">Color de la materia</p>
            <div className="grid grid-cols-5 gap-1.5">
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${color === c ? 'border-foreground scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                        onClick={(e) => { e.stopPropagation(); onSelect(c); }}
                    >
                        {color === c && <Check size={12} className="text-white drop-shadow-md" />}
                    </button>
                ))}
            </div>
        </PopoverContent>
    </Popover>
);

const CursandoListPage = () => {
    const navigate = useNavigate();
    const { materias } = useUserStore();
    const { editarMateria } = useMaterias();
    const { electivas, editarElectiva } = useElectivas();

    const materiasCursando = useMemo(() => {
        const mat = materias.filter(m => m.estado === "Cursando").map(m => ({ ...m, isElectiva: false }));
        const ele = electivas.filter(e => e.estado === "Cursando").map(e => ({ ...e, isElectiva: true }));
        return [...mat, ...ele].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [materias, electivas]);

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [saving, setSaving] = useState(false);

    // Materias disponibles para agregar (no están cursando ni aprobadas)
    const disponiblesToAdd = useMemo(() => {
        const mat = materias.filter(m => m.estado !== "Cursando" && m.estado !== "Aprobada").map(m => ({ ...m, isElectiva: false }));
        const ele = electivas.filter(e => e.estado !== "Cursando" && e.estado !== "Aprobada").map(e => ({ ...e, isElectiva: true }));
        return [...mat, ...ele].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [materias, electivas]);

    const handleAgregarMultiple = async () => {
        if (selectedKeys.length === 0) return;
        setSaving(true);
        try {
            const promesas = selectedKeys.map(id => {
                const item = disponiblesToAdd.find(d => d.id === id);
                if (!item) return Promise.resolve();
                if (item.isElectiva) {
                    return editarElectiva(id, { estado: "Cursando" });
                } else {
                    return editarMateria(id, { estado: "Cursando" });
                }
            });
            await Promise.all(promesas);
            toast.success(`${selectedKeys.length} materias agregadas a cursando ✓`);
            onClose();
            setSelectedKeys([]);
        } catch (error) {
            toast.error("Error al agregar materias");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl shadow-lg shadow-primary/20">
                        <GraduationCap className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black">Cursando</h1>
                        <p className="text-default-500 text-sm mt-0.5">Materias de este cuatrimestre</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Chip color="primary" variant="flat" className="font-bold text-base px-2 py-5 hidden sm:flex">
                        {materiasCursando.length} {materiasCursando.length === 1 ? "materia" : "materias"}
                    </Chip>
                    <Button color="primary" endContent={<Plus size={18} />} onPress={() => { setSelectedKeys([]); onOpen(); }} className="font-bold">
                        Agregar
                    </Button>
                </div>
            </motion.div>

            {/* Lista */}
            {materiasCursando.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                >
                    <div className="p-5 bg-primary/10 rounded-full inline-flex mb-4">
                        <GraduationCap size={40} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Sin materias cursando</h2>
                    <p className="text-default-500 text-sm mb-6 max-w-sm mx-auto">
                        Marcá una materia como "Cursando" en el Plan de Estudio para que aparezca acá.
                    </p>
                    <Button color="primary" variant="shadow" onPress={() => navigate("/plan")}>
                        Ir al Plan de Estudio
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-wrap gap-5"
                >
                    {materiasCursando.map((materia, i) => {
                        const info = materia.cursandoInfo || {};
                        const parciales = info.parciales || [];
                        const aprobados = parciales.filter(p => p.aprobado === true).length;
                        const total = Math.max(parseInt(info.condicionesAprobacion?.numParciales) || 0, parciales.length);
                        const pct = total > 0 ? Math.round((aprobados / total) * 100) : 0;
                        const conNota = parciales.filter(p => p.nota !== '' && !isNaN(parseFloat(p.nota)));
                        const promedio = conNota.length > 0
                            ? (conNota.reduce((a, p) => a + parseFloat(p.nota), 0) / conNota.length).toFixed(1)
                            : null;
                        const color = materia.color || '#3b82f6';

                        return (
                            <motion.div
                                key={materia.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 + i * 0.04 }}
                            >
                                <Card
                                    isPressable
                                    onPress={() => navigate(`/cursando/${materia.id}`)}
                                    className="border border-default-100 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all group w-full sm:w-[300px] h-[210px] shrink-0 overflow-hidden"
                                    style={{ borderLeft: `4px solid ${color}` }}
                                >
                                    <CardBody className="p-4 flex flex-col h-full overflow-hidden">
                                        {/* Nombre + color picker */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {materia.nombre}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        {materia.nivel && (
                                                            <Chip size="sm" variant="flat" color="default" className="text-xs">
                                                                Año {materia.nivel}
                                                            </Chip>
                                                        )}
                                                        {materia.modalidad && (
                                                            <Chip size="sm" variant="flat" color="default" className="text-xs">
                                                                {materia.modalidad}
                                                            </Chip>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Color picker dot */}
                                                <ColorPicker
                                                    color={color}
                                                    onSelect={c => materia.isElectiva ? editarElectiva(materia.id, { color: c }) : editarMateria(materia.id, { color: c })}
                                                />
                                            </div>
                                        </div>

                                        {/* Barra de progreso e Info rápida en el fondo */}
                                        <div className="mt-auto flex flex-col gap-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-xs text-default-500 flex items-center gap-1">
                                                        <FileText size={11} />
                                                        {total > 0 ? `${aprobados}/${total} evaluaciones` : 'Sin evaluaciones'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {promedio && (
                                                            <span className="text-xs font-bold text-foreground">prom. {promedio}</span>
                                                        )}
                                                        {total > 0 && (
                                                            <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-default-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: total > 0 ? `${pct}%` : '0%', backgroundColor: color }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Info rápida */}
                                            <div className="flex items-center justify-between pt-1 border-t border-default-100">
                                                {info.notebookLMUrl ? (
                                                    <button
                                                        className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                                                        style={{ color }}
                                                        onClick={(e) => { e.stopPropagation(); window.open(info.notebookLMUrl, '_blank'); }}
                                                    >
                                                        <BookMarked size={13} />
                                                        NotebookLM
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
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Modal Agregar */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Agregar a Cursando
                                <span className="text-sm text-default-500 font-normal">
                                    Seleccioná las materias o electivas que empezaste a cursar.
                                </span>
                            </ModalHeader>
                            <ModalBody>
                                {disponiblesToAdd.length === 0 ? (
                                    <p className="text-center text-default-500 py-4">No hay materias disponibles para agregar.</p>
                                ) : (
                                    <CheckboxGroup
                                        value={selectedKeys}
                                        onChange={setSelectedKeys}
                                        className="gap-2"
                                    >
                                        {disponiblesToAdd.map(m => (
                                            <Checkbox key={m.id} value={m.id} classNames={{ label: "w-full" }}>
                                                <div className="flex flex-col gap-1 w-full ml-2">
                                                    <span className="font-semibold text-sm leading-tight">{m.nombre}</span>
                                                    <div className="flex gap-2">
                                                        {m.isElectiva ? (
                                                            <Chip size="sm" variant="flat" color="secondary" className="text-[10px] h-5">Electiva</Chip>
                                                        ) : (
                                                            <Chip size="sm" variant="flat" color="default" className="text-[10px] h-5">Año {m.nivel}</Chip>
                                                        )}
                                                    </div>
                                                </div>
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleAgregarMultiple} isLoading={saving} isDisabled={selectedKeys.length === 0}>
                                    Agregar ({selectedKeys.length})
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default CursandoListPage;
