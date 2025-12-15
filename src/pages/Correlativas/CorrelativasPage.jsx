import { useMemo } from "react";
import { Button, Card, CardBody, Chip, Divider, Spinner } from "@nextui-org/react";
import { ChevronLeft, Lock, Unlock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterias } from "../../hooks/useMaterias";

const CorrelativasPage = () => {
  const navigate = useNavigate();
  const { materias, loading } = useMaterias();

  // --- EL CEREBRO DE LAS CORRELATIVAS ---
  const analisis = useMemo(() => {
    if (materias.length === 0) return { disponibles: [], bloqueadas: [] };

    const aprobadasIds = new Set(materias.filter(m => m.estado === "Aprobada").map(m => m.numero));
    const regularesIds = new Set(materias.filter(m => m.estado === "Regular").map(m => m.numero));

    // Función auxiliar para parsear los strings "1-2" o "1, 2"
    const parseRequisitos = (str) => {
        if (!str || str === "-") return [];
        // Divide por cualquier cosa que no sea un número (guiones, comas, espacios)
        return str.split(/[^0-9]+/).filter(s => s.trim() !== "").map(Number);
    };

    const disponibles = [];
    const bloqueadas = [];

    // Solo analizamos materias que NO están aprobadas
    const pendientes = materias.filter(m => m.estado !== "Aprobada");

    pendientes.forEach(materia => {
        const reqRegular = parseRequisitos(materia.correlativasRegular);
        const reqAprobada = parseRequisitos(materia.correlativasAprobada);

        const faltanParaCursar = [];

        // 1. Chequear Requisitos de Regularidad (Necesito tenerlas Regular o Aprobada)
        reqRegular.forEach(reqId => {
            if (!regularesIds.has(reqId) && !aprobadasIds.has(reqId)) {
                // Buscamos el nombre de la materia faltante
                const matFaltante = materias.find(m => m.numero === reqId);
                faltanParaCursar.push({ 
                    id: reqId, 
                    nombre: matFaltante ? matFaltante.nombre : `Materia #${reqId}`, 
                    condicion: "Regularizar" 
                });
            }
        });

        // 2. Chequear Requisitos de Aprobación (Necesito tenerlas Aprobadas)
        reqAprobada.forEach(reqId => {
            if (!aprobadasIds.has(reqId)) {
                const matFaltante = materias.find(m => m.numero === reqId);
                faltanParaCursar.push({ 
                    id: reqId, 
                    nombre: matFaltante ? matFaltante.nombre : `Materia #${reqId}`, 
                    condicion: "Aprobar" 
                });
            }
        });

        if (faltanParaCursar.length === 0) {
            disponibles.push(materia);
        } else {
            bloqueadas.push({ ...materia, faltantes: faltanParaCursar });
        }
    });

    // Ordenamos por año
    disponibles.sort((a,b) => a.nivel - b.nivel);
    bloqueadas.sort((a,b) => a.nivel - b.nivel);

    return { disponibles, bloqueadas };
  }, [materias]);

  if (loading) return <div className="flex justify-center p-10 h-screen items-center"><Spinner size="lg" label="Analizando correlativas..." color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="mb-4 pl-0 text-default-500">
        Volver al Dashboard
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Mapa de Correlatividades
        </h1>
        <p className="text-default-500">
            Análisis inteligente de tu próximo semestre.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: DISPONIBLES (VERDE) */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-success/20 rounded-lg text-success"><Unlock size={20}/></div>
                <h2 className="text-xl font-bold">Habilitadas para Cursar ({analisis.disponibles.length})</h2>
            </div>
            
            <div className="space-y-3">
                {analisis.disponibles.length === 0 && (
                    <Card className="bg-default-50 border border-default-100"><CardBody className="text-center text-default-400">No hay materias disponibles por ahora.</CardBody></Card>
                )}
                {analisis.disponibles.map(mat => (
                    <Card key={mat.id} className="border-l-4 border-l-success bg-content1 shadow-sm">
                        <CardBody className="flex justify-between items-center py-3">
                            <div>
                                <div className="flex gap-2 items-center mb-1">
                                    <Chip size="sm" color="success" variant="flat" className="h-5 text-xs">AÑO {mat.nivel}</Chip>
                                    <h3 className="font-bold">{mat.nombre}</h3>
                                </div>
                                <p className="text-xs text-default-500">
                                    Modalidad: {mat.modalidad} • N° {mat.numero}
                                </p>
                            </div>
                            <Button size="sm" color="success" variant="light" startContent={<CheckCircle2 size={16}/>}>
                                Inscribir
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>

        {/* COLUMNA 2: BLOQUEADAS (ROJO/GRIS) */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-danger/10 rounded-lg text-danger"><Lock size={20}/></div>
                <h2 className="text-xl font-bold">Bloqueadas ({analisis.bloqueadas.length})</h2>
            </div>

            <div className="space-y-3">
                 {analisis.bloqueadas.map(mat => (
                    <Card key={mat.id} className="border border-default-200 bg-content1/50 opacity-80 hover:opacity-100 transition-opacity">
                        <CardBody className="py-3">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-default-600">{mat.nombre}</h3>
                                    <span className="text-xs text-default-400">Año {mat.nivel}</span>
                                </div>
                                <Lock size={16} className="text-default-300"/>
                            </div>
                            
                            <Divider className="my-2"/>
                            
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-danger uppercase mb-1">Requisitos faltantes:</p>
                                {mat.faltantes.map((f, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-default-500">
                                        <AlertCircle size={12} className="text-danger"/>
                                        <span>Debes <strong>{f.condicion}</strong>: {f.nombre}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default CorrelativasPage;