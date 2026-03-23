import { useState } from 'react';
import {
    Button, Input, Select, SelectItem, Chip,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure
} from '@nextui-org/react';
import { Users, Plus, Trash2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CARGOS = [
    { value: 'titular', label: 'Titular' },
    { value: 'jtp', label: 'JTP' },
    { value: 'ayudante', label: 'Ayudante' },
    { value: 'otro', label: 'Otro' },
];

const cargoColor = { titular: 'primary', jtp: 'secondary', ayudante: 'success', otro: 'default' };

const empty = { nombre: '', cargo: 'jtp', email: '' };

const ProfesoresSection = ({ profesores = [], onAgregar, onBorrar }) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const initials = (nombre) => nombre.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

    const handleGuardar = async () => {
        if (!form.nombre.trim()) return;
        setSaving(true);
        try {
            await onAgregar({ ...form, nombre: form.nombre.trim(), email: form.email.trim() });
            setForm(empty);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-success" />
                    <span className="text-sm font-semibold text-default-600">
                        Profesores <span className="text-default-400">({profesores.length})</span>
                    </span>
                </div>
                <Button size="sm" color="success" variant="flat" startContent={<Plus size={14} />} onPress={onOpen}>
                    Agregar
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {profesores.length === 0 ? (
                        <p className="text-sm text-default-400 text-center py-4 italic">
                            Agregá los docentes y sus mails de contacto
                        </p>
                    ) : (
                        profesores.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-100/40 hover:bg-default-100 transition-colors group"
                            >
                                {/* Avatar con iniciales */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-success-400 to-success-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                    {initials(p.nombre)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm truncate">{p.nombre}</p>
                                        <Chip size="sm" variant="flat" color={cargoColor[p.cargo] || 'default'} className="text-xs h-5">
                                            {CARGOS.find(c => c.value === p.cargo)?.label || p.cargo}
                                        </Chip>
                                    </div>
                                    {p.email && (
                                        <p className="text-xs text-default-400 truncate mt-0.5">{p.email}</p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {p.email && (
                                        <Button
                                            isIconOnly size="sm" variant="flat" color="success"
                                            onPress={() => window.open(`mailto:${p.email}`, '_blank')}
                                            title={`Enviar mail a ${p.nombre}`}
                                        >
                                            <Mail size={14} />
                                        </Button>
                                    )}
                                    <Button
                                        isIconOnly size="sm" variant="light" color="danger"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onPress={() => onBorrar(p.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Nuevo profesor</ModalHeader>
                            <ModalBody className="gap-4">
                                <Input
                                    label="Nombre completo"
                                    placeholder="Ej: María García"
                                    value={form.nombre}
                                    onValueChange={v => setForm(f => ({ ...f, nombre: v }))}
                                    isRequired
                                />
                                <Select
                                    label="Cargo"
                                    selectedKeys={[form.cargo]}
                                    onSelectionChange={keys => setForm(f => ({ ...f, cargo: [...keys][0] }))}
                                >
                                    {CARGOS.map(c => <SelectItem key={c.value}>{c.label}</SelectItem>)}
                                </Select>
                                <Input
                                    label="Email (opcional)"
                                    type="email"
                                    placeholder="profe@universidad.edu"
                                    value={form.email}
                                    onValueChange={v => setForm(f => ({ ...f, email: v }))}
                                    startContent={<Mail size={14} className="text-default-400" />}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="success" isLoading={saving} onPress={handleGuardar}>
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

export default ProfesoresSection;
