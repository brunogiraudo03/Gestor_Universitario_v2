import { useState } from 'react';
import {
    Button, Input, Textarea,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure
} from '@nextui-org/react';
import { Link, Plus, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const empty = { titulo: '', url: '', descripcion: '' };

const NotasLinksSection = ({ notas = [], onAgregar, onBorrar }) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    const handleGuardar = async () => {
        if (!form.titulo.trim()) return;
        setSaving(true);
        try {
            await onAgregar({ ...form, titulo: form.titulo.trim(), url: form.url.trim(), descripcion: form.descripcion.trim() });
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
                    <Link size={16} className="text-secondary" />
                    <span className="text-sm font-semibold text-default-600">
                        Notas y Links <span className="text-default-400">({notas.length})</span>
                    </span>
                </div>
                <Button size="sm" color="secondary" variant="flat" startContent={<Plus size={14} />} onPress={onOpen}>
                    Agregar
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {notas.length === 0 ? (
                        <p className="text-sm text-default-400 text-center py-4 italic">
                            Links de Drive, Notion, NotebookLM, apuntes...
                        </p>
                    ) : (
                        notas.map((n) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-100/40 hover:bg-default-100 transition-colors group"
                            >
                                <div className="p-1.5 bg-secondary/10 rounded-lg flex-shrink-0 mt-0.5">
                                    <Link size={14} className="text-secondary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{n.titulo}</p>
                                    {n.descripcion && (
                                        <p className="text-xs text-default-500 mt-0.5 line-clamp-2">{n.descripcion}</p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    {n.url && (
                                        <Button
                                            isIconOnly size="sm" variant="flat" color="secondary"
                                            onPress={() => window.open(n.url, '_blank')}
                                        >
                                            <ExternalLink size={14} />
                                        </Button>
                                    )}
                                    <Button
                                        isIconOnly size="sm" variant="light" color="danger"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onPress={() => onBorrar(n.id)}
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
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>Nueva nota / link</ModalHeader>
                            <ModalBody className="gap-4">
                                <Input
                                    label="Título"
                                    placeholder="Ej: Drive de apuntes, NotebookLM..."
                                    value={form.titulo}
                                    onValueChange={v => setForm(f => ({ ...f, titulo: v }))}
                                    isRequired
                                />
                                <Input
                                    label="URL (opcional)"
                                    placeholder="https://..."
                                    type="url"
                                    value={form.url}
                                    onValueChange={v => setForm(f => ({ ...f, url: v }))}
                                    startContent={<Link size={14} className="text-default-400" />}
                                />
                                <Textarea
                                    label="Descripción (opcional)"
                                    placeholder="Qué contiene, cómo acceder..."
                                    value={form.descripcion}
                                    onValueChange={v => setForm(f => ({ ...f, descripcion: v }))}
                                    minRows={2}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancelar</Button>
                                <Button color="secondary" isLoading={saving} onPress={handleGuardar}>
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

export default NotasLinksSection;
