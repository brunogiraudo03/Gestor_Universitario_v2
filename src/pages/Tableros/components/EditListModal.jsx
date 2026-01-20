import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { Palette, Check } from "lucide-react";
import { LIST_COLORS } from "../../../utils/boardBackgrounds";

const EditListModal = ({ isOpen, onClose, initialName, initialColor, onSave }) => {
    const [nombre, setNombre] = useState(initialName);
    const [color, setColor] = useState(initialColor);

    // Resetear estado al abrir
    useEffect(() => {
        if (isOpen) {
            setNombre(initialName);
            setColor(initialColor);
        }
    }, [isOpen, initialName, initialColor]);

    const handleSave = () => {
        if (nombre.trim()) {
            onSave(nombre.trim(), color);
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm" placement="center" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Editar Lista</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    autoFocus
                                    label="Nombre de la lista"
                                    placeholder="Ej: Tareas pendientes"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    variant="bordered"
                                />

                                <div>
                                    <p className="text-small text-default-500 mb-2">Color de la lista</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LIST_COLORS.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setColor(c.value)}
                                                className={`
                                                    w-8 h-8 rounded-full transition-all flex items-center justify-center
                                                    ${c.id === 'none' ? 'border-2 border-default-300 bg-default-100' : ''}
                                                    ${color === c.value ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}
                                                `}
                                                style={c.value ? { backgroundColor: c.value } : {}}
                                                title={c.name}
                                            >
                                                {c.id === 'none' && !color && <Check size={14} />}
                                                {color === c.value && c.id !== 'none' && <Check size={14} className="text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button color="primary" onPress={handleSave}>
                                Guardar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default EditListModal;
