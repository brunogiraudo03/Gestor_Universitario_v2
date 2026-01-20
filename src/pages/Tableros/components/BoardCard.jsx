import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from "@nextui-org/react";
import { LayoutGrid, List, CheckSquare, MoreVertical, Edit2, Trash2, Settings } from "lucide-react";
import { getBackgroundStyle } from "../../../utils/boardBackgrounds";
import { useListas } from "../../../hooks/useListas";
import { useTarjetas } from "../../../hooks/useTarjetas";
import { useTableros } from "../../../hooks/useTableros";
import BoardBackgroundPicker from "./BoardBackgroundPicker";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BoardCard = ({ tablero }) => {
    const navigate = useNavigate();
    const { listas } = useListas(tablero.id);
    const { tarjetas } = useTarjetas(tablero.id);
    const { editarTablero, borrarTablero } = useTableros();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [editData, setEditData] = useState({
        nombre: tablero.nombre,
        descripcion: tablero.descripcion || "",
        icono: tablero.icono,
        fondo: tablero.fondo
    });

    const stats = {
        listas: listas.length,
        tarjetas: tarjetas.length,
        completadas: tarjetas.filter(t => t.completada).length
    };

    const handleCardClick = () => {
        navigate(`/tableros/${tablero.id}`);
    };

    const handleEdit = async () => {
        try {
            await editarTablero(tablero.id, editData);
            toast.success("Tablero actualizado");
            onOpenChange(false);
        } catch (error) {
            console.error("Error al editar tablero:", error);
            toast.error("Error al actualizar el tablero");
        }
    };

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar el tablero "${tablero.nombre}"? Se borrarán todas las listas y tareas.`)) {
            return;
        }

        try {
            await borrarTablero(tablero.id);
            toast.success("Tablero eliminado");
        } catch (error) {
            console.error("Error al borrar tablero:", error);
            toast.error("Error al eliminar el tablero");
        }
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full"
            >
                <Card
                    isPressable
                    onPress={handleCardClick}
                    className="w-full min-h-[220px] border-2 border-default-200 hover:border-primary transition-colors shadow-lg hover:shadow-xl cursor-pointer"
                >
                    {/* Fondo del tablero */}
                    <div
                        className="absolute inset-0 opacity-90"
                        style={getBackgroundStyle(tablero.fondo)}
                    />

                    {/* Overlay oscuro para legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />

                    <CardBody className="relative z-10 flex flex-col justify-between p-5 h-full">
                        <div className="flex items-start justify-between mb-2 w-full">
                            <div className="flex-1 mr-2 text-left">
                                <span className="text-4xl mb-3 block">{tablero.icono || "📋"}</span>
                                <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                                    {tablero.nombre}
                                </h3>
                            </div>

                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0"
                                        >
                                            <MoreVertical size={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Opciones del tablero"
                                        onAction={(key) => {
                                            if (key === 'delete') handleDelete();
                                            if (key === 'edit') onOpen();
                                            if (key === 'open') handleCardClick();
                                        }}
                                    >
                                        <DropdownItem
                                            key="open"
                                            startContent={<LayoutGrid size={16} />}
                                        >
                                            Abrir Tablero
                                        </DropdownItem>
                                        <DropdownItem
                                            key="edit"
                                            startContent={<Edit2 size={16} />}
                                        >
                                            Editar
                                        </DropdownItem>
                                        <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<Trash2 size={16} />}
                                        >
                                            Eliminar
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </div>

                        {tablero.descripcion && (
                            <p className="text-white/80 text-sm line-clamp-2 text-left">
                                {tablero.descripcion}
                            </p>
                        )}

                        <div className="flex gap-2 flex-wrap mt-2">
                            <Chip
                                size="sm"
                                variant="flat"
                                startContent={<List size={14} />}
                                classNames={{
                                    base: "bg-white/20 backdrop-blur-sm",
                                    content: "text-white font-semibold"
                                }}
                            >
                                {stats.listas} {stats.listas === 1 ? 'lista' : 'listas'}
                            </Chip>
                            <Chip
                                size="sm"
                                variant="flat"
                                startContent={<CheckSquare size={14} />}
                                classNames={{
                                    base: "bg-white/20 backdrop-blur-sm",
                                    content: "text-white font-semibold"
                                }}
                            >
                                {stats.tarjetas} {stats.tarjetas === 1 ? 'tarea' : 'tareas'}
                            </Chip>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Modal Editar Tablero */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="top-center" backdrop="blur" scrollBehavior="inside">
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
                                            selectedIcon={editData.icono}
                                            onSelectIcon={(icono) => setEditData({ ...editData, icono })}
                                            selectedBackground={editData.fondo}
                                            onSelectBackground={(fondo) => setEditData({ ...editData, fondo })}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleEdit}>
                                    Guardar Cambios
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default BoardCard;
