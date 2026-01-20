import { useState } from "react";
import { Card, CardBody, Button, Input } from "@nextui-org/react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

const AddListButton = ({ tableroId, onAdd }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [nombre, setNombre] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!nombre.trim()) {
            toast.error("El nombre no puede estar vacío");
            return;
        }

        setIsLoading(true);
        try {
            await onAdd({ nombre: nombre.trim() });
            setNombre("");
            setIsAdding(false);
            toast.success("Lista creada");
        } catch (error) {
            console.error("Error al crear lista:", error);
            toast.error("Error al crear la lista");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setNombre("");
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <div className="flex-shrink-0 w-80">
                <Button
                    variant="flat"
                    startContent={<Plus size={18} />}
                    onPress={() => setIsAdding(true)}
                    className="w-full h-12 bg-white/50 dark:bg-default-100/50 hover:bg-white dark:hover:bg-default-100 border-2 border-dashed border-default-300 hover:border-primary transition-colors font-semibold"
                >
                    Agregar Lista
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 w-80">
            <Card className="bg-white dark:bg-default-50 border-2 border-primary shadow-lg">
                <CardBody className="p-3 space-y-2">
                    <Input
                        placeholder="Nombre de la lista..."
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading) handleAdd();
                            if (e.key === 'Escape') handleCancel();
                        }}
                        autoFocus
                        variant="bordered"
                        disabled={isLoading}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            color="primary"
                            onPress={handleAdd}
                            isLoading={isLoading}
                            className="font-semibold"
                        >
                            Agregar
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={handleCancel}
                            isDisabled={isLoading}
                        >
                            <X size={16} />
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AddListButton;
