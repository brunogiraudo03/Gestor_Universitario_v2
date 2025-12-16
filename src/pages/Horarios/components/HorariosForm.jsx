import { useState, useEffect } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Divider, ScrollShadow 
} from "@nextui-org/react";
import { Plus, X, Clock, MapPin, Users } from "lucide-react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const COLORES = [
  { name: "Azul", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-500", hex: "bg-blue-500" },
  { name: "Índigo", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-500", hex: "bg-indigo-500" },
  { name: "Violeta", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-500", hex: "bg-purple-500" },
  { name: "Fucsia", bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-500", hex: "bg-fuchsia-500" },
  { name: "Rosa", bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-500", hex: "bg-pink-500" },
  { name: "Rojo", bg: "bg-red-100", text: "text-red-700", border: "border-red-500", hex: "bg-red-500" },
  { name: "Naranja", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-500", hex: "bg-orange-500" },
  { name: "Ámbar", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-500", hex: "bg-amber-500" },
  { name: "Amarillo", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-500", hex: "bg-yellow-500" },
  { name: "Lima", bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-500", hex: "bg-lime-500" },
  { name: "Verde", bg: "bg-green-100", text: "text-green-700", border: "border-green-500", hex: "bg-green-500" },
  { name: "Esmeralda", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-500", hex: "bg-emerald-500" },
  { name: "Teal", bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-500", hex: "bg-teal-500" },
  { name: "Cian", bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-500", hex: "bg-cyan-500" },
  { name: "Cielo", bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-500", hex: "bg-sky-500" },
  { name: "Gris", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-500", hex: "bg-gray-500" },
  { name: "Slate", bg: "bg-slate-200", text: "text-slate-700", border: "border-slate-500", hex: "bg-slate-500" },
  { name: "Zinc", bg: "bg-zinc-200", text: "text-zinc-700", border: "border-zinc-500", hex: "bg-zinc-500" },
];

const HorariosForm = ({ isOpen, onClose, onSubmit }) => {
  const [materia, setMateria] = useState("");
  const [comision, setComision] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES[0]);
  
  const [listaHorarios, setListaHorarios] = useState([
    { id: 1, dia: "Lunes", inicio: "", fin: "", aula: "" }
  ]);

  useEffect(() => {
    if (isOpen) {
        // Resetear formulario al abrir
        setMateria("");
        setComision("");
        setColorSeleccionado(COLORES[0]);
        setListaHorarios([{ id: Date.now(), dia: "Lunes", inicio: "", fin: "", aula: "" }]);
    }
  }, [isOpen]);

  const agregarFila = () => {
    setListaHorarios([...listaHorarios, { id: Date.now(), dia: "Lunes", inicio: "", fin: "", aula: "" }]);
  };

  const quitarFila = (id) => {
    setListaHorarios(listaHorarios.filter(h => h.id !== id));
  };

  const updateFila = (id, field, value) => {
    setListaHorarios(listaHorarios.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSubmit = () => {
    if (!materia.trim()) return;
    const horariosValidos = listaHorarios.filter(h => h.inicio);
    if (horariosValidos.length === 0) return; 

    onSubmit({
        materia,
        comision,
        color: colorSeleccionado,
        horarios: horariosValidos
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="blur" size="2xl" scrollBehavior="inside">
        <ModalContent>
            {(close) => (
                <>
                    <ModalHeader>Nueva Materia</ModalHeader>
                    <ModalBody className="py-6">
                        
                        {/* DATOS */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-8">
                                <Input 
                                    autoFocus label="Materia" placeholder="Ej: Física II" variant="bordered"
                                    value={materia} onChange={(e) => setMateria(e.target.value)}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-4">
                                <Input 
                                    label="Comisión" placeholder="Ej: 3K4" variant="bordered"
                                    value={comision} onChange={(e) => setComision(e.target.value)}
                                    startContent={<Users size={16} className="text-default-400"/>}
                                />
                            </div>
                        </div>

                        {/* COLOR */}
                        <div className="mt-2 bg-default-50 p-3 rounded-xl border border-default-100">
                            <p className="text-xs font-bold text-default-500 mb-2 uppercase">Etiqueta de Color</p>
                            <div className="flex flex-wrap gap-2">
                                {COLORES.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setColorSeleccionado(c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${c.hex} ${colorSeleccionado.name === c.name ? 'border-white ring-2 ring-primary scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <Divider className="my-2"/>

                        {/* HORARIOS */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold flex items-center gap-2">
                                    <Clock size={16} className="text-primary"/> Horarios
                                </p>
                                <Button size="sm" variant="flat" color="primary" startContent={<Plus size={16}/>} onPress={agregarFila}>
                                    Agregar Turno
                                </Button>
                            </div>

                            <ScrollShadow className="max-h-[300px] flex flex-col gap-3 pr-1">
                                {listaHorarios.map((item) => (
                                    <div key={item.id} className="flex flex-wrap md:flex-nowrap gap-2 items-start bg-default-50 p-3 rounded-xl border border-default-200">
                                        <div className="w-full md:w-1/3">
                                            <Select 
                                                label="Día" size="sm" variant="flat" 
                                                selectedKeys={item.dia ? [item.dia] : []}
                                                onChange={(e) => updateFila(item.id, 'dia', e.target.value)}
                                                disallowEmptySelection
                                            >
                                                {DIAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                            </Select>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-1/3">
                                            <Input 
                                                type="time" label="Inicio" size="sm" variant="flat"
                                                value={item.inicio} onChange={(e) => updateFila(item.id, 'inicio', e.target.value)}
                                            />
                                            <Input 
                                                type="time" label="Fin" size="sm" variant="flat"
                                                value={item.fin} onChange={(e) => updateFila(item.id, 'fin', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-1/3">
                                            <Input 
                                                placeholder="Aula" label="Aula" size="sm" variant="flat" className="flex-1"
                                                value={item.aula} onChange={(e) => updateFila(item.id, 'aula', e.target.value)}
                                                startContent={<MapPin size={14} className="text-default-400"/>}
                                            />
                                            <Button isIconOnly size="lg" color="danger" variant="light" onPress={() => quitarFila(item.id)}>
                                                <X size={18}/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </ScrollShadow>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={close}>Cancelar</Button>
                        <Button color="primary" onPress={handleSubmit} className="font-bold">Guardar Todo</Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
  );
};

export default HorariosForm;