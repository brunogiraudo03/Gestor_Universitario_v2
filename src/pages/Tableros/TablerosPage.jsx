import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure, Skeleton } from "@nextui-org/react";
import { Plus, LayoutGrid } from "lucide-react";
import { useTableros } from "../../hooks/useTableros";
import BoardCard from "./components/BoardCard";
import BoardBackgroundPicker from "./components/BoardBackgroundPicker";
import { getDefaultBackground } from "../../utils/boardBackgrounds";
import { toast } from "sonner";

const TablerosPage = () => {
    const navigate = useNavigate();
    const { tableros, loading, agregarTablero } = useTableros();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [nuevoTablero, setNuevoTablero] = useState({
        nombre: "",
        descripcion: "",
        fondo: getDefaultBackground(),
        icono: "📋"
    });

    const handleCrearTablero = async () => {
        if (!nuevoTablero.nombre.trim()) {
            toast.error("El tablero debe tener un nombre");
            return;
        }

        try {
            const id = await agregarTablero(nuevoTablero);
            toast.success("¡Tablero creado!");
            setNuevoTablero({
                nombre: "",
                descripcion: "",
                fondo: getDefaultBackground(),
                icono: "📋"
            });
            onOpenChange(false);
            navigate(`/tableros/${id}`);
        } catch (error) {
            console.error("Error al crear tablero:", error);
            toast.error("Error al crear el tablero");
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-96 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="mb-8 mt-2 md:mt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <LayoutGrid className="text-primary" size={32} />
                            Mis Tableros
                        </h1>
                        <p className="text-default-500 mt-1">
                            Organiza tus proyectos y tareas de forma visual
                        </p>
                    </div>
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<Plus size={20} />}
                        onPress={onOpen}
                        className="font-semibold"
                    >
                        Nuevo Tablero
                    </Button>
                </div>
            </header>

            {/* Grid de Tableros */}
            {tableros.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-default-100 p-8 rounded-full mb-6">
                        <LayoutGrid size={64} className="text-default-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No tienes tableros aún</h3>
                    <p className="text-default-500 mb-6 text-center max-w-md">
                        Crea tu primer tablero para empezar a organizar tus proyectos y tareas de forma visual
                    </p>
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<Plus size={20} />}
                        onPress={onOpen}
                    >
                        Crear Primer Tablero
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tableros.map((tablero) => (
                        <BoardCard key={tablero.id} tablero={tablero} />
                    ))}
                </div>
            )}

            {/* Modal Crear Tablero */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" backdrop="blur" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Crear Nuevo Tablero</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Dale un nombre, un icono y personaliza el fondo
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Nombre del Tablero"
                                        placeholder="Ej: Proyecto Universidad, Tareas Personales..."
                                        value={nuevoTablero.nombre}
                                        onChange={(e) => setNuevoTablero({ ...nuevoTablero, nombre: e.target.value })}
                                        size="lg"
                                        variant="bordered"
                                        autoFocus
                                    />

                                    <Textarea
                                        label="Descripción (opcional)"
                                        placeholder="Describe de qué trata este tablero..."
                                        value={nuevoTablero.descripcion}
                                        onChange={(e) => setNuevoTablero({ ...nuevoTablero, descripcion: e.target.value })}
                                        variant="bordered"
                                        minRows={3}
                                    />

                                    <div>
                                        <p className="text-sm font-semibold mb-3">Personalización</p>
                                        <BoardBackgroundPicker
                                            selectedBackground={nuevoTablero.fondo}
                                            onSelectBackground={(fondo) => setNuevoTablero({ ...nuevoTablero, fondo })}
                                            selectedIcon={nuevoTablero.icono}
                                            onSelectIcon={(icono) => setNuevoTablero({ ...nuevoTablero, icono })}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleCrearTablero}>
                                    Crear Tablero
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default TablerosPage;
