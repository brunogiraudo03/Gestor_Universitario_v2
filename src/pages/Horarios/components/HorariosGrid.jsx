import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import { Edit2, Trash2, MapPin, Clock, Users, AlertTriangle } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const BLOCKS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00", "21:00", "22:00" , "23:00"
];

// --- COMPONENTE INDIVIDUAL DE LA TARJETA ---
const HorarioItem = ({ clase, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    // 1. CÁLCULO SEGURO DE DURACIÓN
    const startHour = parseInt(clase.inicio.split(":")[0]);
    const endHour = parseInt(clase.fin.split(":")[0]);
    
    // Si la duración es 0 o negativa (error de usuario), forzamos 1 hora para que se pueda clickear
    let duration = endHour - startHour;
    let isError = false;

    if (duration <= 0) {
        duration = 1; 
        isError = true; // Marcamos visualmente que hay un error
    }

    // Altura: (4rem por hora) + (0.5rem de gap por hora extra)
    const heightStyle = `calc(${duration * 4}rem + ${(duration - 1) * 0.5}rem)`;

    const handleEdit = () => {
        setIsOpen(false);
        onEdit(clase);
    };

    const handleDelete = () => {
        setIsOpen(false);
        onDelete(clase.id);
    };

    return (
        <Popover 
            placement="right-start" 
            offset={10} 
            isOpen={isOpen} 
            onOpenChange={setIsOpen}
        >
            <PopoverTrigger>
                <button 
                    className="absolute top-0 left-0 right-0 z-50 w-full text-left group outline-none transition-transform hover:scale-[1.02]"
                    style={{ height: heightStyle }}
                >
                    <div 
                        className={`h-full w-full rounded-lg shadow-sm border-l-4 p-2 flex flex-col justify-start overflow-hidden relative ${isError ? 'bg-danger/10 border-danger' : ''}`}
                        style={!isError ? { 
                            backgroundColor: `${clase.color || '#3b82f6'}20`, 
                            borderColor: clase.color || '#3b82f6'
                        } : {}}
                    >
                        {/* Fondo Hover */}
                        {!isError && <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: clase.color }}></div>}

                        <div className="flex justify-between items-start">
                            <span className="font-bold text-xs leading-tight text-foreground line-clamp-2">
                                {clase.materia}
                            </span>
                            {isError && <AlertTriangle size={12} className="text-danger shrink-0" />}
                        </div>
                        
                        <div className="mt-1 flex flex-wrap gap-1">
                            {clase.aula && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20 text-default-600 font-medium truncate max-w-full">
                                    {clase.aula}
                                </span>
                            )}
                            {clase.comision && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20 text-default-600 font-medium truncate">
                                    {clase.comision}
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            </PopoverTrigger>
            
            <PopoverContent>
                <div className="px-3 py-3 w-56">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: isError ? 'red' : (clase.color || '#3b82f6') }}></div>
                        <span className="text-small font-bold flex-1 leading-tight">{clase.materia}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        {isError && (
                            <div className="text-xs text-danger font-bold bg-danger/10 p-2 rounded">
                                ⚠️ Error: Hora Fin es menor o igual a Inicio. Corrígelo.
                            </div>
                        )}
                        <div className="text-tiny text-default-500 flex items-center gap-2">
                            <Clock size={14} className="text-default-400"/> 
                            {clase.inicio} - {clase.fin}
                        </div>
                        {clase.aula && (
                            <div className="text-tiny text-default-500 flex items-center gap-2">
                                <MapPin size={14} className="text-default-400"/> 
                                {clase.aula}
                            </div>
                        )}
                        {clase.comision && (
                            <div className="text-tiny text-default-500 flex items-center gap-2">
                                <Users size={14} className="text-default-400"/> 
                                Comisión: {clase.comision}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 justify-between pt-2 border-t border-default-100">
                        <Button size="sm" variant="light" onPress={handleEdit} startContent={<Edit2 size={14}/>}>
                            Editar
                        </Button>
                        <Button size="sm" color="danger" variant="light" onPress={handleDelete} isIconOnly>
                            <Trash2 size={16}/>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// --- COMPONENTE PRINCIPAL DE LA GRILLA ---
const HorariosGrid = ({ horarios, onEdit, onDelete }) => {
  
  const getClassStartingHere = (day, time) => {
    return horarios.find(h => {
        const hDay = h.dia.toLowerCase();
        const tStart = parseInt(h.inicio.split(":")[0]);
        const currentBlock = parseInt(time.split(":")[0]);
        return hDay === day.toLowerCase() && tStart === currentBlock;
    });
  };

  return (
    <div className="overflow-x-auto pb-10">
      <div className="min-w-[900px]">
        
        {/* Header Días */}
        <div className="grid grid-cols-7 gap-3 mb-2">
          <div className="p-2 text-center font-bold text-default-400 text-sm">Hora</div>
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center font-bold bg-default-100 rounded-xl dark:bg-default-50/50 uppercase text-xs tracking-wider text-default-600">
              {day}
            </div>
          ))}
        </div>

        {/* Grilla */}
        <div className="relative space-y-2">
          {BLOCKS.map((time) => (
            <div key={time} className="grid grid-cols-7 gap-3 h-16 relative"> 
              
              {/* Columna Hora */}
              <div className="flex items-center justify-center text-xs text-default-400 font-mono -mt-1">
                {time}
              </div>

              {/* Columnas Días */}
              {DAYS.map(day => {
                const claseStart = getClassStartingHere(day, time);
                
                return (
                  <div key={day+time} className="relative h-full w-full">
                    {/* Fondo de celda */}
                    <div className="absolute inset-0 border-t border-dashed border-default-200/50"></div>

                    {/* Si empieza una clase, renderizamos el Item */}
                    {claseStart && (
                        <HorarioItem 
                            clase={claseStart}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorariosGrid;