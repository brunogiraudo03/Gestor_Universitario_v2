import { useMemo } from "react";
import { Button, Card, CardBody, Chip, Divider, Spinner } from "@nextui-org/react";
import { ChevronLeft, Lock, Unlock, AlertCircle, CheckCircle2, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas"; // 1. Importamos Electivas

const CorrelativasPage = () => {
  const navigate = useNavigate();
  const { materias, loading: loadingPlan } = useMaterias();
  const { electivas, loading: loadingElectivas } = useElectivas(); // 2. Traemos las electivas

  // --- CEREBRO ANALÍTICO UNIFICADO 🧠 ---
  const { plan, electivasStats } = useMemo(() => {
    if (materias.length === 0) return { plan: { disponibles: [], bloqueadas: [] }, electivasStats: { disponibles: [], bloqueadas: [] } };

    // Sets de IDs aprobados/regulares del PLAN (Las electivas dependen de esto)
    const aprobadasIds = new Set(materias.filter(m => m.estado === "Aprobada").map(m => m.numero));
    const regularesIds = new Set(materias.filter(m => m.estado === "Regular").map(m => m.numero));

    // Función auxiliar para parsear requisitos "1-2" o "1, 2"
    const parseRequisitos = (str) => {
        if (!str || str === "-") return [];
        return str.split(/[^0-9]+/).filter(s => s.trim() !== "").map(Number);
    };

    // Función que analiza una lista de materias (sean del plan o electivas)
    const analizarLista = (listaMaterias) => {
        const disponibles = [];
        const bloqueadas = [];
        
        // Filtramos solo las que NO están aprobadas (Pendientes/Regulares/Desaprobadas)
        const pendientes = listaMaterias.filter(m => m.estado !== "Aprobada");

        pendientes.forEach(materia => {
            const reqRegular = parseRequisitos(materia.correlativasRegular);
            const reqAprobada = parseRequisitos(materia.correlativasAprobada);
            const faltanParaCursar = [];

            // 1. Chequeo de Regularidad (Pide tener Regular o Aprobada una materia del PLAN)
            reqRegular.forEach(reqId => {
                if (!regularesIds.has(reqId) && !aprobadasIds.has(reqId)) {
                    const matFaltante = materias.find(m => m.numero === reqId);
                    faltanParaCursar.push({ 
                        id: reqId, 
                        nombre: matFaltante ? matFaltante.nombre : `Materia #${reqId}`, 
                        condicion: "Regularizar" 
                    });
                }
            });

            // 2. Chequeo de Aprobación (Pide tener Aprobada una materia del PLAN)
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

        // Ordenamos: Plan por nivel, Electivas por nombre
        if (disponibles.length > 0 && disponibles[0].nivel) {
             disponibles.sort((a,b) => a.nivel - b.nivel);
             bloqueadas.sort((a,b) => a.nivel - b.nivel);
        } else {
             disponibles.sort((a,b) => a.nombre.localeCompare(b.nombre));
             bloqueadas.sort((a,b) => a.nombre.localeCompare(b.nombre));
        }

        return { disponibles, bloqueadas };
    };

    return {
        plan: analizarLista(materias),
        electivasStats: analizarLista(electivas)
    };

  }, [materias, electivas]);

  if (loadingPlan || loadingElectivas) return <div className="flex justify-center p-10 h-screen items-center"><Spinner size="lg" label="Analizando correlativas..." color="primary"/></div>;

  // Componente interno para renderizar cada sección (para no repetir JSX)
  const SeccionCorrelativas = ({ titulo, icono: Icono, datos, tipo }) => (
    <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 border-b border-default-200 pb-2">
            <div className={`p-2 rounded-lg ${tipo === 'plan' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                <Icono size={24} />
            </div>
            <h2 className="text-2xl font-bold">{titulo}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* DISPONIBLES */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-success/20 rounded-md text-success"><Unlock size={18}/></div>
                    <h3 className="text-lg font-bold">Habilitadas ({datos.disponibles.length})</h3>
                </div>
                <div className="space-y-3">
                    {datos.disponibles.length === 0 && (
                        <Card className="bg-default-50 border border-default-100"><CardBody className="text-center text-default-400 text-sm">No hay materias disponibles.</CardBody></Card>
                    )}
                    {datos.disponibles.map(mat => (
                        <Card key={mat.id} className="border-l-4 border-l-success bg-content1 shadow-sm hover:shadow-md transition-shadow">
                            <CardBody className="flex justify-between items-center py-3">
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <Chip size="sm" color="success" variant="flat" className="h-5 text-xs font-bold">
                                            {mat.nivel ? `AÑO ${mat.nivel}` : 'ELECTIVA'}
                                        </Chip>
                                        <h4 className="font-bold text-base">{mat.nombre}</h4>
                                    </div>
                                    <p className="text-xs text-default-500">
                                        Modalidad: {mat.modalidad} {mat.creditos && `• ${mat.creditos} Créditos`}
                                    </p>
                                </div>
                                <Button size="sm" color="success" variant="light" isIconOnly>
                                    <CheckCircle2 size={20}/>
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* BLOQUEADAS */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-danger/10 rounded-md text-danger"><Lock size={18}/></div>
                    <h3 className="text-lg font-bold">Bloqueadas ({datos.bloqueadas.length})</h3>
                </div>
                <div className="space-y-3">
                     {datos.bloqueadas.map(mat => (
                        <Card key={mat.id} className="border border-default-200 bg-content1/50 opacity-80 hover:opacity-100 transition-opacity">
                            <CardBody className="py-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-default-600">{mat.nombre}</h4>
                                        <span className="text-xs text-default-400">
                                            {mat.nivel ? `Año ${mat.nivel}` : 'Electiva'}
                                        </span>
                                    </div>
                                    <Lock size={16} className="text-default-300"/>
                                </div>
                                <Divider className="my-2"/>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-danger uppercase tracking-wider mb-1">Requisitos faltantes:</p>
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

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="mb-4 pl-0 text-default-500">
        Volver al Dashboard
      </Button>

      <header className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Mapa de Correlatividades
        </h1>
        <p className="text-default-500">
            Descubre qué materias puedes cursar según tu avance actual.
        </p>
      </header>

      {/* SECCIÓN 1: PLAN DE ESTUDIO */}
      <SeccionCorrelativas 
        titulo="Plan de Estudio Obligatorio" 
        icono={BookOpen} 
        datos={plan} 
        tipo="plan" 
      />

      {/* SECCIÓN 2: ELECTIVAS */}
      <SeccionCorrelativas 
        titulo="Asignaturas Electivas" 
        icono={GraduationCap} 
        datos={electivasStats} 
        tipo="electiva" 
      />

    </div>
  );
};

export default CorrelativasPage;