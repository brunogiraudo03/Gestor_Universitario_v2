import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card, CardBody, Chip, Checkbox, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Calendar, Tag, GripVertical, MoreVertical, Edit2, Trash2, Clock } from "lucide-react";
import TaskCardModal from "./TaskCardModal";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const TaskCard = ({ tarjeta, index, toggleCompletada, editarTarjeta, borrarTarjeta }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleToggle = async (isSelected) => {
        await toggleCompletada(tarjeta.id, tarjeta.completada);
    };

    const handleDelete = async () => {
        try {
            toast.success("Tarea eliminada");
            await borrarTarjeta(tarjeta.id);
        } catch (error) {
            console.error(error);
            toast.error("Hubo un error al eliminar");
        }
    };

    const getFechaInfo = () => {
        if (!tarjeta.fechaVencimiento) return null;

        const fecha = new Date(tarjeta.fechaVencimiento);

        if (tarjeta.completada) {
            return { color: "success", text: "Completada", icon: "✓" };
        }

        if (isPast(fecha) && !isToday(fecha)) {
            return { color: "danger", text: "Vencida", icon: "!" };
        }

        if (isToday(fecha)) {
            return { color: "warning", text: "Hoy", icon: "⚡" };
        }

        if (isTomorrow(fecha)) {
            return { color: "warning", text: "Mañana", icon: "📅" };
        }

        return {
            color: "default",
            text: format(fecha, "d MMM", { locale: es }),
            icon: "📆"
        };
    };

    const fechaInfo = getFechaInfo();

    return (
        <>
            <Draggable draggableId={tarjeta.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-2"
                    >
                        <Card
                            className={`
                group
                bg-white dark:bg-default-100 
                border-2 border-default-200
                hover:border-primary hover:shadow-lg 
                transition-all duration-200
                ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 border-primary' : ''}
                ${tarjeta.completada ? 'opacity-70' : ''}
              `}
                        >
                            <CardBody className="p-3 cursor-pointer" onClick={onOpen}>
                                <div className="flex items-start gap-2">
                                    {/* Drag Handle */}
                                    <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing text-default-300 hover:text-primary mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <GripVertical size={16} />
                                    </div>

                                    {/* Checkbox */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            isSelected={tarjeta.completada}
                                            onValueChange={handleToggle}
                                            size="sm"
                                            color="success"
                                            className="mt-0.5"
                                        />
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-sm mb-1 ${tarjeta.completada ? 'line-through text-default-400' : 'text-foreground'}`}>
                                            {tarjeta.titulo}
                                        </h4>

                                        {tarjeta.descripcion && (
                                            <p className="text-xs text-default-500 line-clamp-2 mb-2">
                                                {tarjeta.descripcion}
                                            </p>
                                        )}

                                        {/* Metadatos */}
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {tarjeta.fechaVencimiento && (
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        new Date(tarjeta.fechaVencimiento) < new Date()
                                                            ? "danger"
                                                            : "default"
                                                    }
                                                    startContent={<Calendar size={12} />}
                                                    className="text-xs"
                                                >
                                                    {format(new Date(tarjeta.fechaVencimiento), "d MMM", { locale: es })}
                                                </Chip>
                                            )}

                                            {tarjeta.etiquetas?.map((etiqueta) => (
                                                <Chip
                                                    key={etiqueta.id}
                                                    size="sm"
                                                    color={etiqueta.color}
                                                    variant="flat"
                                                    className="text-xs"
                                                >
                                                    {etiqueta.nombre}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    className="z-10 aria-expanded:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Acciones de tarjeta">
                                                <DropdownItem
                                                    key="edit"
                                                    startContent={<Edit2 size={14} />}
                                                    onPress={onOpen}
                                                >
                                                    Editar
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="delete"
                                                    className="text-danger"
                                                    color="danger"
                                                    startContent={<Trash2 size={14} />}
                                                    onPress={handleDelete}
                                                >
                                                    Eliminar
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </Draggable>

            <TaskCardModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                tarjeta={tarjeta}
                mode="edit"
            />
        </>
    );
};

export default TaskCard;
