import { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Textarea, Chip, Divider
} from "@nextui-org/react";
import { Calendar, Tag, Trash2, Save, CalendarPlus } from "lucide-react";
import { useTarjetas } from "../../../hooks/useTarjetas";
import { useTodos } from "../../../hooks/useTodos";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ETIQUETAS_COLORES = [
    { id: 'red', nombre: 'Urgente', color: 'danger' },
    { id: 'orange', nombre: 'Importante', color: 'warning' },
    { id: 'yellow', nombre: 'Pendiente', color: 'default' },
    { id: 'green', nombre: 'Completado', color: 'success' },
    { id: 'blue', nombre: 'En Progreso', color: 'primary' },
    { id: 'purple', nombre: 'Idea', color: 'secondary' }
];

const TaskCardModal = ({ tarjeta, isOpen, onOpenChange, mode = "edit", onCreate }) => {
    const { editarTarjeta, borrarTarjeta } = useTarjetas(tarjeta.tableroId);
    const { agregarEvento, editarEvento, toggleTodo, borrarTodo } = useTodos();

    const [editData, setEditData] = useState({
        titulo: tarjeta.titulo || "",
        descripcion: tarjeta.descripcion || "",
        fechaVencimiento: tarjeta.fechaVencimiento || "",
        etiquetas: tarjeta.etiquetas || [],
        eventId: tarjeta.eventId || null
    });

    const [addToAgenda, setAddToAgenda] = useState(!!tarjeta.eventId);

    // Resetear formulario al abrir en modo create
    useEffect(() => {
        if (isOpen && mode === "create") {
            setEditData({
                titulo: "",
                descripcion: "",
                fechaVencimiento: "",
                etiquetas: [],
                eventId: null
            });
            setAddToAgenda(false);
        } else if (isOpen && mode === "edit") {
            setEditData({
                titulo: tarjeta.titulo || "",
                descripcion: tarjeta.descripcion || "",
                fechaVencimiento: tarjeta.fechaVencimiento || "",
                etiquetas: tarjeta.etiquetas || [],
                eventId: tarjeta.eventId || null
            });
            setAddToAgenda(!!tarjeta.eventId);
        }
    }, [isOpen, mode, tarjeta]);

    const handleSave = async () => {
        try {
            let currentEventId = editData.eventId;

            // Lógica de Agenda
            if (editData.fechaVencimiento) {
                if (addToAgenda) {
                    const eventoDatos = {
                        texto: editData.titulo,
                        tipo: "Tarea",
                        fechaEntrega: editData.fechaVencimiento,
                        completado: tarjeta.completada || false
                    };

                    if (currentEventId) {
                        // Actualizar evento existente
                        await editarEvento(currentEventId, eventoDatos);
                    } else {
                        // Crear nuevo evento
                        currentEventId = await agregarEvento(eventoDatos);
                    }
                } else if (!addToAgenda && currentEventId) {
                    // Si se desmarcó y existía, borrar evento
                    await borrarTodo(currentEventId);
                    currentEventId = null;
                }
            }

            // Actualizar datos con el nuevo eventId (o null)
            const finalData = { ...editData, eventId: currentEventId };

            if (mode === "create") {
                if (onCreate) {
                    await onCreate(finalData);
                }
            } else {
                await editarTarjeta(tarjeta.id, finalData);
                toast.success("Tarjeta actualizada");
            }
            onOpenChange(false);
        } catch (error) {
            console.error(mode === "create" ? "Error al crear tarjeta:" : "Error al editar tarjeta:", error);
            toast.error(mode === "create" ? "Error al crear la tarjeta" : "Error al actualizar la tarjeta");
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Eliminar esta tarjeta?")) return;

        try {
            await borrarTarjeta(tarjeta.id); // borrarTarjeta ya maneja el borrado de agenda
            toast.success("Tarjeta eliminada");
            onOpenChange(false);
        } catch (error) {
            console.error("Error al borrar tarjeta:", error);
            toast.error("Error al eliminar la tarjeta");
        }
    };

    const toggleEtiqueta = (etiqueta) => {
        const existe = editData.etiquetas.find(e => e.id === etiqueta.id);
        if (existe) {
            setEditData({
                ...editData,
                etiquetas: editData.etiquetas.filter(e => e.id !== etiqueta.id)
            });
        } else {
            setEditData({
                ...editData,
                etiquetas: [...editData.etiquetas, etiqueta]
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
            placement="center"
            backdrop="blur"
            classNames={{
                base: "max-h-[90vh]"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <Input
                                value={editData.titulo}
                                onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                                variant="bordered"
                                size="lg"
                                classNames={{
                                    input: "text-xl font-bold"
                                }}
                            />
                        </ModalHeader>

                        <ModalBody>
                            <div className="space-y-6">
                                {/* Descripción */}
                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Descripción</label>
                                    <Textarea
                                        value={editData.descripcion}
                                        onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                                        placeholder="Agrega una descripción más detallada..."
                                        variant="bordered"
                                        minRows={4}
                                    />
                                </div>

                                {/* Fecha de Vencimiento */}
                                <div>
                                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                                        <Calendar size={16} />
                                        Fecha de Vencimiento
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <Input
                                            type="date"
                                            value={editData.fechaVencimiento}
                                            onChange={(e) => setEditData({ ...editData, fechaVencimiento: e.target.value })}
                                            variant="bordered"
                                            className="max-w-xs"
                                        />

                                        {editData.fechaVencimiento && (
                                            <div
                                                className={`
                                                    cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border transition-all select-none
                                                    ${addToAgenda
                                                        ? 'bg-primary/10 border-primary text-primary'
                                                        : 'bg-default-100 border-default-200 text-default-500 hover:bg-default-200'
                                                    }
                                                `}
                                                onClick={() => setAddToAgenda(!addToAgenda)}
                                            >
                                                <CalendarPlus size={18} />
                                                <span className="text-sm font-medium">
                                                    {addToAgenda ? "Sincronizado con Agenda" : "Añadir a Agenda"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {editData.fechaVencimiento && (
                                        <p className="text-xs text-default-500 mt-1">
                                            {format(new Date(editData.fechaVencimiento), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                        </p>
                                    )}
                                </div>

                                <Divider />

                                {/* Etiquetas */}
                                <div>
                                    <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                                        <Tag size={16} />
                                        Etiquetas
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ETIQUETAS_COLORES.map((etiqueta) => {
                                            const isSelected = editData.etiquetas.find(e => e.id === etiqueta.id);
                                            return (
                                                <Chip
                                                    key={etiqueta.id}
                                                    color={etiqueta.color}
                                                    variant={isSelected ? "solid" : "bordered"}
                                                    onClick={() => toggleEtiqueta(etiqueta)}
                                                    className="cursor-pointer"
                                                >
                                                    {etiqueta.nombre}
                                                </Chip>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Divider />

                                {/* Información */}
                                <div className="bg-default-100 rounded-lg p-3 text-xs text-default-500">
                                    <p>Creada: {tarjeta.createdAt ? format(new Date(tarjeta.createdAt.seconds * 1000), "d MMM yyyy, HH:mm", { locale: es }) : "Fecha no disponible"}</p>
                                    {tarjeta.updatedAt && (
                                        <p className="mt-1">Última modificación: {format(new Date(tarjeta.updatedAt.seconds * 1000), "d MMM yyyy, HH:mm", { locale: es })}</p>
                                    )}
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex justify-between">
                            {mode !== "create" && (
                                <Button
                                    color="danger"
                                    variant="light"
                                    startContent={<Trash2 size={16} />}
                                    onPress={handleDelete}
                                >
                                    Eliminar
                                </Button>
                            )}
                            <div className={`flex gap-2 ${mode === "create" ? "w-full justify-end" : ""}`}>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={<Save size={16} />}
                                    onPress={handleSave}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default TaskCardModal;
