import { Card, CardBody } from "@nextui-org/react";
import { MapPin, Users } from "lucide-react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const HorariosGrid = ({ horarios }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {DIAS.map((dia) => {
        const clasesDelDia = horarios
            .filter(h => h.dia === dia)
            .sort((a,b) => a.inicio.localeCompare(b.inicio));

        const esHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase() === dia.toLowerCase();

        return (
            <div key={dia} className="flex flex-col gap-3">
                {/* CABECERA */}
                <div className={`
                    p-3 rounded-xl text-center font-bold uppercase tracking-wider text-sm border
                    ${esHoy ? "bg-primary/20 text-primary border-primary/50" : "bg-content2 text-default-500 border-transparent"}
                `}>
                    {dia}
                </div>

                {/* LISTA DE TARJETAS (SOLO VISUALIZACIÓN) */}
                <div className="flex flex-col gap-3 min-h-[150px]">
                    {clasesDelDia.length === 0 && (
                        <div className="h-full border-2 border-dashed border-default-100 rounded-xl flex items-center justify-center min-h-[100px] opacity-50">
                            <span className="text-xs text-default-300">Libre</span>
                        </div>
                    )}

                    {clasesDelDia.map((clase) => (
                        <Card 
                            key={clase.id} 
                            className={`border-l-4 shadow-sm hover:scale-[1.02] transition-transform ${clase.color?.border || "border-primary"}`}
                        >
                            <CardBody className="p-3 text-left">
                                <div className="mb-2"> 
                                    <h4 className="font-bold text-sm leading-tight">{clase.materia}</h4>
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${clase.color?.bg || "bg-default-100"} ${clase.color?.text || "text-default-700"}`}>
                                        {clase.inicio} - {clase.fin}
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                    {clase.aula && (
                                        <div className="flex items-center gap-1 text-xs text-default-400">
                                            <MapPin size={12}/>
                                            <span>{clase.aula}</span>
                                        </div>
                                    )}
                                    {clase.comision && (
                                        <div className="flex items-center gap-1 text-xs text-default-400">
                                            <Users size={12}/>
                                            <span>{clase.comision}</span>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        );
      })}
    </div>
  );
};

export default HorariosGrid;