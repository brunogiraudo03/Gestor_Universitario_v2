import { useEffect, useState } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input 
} from "@nextui-org/react";
import { Plus, Trash2, Target } from "lucide-react";

const ElectivasConfigModal = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [metas, setMetas] = useState([
    { id: Date.now(), nombre: "Título Final", creditos: 20 }
  ]);

  useEffect(() => {
    if (currentConfig && currentConfig.metas && Array.isArray(currentConfig.metas)) {
        setMetas(currentConfig.metas);
    }
  }, [currentConfig]);

  const addMeta = () => {
    setMetas([...metas, { id: Date.now(), nombre: "", creditos: 0 }]);
  };

  const removeMeta = (index) => {
    if (metas.length === 1) return; 
    const nuevas = metas.filter((_, i) => i !== index);
    setMetas(nuevas);
  };

  const updateMeta = (index, field, value) => {
    const nuevas = [...metas];
    nuevas[index] = { ...nuevas[index], [field]: value };
    setMetas(nuevas);
  };

  const handleSave = () => {
    const metasLimpias = metas.map(m => ({
        ...m,
        creditos: parseInt(m.creditos) || 0
    }));
    onSave({ metas: metasLimpias });
    onClose();
  }

  return (
    <Modal 
        isOpen={isOpen} onClose={onClose}
        isDismissable={false} 
        hideCloseButton={!currentConfig?.configurado}
        backdrop="blur"
        className="dark text-foreground"
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
            <Target className="text-primary"/> Configurar Metas
        </ModalHeader>
        <ModalBody>
            <p className="text-sm text-default-500 mb-2">
                Agrega tantos títulos o metas intermedias como necesites.
            </p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {metas.map((meta, index) => (
                    <div key={meta.id || index} className="flex gap-2 items-end bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="flex-1">
                            <Input 
                                label={`Meta ${index + 1}`} 
                                placeholder="Ej: Analista"
                                value={meta.nombre} 
                                onChange={(e) => updateMeta(index, 'nombre', e.target.value)} 
                                variant="bordered" size="sm"
                            />
                        </div>
                        <div className="w-24">
                            <Input 
                                label="Créditos" 
                                type="number" 
                                value={meta.creditos} 
                                onChange={(e) => updateMeta(index, 'creditos', e.target.value)} 
                                variant="bordered" size="sm"
                            />
                        </div>
                        <Button 
                            isIconOnly color="danger" variant="light" 
                            onPress={() => removeMeta(index)}
                            isDisabled={metas.length === 1}
                        >
                            <Trash2 size={18}/>
                        </Button>
                    </div>
                ))}
            </div>

            <Button 
                className="w-full border-dashed border-default-400 text-default-400" 
                variant="bordered"
                startContent={<Plus size={18}/>}
                onPress={addMeta}
            >
                Agregar otra meta
            </Button>

        </ModalBody>
        <ModalFooter>
            <Button color="primary" onPress={handleSave} fullWidth className="font-bold shadow-lg shadow-primary/20">
                Guardar Configuración
            </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ElectivasConfigModal;