import { useEffect, useState } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Input, Select, SelectItem, Divider, CheckboxGroup, Checkbox
} from "@nextui-org/react";
import { Save, Target } from "lucide-react";

const ESTADOS = [
  {label: "Aprobada", value: "Aprobada", color: "success"},
  {label: "Regular", value: "Regular", color: "warning"},
  {label: "Pendiente", value: "Pendiente", color: "default"},
  {label: "Desaprobada", value: "Desaprobada", color: "danger"},
];

const ANIOS_OPCIONES = [3, 4, 5, 6];

const ElectivasForm = ({ isOpen, onClose, onSubmit, initialData, availableMetas = [] }) => {
  const defaultValues = {
    nombre: "", nivel: "3", modalidad: "1C",
    creditos: "", 
    correlativasRegular: "", correlativasAprobada: "",
    estado: "Pendiente", nota: "",
    metasIds: [] // Array para guardar los IDs de las metas a las que aplica
  };

  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            ...initialData,
            nivel: String(initialData.nivel || "3"),
            creditos: String(initialData.creditos || ""),
            nota: String(initialData.nota || ""),
            correlativasRegular: initialData.correlativasRegular || "",
            correlativasAprobada: initialData.correlativasAprobada || "",
            // Aseguramos que sea array y convertimos a strings para los checkboxes
            metasIds: (initialData.metasIds || []).map(String) 
        });
      } else {
        // Si es nueva, por defecto seleccionamos TODAS las metas (más cómodo)
        // o déjalo vacío si prefieres que el usuario elija manualmente.
        // Aquí lo dejo seleccionando todas para ahorrar clicks:
        const allMetasIds = availableMetas.map(m => String(m.id));
        setFormData({ ...defaultValues, metasIds: allMetasIds });
      }
    }
  }, [isOpen, initialData, availableMetas]); 

  const handleSubmit = () => {
    if (!formData.nombre || !formData.creditos) return; 

    const nivelInt = parseInt(formData.nivel);
    const creditosInt = parseInt(formData.creditos); 
    const notaFloat = parseFloat(formData.nota);

    const cRegular = !formData.correlativasRegular || formData.correlativasRegular.trim() === "" ? "-" : formData.correlativasRegular;
    const cAprobada = !formData.correlativasAprobada || formData.correlativasAprobada.trim() === "" ? "-" : formData.correlativasAprobada;

    const payload = {
      ...formData,
      nivel: isNaN(nivelInt) ? 3 : nivelInt,
      creditos: isNaN(creditosInt) ? 0 : creditosInt,
      nota: isNaN(notaFloat) ? "" : notaFloat,
      correlativasRegular: cRegular,
      correlativasAprobada: cAprobada,
      metasIds: formData.metasIds // Enviamos los IDs seleccionados
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
              {initialData ? "Editar Electiva" : "Nueva Electiva"}
            </ModalHeader>
            <ModalBody className="py-6">
              
              {/* FILA 1: Nombre y Año */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-9">
                  <Input 
                    autoFocus label="Nombre de la Electiva" variant="bordered" 
                    classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                    value={formData.nombre} 
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  />
                </div>
                <div className="col-span-3">
                    <Select 
                    label="Nivel" variant="bordered"
                    classNames={{trigger: "bg-white/5 border-white/10"}}
                    selectedKeys={new Set([formData.nivel])}
                    onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                    >
                    {ANIOS_OPCIONES.map((n) => <SelectItem key={String(n)} value={String(n)}>{n}° Año</SelectItem>)}
                    </Select>
                </div>
              </div>

              {/* FILA 2: Detalles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input 
                  label="Créditos" type="number" variant="bordered" placeholder="Ej: 3"
                  classNames={{inputWrapper: "bg-blue-500/10 border-blue-500/30 text-blue-400"}}
                  value={formData.creditos} 
                  onChange={(e) => setFormData({...formData, creditos: e.target.value})} 
                />

                <Select 
                  label="Modalidad" variant="bordered" 
                  classNames={{trigger: "bg-white/5 border-white/10"}}
                  selectedKeys={new Set([formData.modalidad])} 
                  onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                >
                  <SelectItem key="1C" value="1C">1° Cuat.</SelectItem>
                  <SelectItem key="2C" value="2C">2° Cuat.</SelectItem>
                  <SelectItem key="A" value="A">Anual</SelectItem>
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

              {/* SECCIÓN DE METAS (NUEVO) */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex gap-2 items-center mb-2 text-default-500 text-sm font-bold uppercase">
                    <Target size={16} />
                    <span>Impacto en Créditos</span>
                </div>
                <CheckboxGroup
                    value={formData.metasIds}
                    onValueChange={(val) => setFormData({...formData, metasIds: val})}
                    orientation="horizontal"
                    color="secondary"
                    classNames={{wrapper: "gap-4"}}
                >
                    {availableMetas.length === 0 ? (
                        <p className="text-xs text-default-400 italic">No hay metas configuradas. Ve a "Configurar Metas" primero.</p>
                    ) : (
                        availableMetas.map((meta) => (
                            <Checkbox key={meta.id} value={String(meta.id)}>
                                {meta.nombre}
                            </Checkbox>
                        ))
                    )}
                </CheckboxGroup>
              </div>

              <Divider className="my-2 bg-white/10"/>
              
              {/* FILA 3: Correlativas */}
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Regularizar" placeholder="-" variant="flat" size="sm"
                  description="IDs requeridos"
                  classNames={{inputWrapper: "bg-white/5 border-white/10"}}
                  value={formData.correlativasRegular} 
                  onChange={(e) => setFormData({...formData, correlativasRegular: e.target.value})} 
                />
                <Input 
                  label="Aprobar" placeholder="-" variant="flat" size="sm"
                  description="IDs requeridos"
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

export default ElectivasForm;