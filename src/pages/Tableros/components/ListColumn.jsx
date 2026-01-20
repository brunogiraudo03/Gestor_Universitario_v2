import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, CardBody, CardHeader, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { GripVertical, MoreVertical, Edit2, Trash2, Plus } from "lucide-react";

import TaskCard from "./TaskCard";
import TaskCardModal from "./TaskCardModal";
import EditListModal from "./EditListModal";
import { toast } from "sonner";

const ListColumn = ({
    lista,
    index,
    tarjetas,
    editarLista,
    borrarLista,
    agregarTarjeta,
    toggleCompletada,
    editarTarjeta,
    borrarTarjeta
}) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleSaveEdit = async (nuevoNombre, nuevoColor) => {
        try {
            await editarLista(lista.id, {
                nombre: nuevoNombre,
                color: nuevoColor
            });
            // toast.success("Lista actualizada"); // Opcional, puede ser ruidoso
        } catch (error) {
            console.error("Error al editar lista:", error);
            toast.error("Error al actualizar la lista");
        }
    };

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar la lista "${lista.nombre}"? Se borrarán todas sus tarjetas.`)) {
            return;
        }

        try {
            toast.success("Lista eliminada");
            await borrarLista(lista.id);
        } catch (error) {
            console.error("Error al borrar lista:", error);
            toast.error("Error al eliminar la lista");
        }
    };

    const handleCreateTask = async (data) => {
        try {
            await agregarTarjeta({
                listaId: lista.id,
                ...data
            });
            toast.success("Tarjeta creada");
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error al crear tarjeta:", error);
            toast.error("Error al crear la tarjeta");
        }
    };

    const listColor = lista.color || null;
    const hasColor = listColor !== null;

    return (
        <>
            <Draggable draggableId={lista.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex-shrink-0 w-full max-h-full pb-2 transition-transform ${snapshot.isDragging ? 'z-50 rotate-2 scale-105 opacity-90' : ''}`}
                    >
                        <Card className="max-h-full flex flex-col bg-white dark:bg-default-50 border-2 border-default-200 shadow-lg">
                            {/* Header de la lista con color opcional */}
                            <CardHeader
                                className="flex items-center justify-between px-4 py-3 border-b-2 border-default-200 relative z-20"
                                style={hasColor ? {
                                    background: `linear-gradient(135deg, ${listColor} 0%, ${listColor}dd 100%)`,
                                    borderBottomColor: listColor
                                } : {}}
                            >
                                <div className="flex items-center gap-2 flex-1 relative overflow-hidden">
                                    <div
                                        {...provided.dragHandleProps}
                                        className={`cursor-grab active:cursor-grabbing ${hasColor ? 'text-white/80 hover:text-white' : 'text-default-400 hover:text-default-600'}`}
                                    >
                                        <GripVertical size={18} />
                                    </div>

                                    <h3
                                        className={`font-bold text-sm flex-1 truncate select-none ${hasColor
                                            ? 'text-white'
                                            : 'text-foreground'
                                            }`}
                                        title={lista.nombre}
                                    >
                                        {lista.nombre}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className={hasColor ? "text-white/80 hover:text-white" : "text-default-400"}
                                            >
                                                <MoreVertical size={18} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            onAction={(key) => {
                                                if (key === 'edit') setIsEditModalOpen(true);
                                                if (key === 'delete') handleDelete();
                                            }}
                                        >
                                            <DropdownItem
                                                key="edit"
                                                startContent={<Edit2 size={14} />}
                                            >
                                                Editar Lista
                                            </DropdownItem>
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                startContent={<Trash2 size={14} />}
                                            >
                                                Eliminar Lista
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </CardHeader>

                            {/* Área de tarjetas con scroll */}
                            <CardBody className="flex-1 overflow-y-auto p-3 space-y-2 bg-default-50/50">
                                <Droppable droppableId={lista.id} type="card">
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-lg p-2 ring-2 ring-primary/20 ring-inset' : ''}`}
                                        >
                                            {tarjetas.map((tarjeta, index) => (
                                                <TaskCard
                                                    key={tarjeta.id}
                                                    tarjeta={tarjeta}
                                                    index={index}
                                                    toggleCompletada={toggleCompletada}
                                                    editarTarjeta={editarTarjeta}
                                                    borrarTarjeta={borrarTarjeta}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                <Button
                                    size="sm"
                                    variant="light"
                                    startContent={<Plus size={16} />}
                                    onPress={() => setIsCreateModalOpen(true)}
                                    className="w-full justify-start text-default-500 hover:text-default-900 hover:bg-default-200 font-medium"
                                >
                                    Agregar tarjeta
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </Draggable>

            {/* Modals */}
            <TaskCardModal
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                mode="create"
                tarjeta={{
                    tableroId: lista.tableroId,
                    listaId: lista.id,
                    titulo: ""
                }}
                onCreate={handleCreateTask}
            />

            <EditListModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialName={lista.nombre}
                initialColor={lista.color}
                onSave={handleSaveEdit}
            />
        </>
    );
};

export default ListColumn;
