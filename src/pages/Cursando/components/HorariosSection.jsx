import { useState } from "react";
import {
    Button, Input, Select, SelectItem, ScrollShadow,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure
} from "@nextui-org/react";
import { CalendarClock, Plus, Trash2, MapPin, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#71717a", "#78716c", "#0f172a"
];

const empty = (color) => ({
    dia: "Lunes", inicio: "08:00", fin: "10:00",
    aula: "", comision: "", color: color || "#3b82f6"
});

const HorariosSection = ({ materiaId, materiaNombre, materiaColor, horarios = [], onAgregar, onBorrar }) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [form, setForm] = useState(empty(materiaColor));
    const [saving, setSaving] = useState(false);

    const handleOpen = () => {
        setForm(empty(materiaColor));
        onOpen();
    };

    const handleGuardar = async () => {
        setSaving(true);
        try {
            await onAgregar({
                materia: materiaNombre,
                dia: form.dia,
                inicio: form.inicio,
                fin: form.fin,
                aula: form.aula.trim(),
                comision: form.comision.trim(),
                color: form.color,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const diaAbrev = { Lunes: "Lun", Martes: "Mar", Miércoles: "Mié", Jueves: "Jue", Viernes: "Vie", Sábado: "Sáb" };

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarClock size={16} className="text-orange-500" />
                    <span className="text-sm font-semibold text-default-600">
                        Horario de cursada <span className="text-default-400">({horarios.length} bloques)</span>
                    </span>
                </div>
                <Button size="sm" color="warning" variant="flat" startContent={<Plus size={14} />} onPress={handleOpen}>
                    Agregar
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {horarios.length === 0 ? (
                        <p className="text-sm text-default-400 text-center py-4 italic">
                            Agregá los días y horarios de la materia
                        </p>
                    ) : (
                        horarios.map((h) => (
                            <motion.div
                                key={h.horarioId}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-100/40 hover:bg-default-100 transition-colors group"
                                style={{ borderLeft: `3px solid ${h.color || materiaColor || '#3b82f6'}` }}
                            >
                                {/* Día */}
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                    style={{ backgroundColor: h.color || materiaColor || '#3b82f6' }}
                                >
                                    {diaAbrev[h.dia] || h.dia.slice(0, 3)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm flex items-center gap-1">
                                            <Clock size={12} className="text-default-400" /> {h.inicio} – {h.fin}
                                        </span>
                                        {h.aula && (
                                            <span className="text-xs text-default-500 flex items-center gap-1">
                                                <MapPin size={11} /> {h.aula}
                                            </span>
                                        )}
                                        {h.comision && (
                                            <span className="text-xs text-default-500 flex items-center gap-1">
                                                <Users size={11} /> {h.comision}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    isIconOnly size="sm" variant="light" color="danger"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPress={() => onBorrar(h.horarioId)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {horarios.length > 0 && (
                    <p className="text-xs text-default-400 text-center mt-1">
                        Estos horarios se sincronizan automáticamente con la página de Horarios
                    </p>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Agregar horario de clase</ModalHeader>
                            <ModalBody className="gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Select
                                        label="Día"
                                        selectedKeys={[form.dia]}
                                        onSelectionChange={(keys) => setForm(f => ({ ...f, dia: [...keys][0] }))}
                                    >
                                        {DAYS.map(d => <SelectItem key={d}>{d}</SelectItem>)}
                                    </Select>
                                    <Input
                                        label="Aula / Edificio"
                                        placeholder="Ej: Aula 204"
                                        value={form.aula}
                                        onValueChange={v => setForm(f => ({ ...f, aula: v }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="time" label="Inicio" value={form.inicio}
                                        onValueChange={v => setForm(f => ({ ...f, inicio: v }))} />
                                    <Input type="time" label="Fin" value={form.fin}
                                        onValueChange={v => setForm(f => ({ ...f, fin: v }))} />
                                </div>
                                <Input
                                    label="Comisión (opcional)"
                                    placeholder="Ej: 1K4"
                                    value={form.comision}
                                    onValueChange={v => setForm(f => ({ ...f, comision: v }))}
                                />
                                {/* Color picker */}
                                <div>
                                    <label className="text-small font-medium text-default-700 block mb-2">Color del bloque</label>
                                    <ScrollShadow orientation="horizontal" className="pb-2">
                                        <div className="flex gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.color === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => setForm(f => ({ ...f, color: c }))}
                                                >
                                                    {form.color === c && <Check size={12} className="text-white drop-shadow-md" />}
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollShadow>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="warning" isLoading={saving} onPress={handleGuardar}>
                                    Agregar al horario
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default HorariosSection;
