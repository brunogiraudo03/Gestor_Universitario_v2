import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { HABIT_COLORS, HABIT_ICONS, HABIT_CATEGORIES } from '../../../utils/habitUtils';

const HabitModal = ({ isOpen, onOpenChange, onSave, habitToEdit = null }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        color: HABIT_COLORS[0].value,
        icono: HABIT_ICONS[0],
        categoria: 'salud'
    });

    // Sincronizar formData cuando cambia habitToEdit o se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (habitToEdit) {
                setFormData({
                    nombre: habitToEdit.nombre || '',
                    descripcion: habitToEdit.descripcion || '',
                    color: habitToEdit.color || HABIT_COLORS[0].value,
                    icono: habitToEdit.icono || HABIT_ICONS[0],
                    categoria: habitToEdit.categoria || 'salud'
                });
            } else {
                setFormData({
                    nombre: '',
                    descripcion: '',
                    color: HABIT_COLORS[0].value,
                    icono: HABIT_ICONS[0],
                    categoria: 'salud'
                });
            }
        }
    }, [isOpen, habitToEdit]);

    const handleSave = () => {
        if (!formData.nombre.trim()) {
            return;
        }
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            placement="top-center"
            backdrop="blur"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">
                                {habitToEdit ? 'Editar Hábito' : 'Nuevo Hábito'}
                            </h2>
                            <p className="text-sm text-default-500 font-normal">
                                Configura tu hábito y comienza a hacer seguimiento
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Nombre del Hábito"
                                    placeholder="Ej: Hacer ejercicio"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    size="lg"
                                    variant="bordered"
                                    autoFocus
                                    isRequired
                                />

                                <Textarea
                                    label="Descripción (opcional)"
                                    placeholder="¿Por qué es importante este hábito?"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    variant="bordered"
                                    minRows={2}
                                />

                                <Select
                                    label="Categoría"
                                    selectedKeys={[formData.categoria]}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    variant="bordered"
                                    classNames={{
                                        value: "text-foreground",
                                        trigger: "bg-default-100"
                                    }}
                                >
                                    {HABIT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id} textValue={cat.name}>
                                            <div className="flex items-center gap-2">
                                                <span>{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>

                                <div>
                                    <p className="text-sm font-semibold mb-3">Icono</p>
                                    <div className="grid grid-cols-8 gap-2">
                                        {HABIT_ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icono: icon })}
                                                className={`
                                                    w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all
                                                    ${formData.icono === icon
                                                        ? 'bg-primary text-white scale-110 shadow-lg ring-2 ring-primary ring-offset-2'
                                                        : 'bg-default-100 hover:bg-default-200'}
                                                `}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-3">Color</p>
                                    <div className="grid grid-cols-8 gap-2">
                                        {HABIT_COLORS.map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`
                                                    w-10 h-10 rounded-lg transition-all
                                                    ${formData.color === color.value
                                                        ? 'scale-110 shadow-lg ring-2 ring-offset-2'
                                                        : 'hover:scale-105'}
                                                `}
                                                style={{
                                                    backgroundColor: color.value,
                                                    ringColor: color.value
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSave}
                                isDisabled={!formData.nombre.trim()}
                            >
                                {habitToEdit ? 'Guardar Cambios' : 'Crear Hábito'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default HabitModal;
