import { useEffect, useState } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Input, Select, SelectItem, Divider 
} from "@nextui-org/react";
import { Save } from "lucide-react";

const ESTADOS = [
  {label: "Aprobada", value: "Aprobada", color: "success"},
  {label: "Regular", value: "Regular", color: "warning"},
  {label: "Pendiente", value: "Pendiente", color: "default"},
  {label: "Desaprobada", value: "Desaprobada", color: "danger"},
];

const ANIOS_OPCIONES = [1, 2, 3, 4, 5, 6];

const PlanEstudioForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const defaultValues = {
    numero: "", nombre: "", nivel: "1", modalidad: "A",
    correlativasRegular: "", correlativasAprobada: "",
    estado: "Pendiente", nota: ""
  };

  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            ...initialData,
            nivel: String(initialData.nivel || "1"),
            numero: String(initialData.numero || ""),
            nota: String(initialData.nota || ""),
            correlativasRegular: initialData.correlativasRegular || "",
            correlativasAprobada: initialData.correlativasAprobada || ""
        });
      } else {
        setFormData(defaultValues);
      }
    }
  }, [isOpen, initialData?.id]); 

  const handleSubmit = () => {
    if (!formData.nombre || !formData.numero) return;

    const nivelInt = parseInt(formData.nivel);
    const numeroInt = parseInt(formData.numero);
    const notaFloat = parseFloat(formData.nota);

    // Lógica del guion: Si está vacío o son espacios, pone "-"
    const cRegular = !formData.correlativasRegular || formData.correlativasRegular.trim() === "" 
        ? "-" 
        : formData.correlativasRegular;
    
    const cAprobada = !formData.correlativasAprobada || formData.correlativasAprobada.trim() === "" 
        ? "-" 
        : formData.correlativasAprobada;

    const payload = {
      ...formData,
      nivel: isNaN(nivelInt) ? 1 : nivelInt, 
      numero: isNaN(numeroInt) ? 0 : numeroInt,
      nota: isNaN(notaFloat) ? "" : notaFloat,
      correlativasRegular: cRegular,   // <--- Aquí aplicamos el guion
      correlativasAprobada: cAprobada  // <--- Aquí aplicamos el guion
    };

    onSubmit(payload);
  };

  return (
    <Modal 
      isOpen={isOpen} onOpenChange={onClose} 
      placement="center" backdrop="blur" size="2xl" scrollBehavior="inside"
      className="dark text-foreground"
      classNames={{
        base: "bg-[#09090b] border border-white/10 shadow-2xl",
        header: "border-b border-white/10",
        footer: "border-t border-white/10",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl">
              {initialData ? "Editar Asignatura" : "Nueva Asignatura"}
            </ModalHeader>
            <ModalBody className="py-6">
              {/* FILA 1 */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 md:col-span-2">
                  <Input 
                    autoFocus label="N°" type="number" variant="bordered" 
                    classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                    value={formData.numero} 
                    onChange={(e) => setFormData({...formData, numero: e.target.value})} 
                  />
                </div>
                <div className="col-span-9 md:col-span-10">
                  <Input 
                    label="Nombre" variant="bordered" 
                    classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                    value={formData.nombre} 
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  />
                </div>
              </div>

              {/* FILA 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select 
                  label="Año" variant="bordered"
                  classNames={{trigger: "bg-white/5 border-white/10"}}
                  selectedKeys={new Set([formData.nivel])}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                >
                  {ANIOS_OPCIONES.map((n) => <SelectItem key={String(n)} value={String(n)}>{n}°</SelectItem>)}
                </Select>

                <Select 
                  label="Modalidad" variant="bordered" 
                  classNames={{trigger: "bg-white/5 border-white/10"}}
                  selectedKeys={new Set([formData.modalidad])} 
                  onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                >
                  <SelectItem key="A" value="A">Anual</SelectItem>
                  <SelectItem key="1C" value="1C">1° Cuat.</SelectItem>
                  <SelectItem key="2C" value="2C">2° Cuat.</SelectItem>
                </Select>

                <Select 
                  label="Estado" variant="bordered" 
                  classNames={{trigger: "bg-white/5 border-white/10"}}
                  color={ESTADOS.find(e => e.value === formData.estado)?.color || "default"}
                  selectedKeys={new Set([formData.estado])} 
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  {ESTADOS.map((est) => <SelectItem key={est.value} value={est.value}>{est.label}</SelectItem>)}
                </Select>

                <Input 
                  label="Nota" placeholder="-" type="number" variant="bordered"
                  classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                  isDisabled={formData.estado !== "Aprobada"} 
                  value={formData.nota}
                  onChange={(e) => setFormData({...formData, nota: e.target.value})}
                />
              </div>

              <Divider className="my-2 bg-white/10"/>
              <p className="text-tiny text-default-500 font-bold uppercase tracking-wider">Sistema de Correlatividades</p>

              {/* FILA 3 */}
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="C. Regular" placeholder="-" variant="flat" size="sm"
                  description="IDs requeridos para cursar"
                  classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                  value={formData.correlativasRegular} 
                  onChange={(e) => setFormData({...formData, correlativasRegular: e.target.value})} 
                />
                <Input 
                  label="C. Aprobada" placeholder="-" variant="flat" size="sm"
                  description="IDs requeridos para rendir"
                  classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                  value={formData.correlativasAprobada} 
                  onChange={(e) => setFormData({...formData, correlativasAprobada: e.target.value})} 
                />
              </div>

            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={close}>Cancelar</Button>
              <Button color="primary" onPress={handleSubmit} startContent={<Save size={18}/>}>
                {initialData ? "Guardar" : "Crear"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PlanEstudioForm;