import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure, Spinner } from "@nextui-org/react";
import { ArrowLeft, MoreVertical, Edit2, Trash2, Settings } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTableros } from "../../hooks/useTableros";
import { useListas } from "../../hooks/useListas";
import { useTarjetas } from "../../hooks/useTarjetas";
import { getBackgroundStyle } from "../../utils/boardBackgrounds";
import BoardBackgroundPicker from "./components/BoardBackgroundPicker";
import ListColumn from "./components/ListColumn";
import AddListButton from "./components/AddListButton";
import { toast } from "sonner";

const BoardView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { tableros, loading, editarTablero, borrarTablero } = useTableros();
    const { listas, agregarLista, editarLista, borrarLista, reordenarListas } = useListas(id);
    const {
        tarjetas,
        agregarTarjeta,
        editarTarjeta,
        borrarTarjeta,
        moverTarjeta,
        reordenarTarjetas,
        toggleCompletada
    } = useTarjetas(id);

    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

    const tablero = tableros.find(t => t.id === id);

    const [editData, setEditData] = useState({
        nombre: "",
        descripcion: "",
        fondo: null,
        icono: ""
    });

    const handleOpenEdit = () => {
        if (tablero) {
            setEditData({
                nombre: tablero.nombre,
                descripcion: tablero.descripcion || "",
                fondo: tablero.fondo,
                icono: tablero.icono || "📋"
            });
            onEditOpen();
        }
    };

    const handleSaveEdit = async () => {
        try {
            await editarTablero(id, editData);
            toast.success("Tablero actualizado");
            onEditOpenChange(false);
        } catch (error) {
            console.error("Error al editar tablero:", error);
            toast.error("Error al actualizar el tablero");
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar este tablero? Se borrarán todas las listas y tarjetas.")) {
            return;
        }

        try {
            await borrarTablero(id);
            toast.success("Tablero eliminado");
            navigate("/tableros");
        } catch (error) {
            console.error("Error al borrar tablero:", error);
            toast.error("Error al eliminar el tablero");
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        // Drag de listas
        if (type === "list") {
            const newListas = Array.from(listas);
            const [removed] = newListas.splice(source.index, 1);
            newListas.splice(destination.index, 0, removed);

            await reordenarListas(newListas);
            return;
        }

        // Drag de tarjetas
        if (type === "card") {
            const sourceListId = source.droppableId;
            const destListId = destination.droppableId;

            // CASO 1: Mover dentro de la misma lista
            if (sourceListId === destListId) {
                const listCards = tarjetas
                    .filter(t => t.listaId === sourceListId)
                    .sort((a, b) => a.orden - b.orden);

                const [removed] = listCards.splice(source.index, 1);
                listCards.splice(destination.index, 0, removed);

                // Reordenar visual y en DB
                await reordenarTarjetas(sourceListId, listCards);
            }
            // CASO 2: Mover a otra lista
            else {
                const sourceCards = tarjetas
                    .filter(t => t.listaId === sourceListId)
                    .sort((a, b) => a.orden - b.orden);

                const destCards = tarjetas
                    .filter(t => t.listaId === destListId)
                    .sort((a, b) => a.orden - b.orden);

                const [movedCard] = sourceCards.splice(source.index, 1);

                if (movedCard) {
                    // Actualizar localmente para la lógica de reordenamiento
                    const updatedCard = { ...movedCard, listaId: destListId };
                    destCards.splice(destination.index, 0, updatedCard);

                    // 1. Mover la tarjeta (cambia listaId y orden)
                    moverTarjeta(movedCard.id, destListId, destination.index);

                    // 2. Reordenar lista origen (llenar huecos)
                    reordenarTarjetas(sourceListId, sourceCards);

                    // 3. Reordenar lista destino (hacer espacio y asegurar orden correcto)
                    reordenarTarjetas(destListId, destCards);
                }
            }
        }
    };

    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size="lg" label="Cargando tablero..." />
            </div>
        );
    }

    // Si no está cargando y no hay tablero, redirigir
    if (!tablero) {
        navigate("/tableros");
        return null;
    }

    return (
        <div
            className="h-full flex flex-col overflow-hidden"
            style={getBackgroundStyle(tablero.fondo)}
        >
            {/* Overlay oscuro global para mejorar contraste (Más fuerte para Light Mode) */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Header Oscuro */}
            <div className="relative flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-md">


                <div className="relative z-10 px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => navigate("/tableros")}
                            className="text-white hover:bg-white/20"
                        >
                            <ArrowLeft size={20} />
                        </Button>

                        <div className="flex items-center gap-3">
                            <span className="text-3xl md:text-4xl shadow-sm">
                                {tablero.icono || "📋"}
                            </span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {tablero.nombre}
                                </h1>
                                {tablero.descripcion && (
                                    <p className="text-white/80 text-sm mt-1">
                                        {tablero.descripcion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                variant="light"
                                className="text-white hover:bg-white/20"
                            >
                                <MoreVertical size={20} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Opciones del tablero">
                            <DropdownItem
                                key="edit"
                                startContent={<Edit2 size={16} />}
                                onPress={handleOpenEdit}
                            >
                                Editar Tablero
                            </DropdownItem>
                            <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 size={16} />}
                                onPress={handleDelete}
                            >
                                Eliminar Tablero
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Área de listas con layout Grid (Alineado) */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 bg-black/5 dark:bg-black/20">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="board" type="list" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20 items-start"
                            >
                                {listas.map((lista, index) => (
                                    <div key={lista.id} className="w-full">
                                        <ListColumn
                                            lista={lista}
                                            index={index}
                                            tarjetas={tarjetas.filter(t => t.listaId === lista.id).sort((a, b) => a.orden - b.orden)}
                                            editarLista={editarLista}
                                            borrarLista={borrarLista}
                                            agregarTarjeta={agregarTarjeta}
                                            editarTarjeta={editarTarjeta}
                                            borrarTarjeta={borrarTarjeta}
                                            toggleCompletada={toggleCompletada}
                                        />
                                    </div>
                                ))}

                                {provided.placeholder}

                                <div className="w-full">
                                    <AddListButton tableroId={id} onAdd={agregarLista} />
                                </div>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Modal Editar Tablero (Estilo Renovado) */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl" backdrop="blur" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Configuración del Tablero</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Personaliza el aspecto y la información de tu tablero
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Nombre del Tablero"
                                        placeholder="Ej: Proyecto Universidad"
                                        value={editData.nombre}
                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                        size="lg"
                                        variant="bordered"
                                        autoFocus
                                    />

                                    <Textarea
                                        label="Descripción"
                                        placeholder="Describe el propósito de este tablero..."
                                        value={editData.descripcion}
                                        onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                                        variant="bordered"
                                        minRows={3}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold mb-3">Estilo y Fondo</p>
                                        <BoardBackgroundPicker
                                            selectedBackground={editData.fondo}
                                            onSelectBackground={(fondo) => setEditData({ ...editData, fondo })}
                                            selectedIcon={editData.icono}
                                            onSelectIcon={(icono) => setEditData({ ...editData, icono })}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleSaveEdit}>
                                    Guardar Cambios
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default BoardView;
