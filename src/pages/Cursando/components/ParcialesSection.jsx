import { useState } from 'react';
import {
    Button, Input, Select, SelectItem, Chip,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure
} from '@nextui-org/react';
import { Plus, Trash2, CheckCircle2, XCircle, FileText, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPOS = [
    { value: 'parcial', label: 'Parcial' },
    { value: 'tp', label: 'Trabajo Práctico' },
    { value: 'final', label: 'Final' },
    { value: 'coloquio', label: 'Coloquio' },
];

const tipoColor = { parcial: 'primary', tp: 'secondary', final: 'warning', coloquio: 'success' };

const empty = { nombre: '', tipo: 'parcial', fecha: '', nota: '', aprobado: null };

const ParcialesSection = ({ parciales = [], condiciones = {}, onAgregar, onEditar, onBorrar }) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const aprobados = parciales.filter(p => p.aprobado === true).length;
    const totalParciales = Math.max(parseInt(condiciones?.numParciales) || 0, parciales.length);
    const conNota = parciales.filter(p => p.nota !== '' && p.nota !== undefined && !isNaN(parseFloat(p.nota)));
    const promedio = conNota.length > 0
        ? (conNota.reduce((acc, p) => acc + parseFloat(p.nota), 0) / conNota.length).toFixed(2)
        : null;

    const handleOpen = (parcial = null) => {
        if (parcial) {
            setForm({ nombre: parcial.nombre, tipo: parcial.tipo, fecha: parcial.fecha || '', nota: parcial.nota || '', aprobado: parcial.aprobado });
            setEditId(parcial.id);
        } else {
            setForm(empty);
            setEditId(null);
        }
        onOpen();
    };

    const handleGuardar = async () => {
        if (!form.nombre.trim()) return;
        setSaving(true);
        try {
            const datos = {
                nombre: form.nombre.trim(),
                tipo: form.tipo,
                fecha: form.fecha,
                nota: form.nota !== '' ? form.nota : '',
                aprobado: form.aprobado,
            };
            if (editId) await onEditar(editId, datos);
            else await onAgregar(datos);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <span className="font-semibold text-sm text-default-600">
                        {totalParciales > 0 ? `${aprobados}/${totalParciales} aprobadas` : 'Sin parciales cargados'}
                        {promedio && <span className="text-default-400"> · prom. <span className="text-foreground font-bold">{promedio}</span></span>}
                    </span>
                </div>
                <Button size="sm" color="primary" variant="flat" startContent={<Plus size={14} />} onPress={() => handleOpen()}>
                    Agregar
                </Button>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {parciales.length === 0 ? (
                        <p className="text-center text-default-400 text-sm py-6">Sin evaluaciones cargadas aún</p>
                    ) : (
                        parciales.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-100/40 hover:bg-default-100 transition-colors group"
                            >
                                {/* Estado */}
                                {p.aprobado === true
                                    ? <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                                    : p.aprobado === false
                                        ? <XCircle size={18} className="text-danger flex-shrink-0" />
                                        : <div className="w-[18px] h-[18px] rounded-full border-2 border-default-300 flex-shrink-0" />
                                }
                                {/* Nombre + tipo */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{p.nombre}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Chip size="sm" variant="flat" color={tipoColor[p.tipo] || 'default'} className="text-xs h-5">
                                            {TIPOS.find(t => t.value === p.tipo)?.label || p.tipo}
                                        </Chip>
                                        {p.fecha && <span className="text-xs text-default-400">{p.fecha}</span>}
                                    </div>
                                </div>
                                {/* Nota */}
                                {p.nota !== '' && p.nota !== undefined && (
                                    <div className="flex flex-col items-center px-2">
                                        <span className="text-2xl font-black leading-none text-foreground">{p.nota}</span>
                                        <span className="text-[10px] text-default-400">nota</span>
                                    </div>
                                )}
                                {/* Acciones */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button isIconOnly size="sm" variant="light" onPress={() => handleOpen(p)}>
                                        <Pencil size={14} className="text-default-500" />
                                    </Button>
                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onBorrar(p.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Modal Agregar/Editar */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>{editId ? 'Editar evaluación' : 'Nueva evaluación'}</ModalHeader>
                            <ModalBody className="gap-4">
                                <Input
                                    label="Nombre"
                                    placeholder="Ej: 1er Parcial, TP1..."
                                    value={form.nombre}
                                    onValueChange={v => setForm(f => ({ ...f, nombre: v }))}
                                    isRequired
                                />
                                <Select
                                    label="Tipo"
                                    selectedKeys={[form.tipo]}
                                    onSelectionChange={keys => setForm(f => ({ ...f, tipo: [...keys][0] }))}
                                >
                                    {TIPOS.map(t => <SelectItem key={t.value}>{t.label}</SelectItem>)}
                                </Select>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Fecha"
                                        type="date"
                                        value={form.fecha}
                                        onValueChange={v => setForm(f => ({ ...f, fecha: v }))}
                                    />
                                    <Input
                                        label="Nota (opcional)"
                                        type="number"
                                        placeholder="7.5"
                                        min="0" max="10"
                                        value={form.nota}
                                        onValueChange={v => setForm(f => ({ ...f, nota: v }))}
                                    />
                                </div>
                                {/* Estado aprobado */}
                                <div>
                                    <p className="text-sm text-default-500 mb-2">¿Resultado?</p>
                                    <div className="flex gap-2">
                                        {[
                                            { val: true, label: 'Aprobé ✓', color: 'success' },
                                            { val: false, label: 'Desaprobé ✗', color: 'danger' },
                                            { val: null, label: 'Pendiente', color: 'default' },
                                        ].map(opt => (
                                            <Button
                                                key={String(opt.val)}
                                                size="sm"
                                                color={opt.color}
                                                variant={form.aprobado === opt.val ? 'solid' : 'flat'}
                                                onPress={() => setForm(f => ({ ...f, aprobado: opt.val }))}
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="primary" isLoading={saving} onPress={handleGuardar}>
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ParcialesSection;
