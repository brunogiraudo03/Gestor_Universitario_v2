import { useState, useEffect } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, ScrollShadow
} from "@nextui-org/react";
import { Check } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Paleta de 20 colores modernos (Tailwind palette)
const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", 
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", 
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", 
  "#ec4899", "#f43f5e", "#71717a", "#78716c", "#0f172a"
];

const HorariosForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    materia: "",
    comision: "", 
    dia: "Lunes",
    inicio: "08:00",
    fin: "10:00",
    aula: "",
    color: "#3b82f6" 
  });

  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    } else {
        setFormData({ 
            materia: "", 
            comision: "",
            dia: "Lunes", 
            inicio: "08:00", 
            fin: "10:00", 
            aula: "",
            color: COLORS[10] 
        });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!formData.materia) return;
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
                {initialData ? "Editar Clase" : "Agregar Clase"}
                <span className="text-sm font-normal text-default-400">Configura los detalles de tu cursada</span>
            </ModalHeader>
            <ModalBody>
              <div className="flex gap-4">
                  <Input 
                    autoFocus
                    label="Materia" 
                    placeholder="Ej: Análisis Matemático I" 
                    value={formData.materia}
                    onValueChange={(v) => setFormData({...formData, materia: v})}
                    className="flex-1"
                  />
                  <Input 
                    label="Comisión" 
                    placeholder="Ej: 1K4" 
                    value={formData.comision}
                    onValueChange={(v) => setFormData({...formData, comision: v})}
                    className="w-1/3"
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select 
                    label="Día" 
                    selectedKeys={[formData.dia]}
                    onChange={(e) => setFormData({...formData, dia: e.target.value})}
                >
                    {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                </Select>
                <Input 
                    label="Aula / Edificio" 
                    placeholder="Ej: Aula 204"
                    value={formData.aula}
                    onValueChange={(v) => setFormData({...formData, aula: v})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                    type="time" 
                    label="Inicio" 
                    value={formData.inicio}
                    onValueChange={(v) => setFormData({...formData, inicio: v})}
                />
                <Input 
                    type="time" 
                    label="Fin" 
                    value={formData.fin}
                    onValueChange={(v) => setFormData({...formData, fin: v})}
                />
              </div>

              <div>
                  <label className="text-small font-medium text-default-700 block mb-2">Color de etiqueta</label>
                  <ScrollShadow orientation="horizontal" className="pb-2">
                      <div className="flex gap-2">
                          {COLORS.map((c) => (
                              <button
                                key={c}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.color === c ? 'border-default-foreground scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setFormData({ ...formData, color: c })}
                              >
                                  {formData.color === c && <Check size={14} className="text-white drop-shadow-md"/>}
                              </button>
                          ))}
                      </div>
                  </ScrollShadow>
              </div>

            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>Cancelar</Button>
              <Button color="primary" onPress={handleSubmit} className="font-bold">
                {initialData ? "Guardar Cambios" : "Agregar Clase"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default HorariosForm;