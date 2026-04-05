import { useState } from "react";
import {
  Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, useDisclosure, Spinner, Tabs, Tab, Popover, PopoverTrigger, PopoverContent
} from "@nextui-org/react";
import {
  ChevronLeft, ChevronRight, Plus, AlertCircle, BookOpen, CheckSquare, Coffee, Trash2, GraduationCap, BellRing, Settings2, Circle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths,
  addWeeks, subWeeks
} from "date-fns";
import { es } from "date-fns/locale";
import { useTodos } from "../../hooks/useTodos";
import { useWeeklyTodos } from "../../hooks/useWeeklyTodos";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";

// CONFIGURACIÓN DE TIPOS DE EVENTO
const TIPOS = {
  final: { label: "Final", color: "secondary", icon: GraduationCap },
  parcial: { label: "Parcial", color: "danger", icon: AlertCircle },
  entrega: { label: "Entrega", color: "warning", icon: BookOpen },
  tarea: { label: "Tarea", color: "primary", icon: CheckSquare },
  actividad: { label: "Actividad", color: "success", icon: Coffee },
};

// COMPONENTE: WEEKLY BOARD (TodoList Simple)
const WeeklyBoard = ({ currentDate }) => {
  const { weeklyTodos, agregarWeeklyTodo, borrarWeeklyTodo } = useWeeklyTodos();
  const [inputs, setInputs] = useState({});

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const handleKeyDown = async (e, dayStr) => {
    if (e.key === 'Enter' && inputs[dayStr]?.trim()) {
      e.preventDefault();
      const txt = inputs[dayStr];
      setInputs(prev => ({ ...prev, [dayStr]: "" }));
      await agregarWeeklyTodo(txt, dayStr);
    }
  };

  return (
    <Card className="flex-1 min-h-[500px] border border-default-100 shadow-md rounded-2xl bg-content1 overflow-hidden">
      <CardBody className="p-0 overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px] flex flex-col h-full">
          <div className="grid grid-cols-7 border-b border-default-200 bg-default-50">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
            <div key={d} className="p-3 text-center text-default-500 font-bold uppercase text-xs">{d}</div>
          ))}
        </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {days.map(day => {
              const formattedDay = format(day, "yyyy-MM-dd");
              const isTodayDay = isToday(day);
              const dayTodos = weeklyTodos.filter(t => t.fecha === formattedDay);

              return (
                <div key={formattedDay} className="p-3 border-r border-default-100 flex flex-col gap-3 bg-transparent relative">
                   <div className={`
                           w-8 h-8 flex items-center justify-center rounded-full text-base font-extrabold mb-1
                           ${isTodayDay ? "bg-primary text-white shadow-lg shadow-primary/40" : "text-default-700"}
                       `}>
                         {format(day, "d")}
                   </div>

                   <div className="mb-2 pb-2 border-b border-default-100/50">
                      <Input
                         size="sm"
                         variant="flat"
                         placeholder="+ Tarea..."
                         value={inputs[formattedDay] || ""}
                         onChange={(e) => setInputs(prev => ({...prev, [formattedDay]: e.target.value}))}
                         onKeyDown={(e) => handleKeyDown(e, formattedDay)}
                         classNames={{ inputWrapper: "bg-default-50 hover:bg-default-100 focus-within:bg-default-100 h-8 min-h-8 px-2" }}
                      />
                   </div>

                   <div className="flex flex-col gap-0.5 flex-1 overflow-x-hidden">
                      <AnimatePresence>
                        {dayTodos.map(todo => (
                           <motion.div
                             key={todo.id}
                             initial={{ opacity: 0, height: 0, scale: 0.9 }}
                             animate={{ opacity: 1, height: "auto", scale: 1 }}
                             exit={{ opacity: 0, height: 0, scale: 0.8, x: -10, transition: { duration: 0.2 } }}
                             className="flex items-start gap-2 group p-2 rounded-xl hover:bg-default-100/70 transition-colors cursor-pointer"
                             onClick={() => borrarWeeklyTodo(todo.id)}
                           >
                              <button className="text-default-300 group-hover:text-success transition-all mt-0.5 shrink-0 scale-90 group-hover:scale-100">
                                 <Circle size={18} />
                              </button>
                              <span className="text-sm font-medium text-default-600 leading-tight break-words pr-1">{todo.texto}</span>
                           </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  )
};

const AgendaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { todos, setTodos, loading, agregarEvento, borrarTodo, actualizarOrdenBatch } = useTodos();

  // Estado del Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Modos de Vista
  const [viewMode, setViewMode] = useState(location.state?.view || "month"); // Default a month
  const [semesterStartMonth, setSemesterStartMonth] = useState(2); // Marzo (0-indexed)
  const [semesterEndMonth, setSemesterEndMonth] = useState(6);   // Julio

  // Estado del Modal
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [nuevoEvento, setNuevoEvento] = useState({ texto: "", tipo: "tarea", hora: "" });

  // --- NAVEGACIÓN DE FECHAS ---
  const goNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
  };
  
  const goPrev = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setNuevoEvento({ texto: "", tipo: "tarea", hora: "" });
    onOpen();
  };

  const handleGuardar = async () => {
    if (!nuevoEvento.texto.trim()) return;
    const fechaISO = format(selectedDate, "yyyy-MM-dd");
    await agregarEvento({ ...nuevoEvento, fechaEntrega: fechaISO });
    onClose();
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // 1. Conseguir eventos del día de origen y destino, ordenados por su 'orden'
    const sortByOrder = (a, b) => (a.orden || 0) - (b.orden || 0);
    const sourceEvents = todos.filter(t => t.fechaEntrega === source.droppableId).sort(sortByOrder);
    const destEvents = source.droppableId === destination.droppableId 
        ? sourceEvents 
        : todos.filter(t => t.fechaEntrega === destination.droppableId).sort(sortByOrder);

    // 2. Extraer el arrastrado de su posición original
    const draggedItem = todos.find(t => t.id === draggableId);
    if (!draggedItem) return;

    sourceEvents.splice(source.index, 1);

    // 3. Insertarlo en la nueva posición con su fecha actualizada
    const updatedItem = { ...draggedItem, fechaEntrega: destination.droppableId };
    destEvents.splice(destination.index, 0, updatedItem);

    // 4. Preparar la actualización de Firebase (solo necesitamos subir los índices del destino)
    const updates = destEvents.map((t, index) => ({
       id: t.id,
       fechaEntrega: t.fechaEntrega,
       orden: index
    }));

    // 5. Aplicar Optimistic UI (Evita rebotes y saltos en la interfaz)
    setTodos(prev => {
       const prevClean = prev.filter(t => t.fechaEntrega !== source.droppableId && t.fechaEntrega !== destination.droppableId);
       const finalSource = source.droppableId === destination.droppableId ? [] : sourceEvents;
       const finalDest = destEvents.map((t, i) => ({ ...t, orden: i }));
       return [...prevClean, ...finalSource, ...finalDest];
    });

    // 6. Subir lote a Firebase
    await actualizarOrdenBatch(updates);
  };

  const handleAddToCalendar = (evento) => {
    const horaInicio = evento.hora || "09:00";
    const fechaString = `${evento.fechaEntrega}T${horaInicio}:00`;
    const fechaDate = new Date(fechaString);
    const fechaFinDate = new Date(fechaDate.getTime() + 60 * 60 * 1000);

    const formatDateLocal = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
    };

    const start = formatDateLocal(fechaDate);
    const end = formatDateLocal(fechaFinDate);
    const etiqueta = TIPOS[evento.tipo]?.label || "Evento";
    const title = encodeURIComponent(`🎓 ${evento.texto} (${etiqueta})`);
    const details = encodeURIComponent("Recordatorio desde Gestor Universitario.");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&sf=true&output=xml`;

    window.open(url, "_blank");
  };

  const renderGridForRange = (startDate, endDate, highlightCurrentMonth = true, refDate = currentDate) => {
     const days = eachDayOfInterval({ start: startDate, end: endDate });
     return (
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day) => {
             const isCurrentMonth = isSameMonth(day, refDate);
             const isTodayDay = isToday(day);
             const formattedDay = format(day, "yyyy-MM-dd");
             const dayEvents = todos.filter(t => t.fechaEntrega === formattedDay).sort((a, b) => (a.orden || 0) - (b.orden || 0));

             return (
               <Droppable droppableId={formattedDay} key={formattedDay}>
                 {(provided, snapshot) => (
                   <div
                     onClick={() => handleDayClick(day)}
                     className={`
                        min-h-[140px] p-2 border-b border-r border-default-100 cursor-pointer transition-all relative flex flex-col gap-1
                        ${!isCurrentMonth && highlightCurrentMonth ? "bg-default-50/50 text-default-300" : "bg-transparent text-foreground"}
                        ${snapshot.isDraggingOver ? "bg-primary-50/50 ring-2 ring-primary inset-0 z-10" : "hover:bg-default-100/50"}
                     `}
                   >
                     <div className={`
                         day-header w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-2
                         ${isTodayDay ? "bg-primary text-white shadow-lg shadow-primary/40" : ""}
                     `}>
                       {format(day, "d")}
                     </div>

                     <div 
                        className="flex flex-col gap-1.5 flex-1 w-full relative"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                     >
                       {dayEvents.map((event, index) => {
                         const tipoInfo = TIPOS[event.tipo] || TIPOS.tarea;
                         const Icon = tipoInfo.icon;
                         return (
                           <Draggable key={event.id} draggableId={event.id} index={index}>
                             {(providedDrag, snapshotDrag) => (
                               <div
                                 ref={providedDrag.innerRef}
                                 {...providedDrag.draggableProps}
                                 {...providedDrag.dragHandleProps}
                                 className={`
                                     px-2 py-1.5 rounded-lg flex items-center gap-1.5 overflow-hidden
                                     bg-${tipoInfo.color}/10 text-${tipoInfo.color} border border-${tipoInfo.color}/30
                                     transition-shadow select-none
                                     ${snapshotDrag.isDragging ? "shadow-2xl scale-[1.01] opacity-95 z-50 ring-2 ring-primary" : "cursor-grab hover:shadow-md hover:scale-[1.01]"}
                                 `}
                               >
                                 <Icon size={14} className="min-w-[14px]" />
                                 <span className="text-xs truncate font-bold" title={event.texto}>{event.texto}</span>
                               </div>
                             )}
                           </Draggable>
                         )
                       })}
                       {provided.placeholder}
                     </div>
                   </div>
                 )}
               </Droppable>
             );
          })}
        </div>
     );
  };

  const renderMonthView = () => {
     const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
     const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
     return renderGridForRange(start, end, true, currentDate);
  };

  const renderSemesterView = () => {
      const months = [];
      const currentYear = currentDate.getFullYear();
      let startM = semesterStartMonth;
      let endM = semesterEndMonth;
      if (endM < startM) endM += 12; // Caso donde cuatrimestre cruza el año

      for (let m = startM; m <= endM; m++) {
          const mDate = new Date(currentYear, m % 12, 1);
          // Si m > 11 sumamos un año
          if (m > 11) mDate.setFullYear(currentYear + 1);
          months.push(mDate);
      }

      return (
          <div className="flex flex-col gap-10">
             {months.map(mDate => {
                 const start = startOfWeek(startOfMonth(mDate), { weekStartsOn: 1 });
                 const end = endOfWeek(endOfMonth(mDate), { weekStartsOn: 1 });
                 return (
                     <div key={mDate.toString()} className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                           <h3 className="text-xl font-bold px-3 py-1.5 shadow-sm capitalize bg-default-100 rounded-xl border-l-4 border-l-primary">
                              {format(mDate, "MMMM yyyy", { locale: es })}
                           </h3>
                        </div>
                        <div className="border border-default-200 rounded-2xl overflow-hidden bg-content1 shadow-sm">
                            <div className="grid grid-cols-7 border-b border-default-200 bg-default-50">
                                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                                    <div key={d} className="p-3 text-center text-default-500 font-bold uppercase text-xs">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            {renderGridForRange(start, end, true, mDate)}
                        </div>
                     </div>
                 )
             })}
          </div>
      );
  };

  const eventosDelDia = selectedDate
    ? todos.filter(t => t.fechaEntrega === format(selectedDate, "yyyy-MM-dd"))
    : [];

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Cargando agenda..." color="primary" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto min-h-screen flex flex-col">

      {/* HEADER SUPERIOR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onPress={() => navigate("/")} className="shrink-0">
            <ChevronLeft className="text-default-500" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold capitalize">
              {viewMode === 'semester' ? `Cuatrimestre ${currentDate.getFullYear()}` 
               : viewMode === 'week' ? `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })}`
               : format(currentDate, "MMMM yyyy", { locale: es })}
            </h1>
            <p className="text-default-500 text-sm">Organiza tu éxito académico</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
           {/* Vista TABS */}
           <Tabs 
              selectedKey={viewMode} 
              onSelectionChange={(key) => setViewMode(key)} 
              color="primary" 
              variant="bordered"
              radius="full"
              className="w-full sm:w-auto overflow-x-auto"
           >
              <Tab key="week" title="Semanal" />
              <Tab key="month" title="Mensual" />
              <Tab key="semester" title="Cuatrimestral" />
           </Tabs>
           
           {viewMode === 'semester' && (
              <Popover placement="bottom-end">
                <PopoverTrigger>
                   <Button variant="flat" size="sm" startContent={<Settings2 size={16} />}>Meses</Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 w-64">
                   <div className="flex flex-col gap-3 w-full">
                      <p className="text-sm font-bold">Rango del Cuatrimestre</p>
                      <Select 
                          label="Mes Inicio" size="sm" 
                          selectedKeys={[semesterStartMonth.toString()]} 
                          onChange={(e) => {if(e.target.value) setSemesterStartMonth(Number(e.target.value))}}
                      >
                         {Array.from({length: 12}).map((_, i) => (
                             <SelectItem key={i.toString()} value={i.toString()} className="capitalize">
                                {format(new Date(2024, i, 1), "MMMM", { locale: es })}
                             </SelectItem>
                         ))}
                      </Select>
                      <Select 
                          label="Mes Fin" size="sm" 
                          selectedKeys={[semesterEndMonth.toString()]} 
                          onChange={(e) => {if(e.target.value) setSemesterEndMonth(Number(e.target.value))}}
                      >
                         {Array.from({length: 12}).map((_, i) => (
                             <SelectItem key={i.toString()} value={i.toString()} className="capitalize">
                                {format(new Date(2024, i, 1), "MMMM", { locale: es })}
                             </SelectItem>
                         ))}
                      </Select>
                   </div>
                </PopoverContent>
              </Popover>
           )}

          {viewMode !== 'semester' && (
              <div className="flex items-center gap-2 bg-content2 p-1 rounded-xl w-full sm:w-auto justify-center">
                <Button isIconOnly variant="light" onPress={goPrev}><ChevronLeft size={20} /></Button>
                <Button variant="flat" size="sm" onPress={() => setCurrentDate(new Date())}>Hoy</Button>
                <Button isIconOnly variant="light" onPress={goNext}><ChevronRight size={20} /></Button>
              </div>
          )}
        </div>
      </div>

      {/* --- GRILLA DEL CALENDARIO --- */}
      {viewMode === 'week' ? (
          <WeeklyBoard currentDate={currentDate} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === 'month' && (
              <Card className="flex-1 min-h-[700px] border border-default-100 shadow-md rounded-2xl bg-content1 overflow-hidden">
                <CardBody className="p-0 overflow-x-auto scrollbar-hide">
                  <div className="min-w-[800px] flex flex-col h-full">
                    <div className="grid grid-cols-7 border-b border-default-200 bg-default-50">
                      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                        <div key={d} className="p-3 text-center text-default-500 font-bold uppercase text-xs">{d}</div>
                      ))}
                    </div>
                    {renderMonthView()}
                  </div>
                </CardBody>
              </Card>
          )}

          {viewMode === 'semester' && (
              <div className="flex-1 py-2">
                  {renderSemesterView()}
              </div>
          )}
        </DragDropContext>
      )}

      {/* --- MODAL PARA AGREGAR/VER EN MENSUAL Y SEMESTRAL --- */}
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
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-lg bg-${tipoInfo.color}/20 text-${tipoInfo.color}`}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{ev.texto}</p>
                              <p className="text-tiny text-default-500 capitalize">{tipoInfo.label} {ev.hora && `• ${ev.hora}hs`}</p>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="light" color="primary" onPress={() => handleAddToCalendar(ev)} title="Recordatorio en Google Calendar">
                              <BellRing size={16} />
                            </Button>
                            <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => borrarTodo(ev.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
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
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, texto: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Select
                      placeholder="Tipo"
                      size="sm" variant="bordered"
                      selectedKeys={[nuevoEvento.tipo]}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value })}
                    >
                      {Object.entries(TIPOS).map(([key, val]) => (
                        <SelectItem key={key} startContent={<div className={`w-2 h-2 rounded-full bg-${val.color}`} />}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      type="time"
                      size="sm" variant="bordered" className="w-24"
                      value={nuevoEvento.hora}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })}
                    />
                  </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cerrar</Button>
                <Button color="primary" onPress={handleGuardar} startContent={<Plus size={18} />}>
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