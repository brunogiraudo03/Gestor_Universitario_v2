import { useState } from "react";
import { 
  Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Input, Select, SelectItem, useDisclosure, Chip, Spinner, Tooltip
} from "@nextui-org/react";
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  AlertCircle, BookOpen, CheckSquare, Coffee, Trash2, GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday 
} from "date-fns";
import { es } from "date-fns/locale"; // Para español
import { useTodos } from "../../hooks/useTodos";

// CONFIGURACIÓN DE TIPOS DE EVENTO
const TIPOS = {
  final: { label: "Final", color: "secondary", icon: GraduationCap },
  parcial: { label: "Parcial", color: "danger", icon: AlertCircle },
  entrega: { label: "Entrega", color: "warning", icon: BookOpen },
  tarea: { label: "Tarea", color: "primary", icon: CheckSquare },
  actividad: { label: "Actividad", color: "success", icon: Coffee },
};

const AgendaPage = () => {
  const navigate = useNavigate();
  const { todos, loading, agregarEvento, borrarTodo } = useTodos();
  
  // Estado del Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Día clickeado

  // Estado del Modal
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [nuevoEvento, setNuevoEvento] = useState({ texto: "", tipo: "tarea", hora: "" });

  // --- LÓGICA DEL CALENDARIO ---
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Generar los días a mostrar (incluyendo los grisados del mes anterior/siguiente)
  const daysInGrid = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }); // Lunes
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setNuevoEvento({ texto: "", tipo: "tarea", hora: "" }); // Reset form
    onOpen();
  };

  const handleGuardar = async () => {
    if (!nuevoEvento.texto.trim()) return;
    
    // Ajustar fecha para guardar correctamente (zona horaria local)
    // Usamos la fecha seleccionada del calendario (selectedDate)
    const fechaISO = format(selectedDate, "yyyy-MM-dd");

    await agregarEvento({
        ...nuevoEvento,
        fechaEntrega: fechaISO,
    });
    onClose();
  };

  // Filtrar eventos del día para mostrarlos en el modal
  const eventosDelDia = selectedDate 
    ? todos.filter(t => t.fechaEntrega === format(selectedDate, "yyyy-MM-dd"))
    : [];

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Cargando agenda..." color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">
      
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 self-start md:self-auto">
            <Button isIconOnly variant="light" onPress={() => navigate("/")}>
                <ChevronLeft className="text-default-500" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                </h1>
                <p className="text-default-500 text-sm">Organiza tu éxito académico</p>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-content2 p-1 rounded-lg">
            <Button isIconOnly variant="light" onPress={prevMonth}><ChevronLeft size={20}/></Button>
            <Button variant="flat" size="sm" onPress={() => setCurrentDate(new Date())}>Hoy</Button>
            <Button isIconOnly variant="light" onPress={nextMonth}><ChevronRight size={20}/></Button>
        </div>
      </div>

      {/* --- GRILLA DEL CALENDARIO --- */}
      <Card className="flex-1 min-h-[600px] bg-content1 border border-default-100 shadow-md">
        <CardBody className="p-0 h-full flex flex-col">
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 border-b border-default-200">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                    <div key={d} className="p-3 text-center text-default-400 font-semibold uppercase text-xs tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {daysInGrid().map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDay = isToday(day);
                    const formattedDay = format(day, "yyyy-MM-dd");
                    
                    // Buscar eventos para este día
                    const dayEvents = todos.filter(t => t.fechaEntrega === formattedDay);

                    return (
                        <div 
                            key={idx} 
                            onClick={() => handleDayClick(day)}
                            className={`
                                min-h-[100px] p-2 border-b border-r border-default-100 cursor-pointer transition-colors relative
                                ${!isCurrentMonth ? "bg-default-50/50 text-default-300" : "bg-transparent text-foreground"}
                                hover:bg-default-100
                            `}
                        >
                            {/* Número del día */}
                            <div className={`
                                w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1
                                ${isTodayDay ? "bg-primary text-white shadow-lg shadow-primary/40" : ""}
                            `}>
                                {format(day, "d")}
                            </div>

                            {/* Píldoras de Eventos */}
                            <div className="flex flex-col gap-1 overflow-hidden">
                                {dayEvents.map(event => {
                                    const tipoInfo = TIPOS[event.tipo] || TIPOS.tarea;
                                    return (
                                        <div 
                                            key={event.id}
                                            className={`
                                                text-[10px] px-2 py-0.5 rounded-md truncate font-medium flex items-center gap-1
                                                bg-${tipoInfo.color}/20 text-${tipoInfo.color} border border-${tipoInfo.color}/30
                                            `}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${tipoInfo.color}`} />
                                            {event.texto}
                                        </div>
                                    )
                                })}
                                {dayEvents.length > 3 && (
                                    <span className="text-[10px] text-default-400 pl-1">+ {dayEvents.length - 3} más</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </CardBody>
      </Card>

      {/* --- MODAL PARA AGREGAR/VER --- */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xl capitalize">{selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>
                <span className="text-xs text-default-400 font-normal">Gestionar eventos del día</span>
              </ModalHeader>
              
              <ModalBody>
                {/* LISTA DE EVENTOS EXISTENTES */}
                {eventosDelDia.length > 0 && (
                    <div className="mb-4 flex flex-col gap-2">
                        {eventosDelDia.map(ev => {
                             const tipoInfo = TIPOS[ev.tipo] || TIPOS.tarea;
                             const Icon = tipoInfo.icon;
                             return (
                                <div key={ev.id} className="flex items-center justify-between p-3 bg-default-50 rounded-xl border border-default-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-${tipoInfo.color}/20 text-${tipoInfo.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{ev.texto}</p>
                                            <p className="text-tiny text-default-500 capitalize">{tipoInfo.label} {ev.hora && `• ${ev.hora}hs`}</p>
                                        </div>
                                    </div>
                                    <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => borrarTodo(ev.id)}>
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                             )
                        })}
                    </div>
                )}

                {/* FORMULARIO NUEVO EVENTO */}
                <div className="bg-default-50 p-4 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-default-500 uppercase">Agregar Nuevo</p>
                    <Input 
                        autoFocus
                        placeholder="Título (Ej: Final Matemática)" 
                        variant="bordered"
                        size="sm"
                        value={nuevoEvento.texto}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, texto: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <Select 
                            placeholder="Tipo" 
                            size="sm" variant="bordered"
                            selectedKeys={[nuevoEvento.tipo]}
                            onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                        >
                            {Object.entries(TIPOS).map(([key, val]) => (
                                <SelectItem key={key} startContent={<div className={`w-2 h-2 rounded-full bg-${val.color}`}/>}>
                                    {val.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Input 
                            type="time" 
                            size="sm" variant="bordered" className="w-24"
                            value={nuevoEvento.hora}
                            onChange={(e) => setNuevoEvento({...nuevoEvento, hora: e.target.value})}
                        />
                    </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cerrar</Button>
                <Button color="primary" onPress={handleGuardar} startContent={<Plus size={18}/>}>
                  Guardar Evento
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default AgendaPage;