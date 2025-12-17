import { useMemo } from "react";
import { Button, Card, CardBody, Chip, Divider, Spinner } from "@nextui-org/react";
import { 
  ChevronLeft, Lock, Unlock, AlertCircle, 
  BookOpen, GraduationCap, Clock, Award, PlayCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterias } from "../../hooks/useMaterias";
import { useElectivas } from "../../hooks/useElectivas";

const CorrelativasPage = () => {
  const navigate = useNavigate();
  const { materias, loading: loadingPlan } = useMaterias();
  const { electivas, loading: loadingElectivas } = useElectivas();

  // --- CEREBRO ANALÍTICO UNIFICADO 🧠 ---
  const { plan, electivasStats } = useMemo(() => {
    if (materias.length === 0) return { plan: { disponibles: [], bloqueadas: [] }, electivasStats: { disponibles: [], bloqueadas: [] } };

    const aprobadasIds = new Set(materias.filter(m => m.estado === "Aprobada").map(m => m.numero));
    const regularesIds = new Set(materias.filter(m => m.estado === "Regular").map(m => m.numero));

    const parseRequisitos = (str) => {
        if (!str || str === "-") return [];
        return str.split(/[^0-9]+/).filter(s => s.trim() !== "").map(Number);
    };

    const analizarLista = (listaMaterias) => {
        const disponibles = [];
        const bloqueadas = [];
        const pendientes = listaMaterias.filter(m => m.estado !== "Aprobada");

        pendientes.forEach(materia => {
            const reqRegular = parseRequisitos(materia.correlativasRegular);
            const reqAprobada = parseRequisitos(materia.correlativasAprobada);
            const faltanParaCursar = [];

            // 1. Chequeo de Regularidad
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

            // 2. Chequeo de Aprobación
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

  const getModalidadTexto = (mod) => {
      if (mod === 'A' || mod === 'Anual') return 'Anual';
      if (mod === '1C') return '1º Cuatrimestre';
      if (mod === '2C') return '2º Cuatrimestre';
      return mod || 'Cursada';
  };

  if (loadingPlan || loadingElectivas) return <div className="flex justify-center p-10 h-screen items-center"><Spinner size="lg" label="Analizando correlativas..." color="primary"/></div>;

  const SeccionCorrelativas = ({ titulo, icono: Icono, datos, tipo }) => (
    <div className="mb-12 w-full"> 
        <div className="flex items-center gap-3 mb-6 border-b border-default-200 pb-2">
            <div className={`p-2 rounded-lg ${tipo === 'plan' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                <Icono size={24} />
            </div>
            <h2 className="text-2xl font-bold">{titulo}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-success/20 rounded-md text-success"><Unlock size={18}/></div>
                    <h3 className="text-lg font-bold">Habilitadas ({datos.disponibles.length})</h3>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                    {datos.disponibles.length === 0 && (
                        <Card className="bg-default-50 border border-default-100 w-full"><CardBody className="text-center text-default-400 text-sm">No hay materias disponibles.</CardBody></Card>
                    )}
                    {datos.disponibles.map(mat => (
                        <Card 
                            key={mat.id} 
                            isPressable 
                            className="w-full border-l-[6px] border-l-success bg-gradient-to-br from-content1 to-default-50 shadow-sm hover:shadow-md transition-all"
                        >
                            <CardBody className="flex flex-row items-center p-0 w-full">
                                {/* SECCIÓN IZQUIERDA (Info) - flex-1 para ocupar TODO el espacio disponible */}
                                <div className="flex-1 p-4 flex flex-col gap-1 min-w-0"> 
                                    
                                    {/* Etiqueta Año */}
                                    <div className="mb-1">
                                        <span className="text-[10px] font-bold text-success-600 bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                            {mat.nivel ? `AÑO ${mat.nivel}` : 'ELECTIVA'}
                                        </span>
                                    </div>
                                    
                                    {/* Nombre Materia */}
                                    <h4 className="text-lg font-bold text-foreground truncate w-full">
                                        {mat.nombre}
                                    </h4>

                                    {/* Info Extra */}
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-default-500">
                                        <div className="flex items-center gap-1 bg-default-100 px-2 py-0.5 rounded-md">
                                            <Clock size={12} className="text-default-400"/>
                                            <span>{getModalidadTexto(mat.modalidad)}</span>
                                        </div>
                                        {mat.creditos && (
                                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-medium">
                                                <Award size={12}/>
                                                <span>{mat.creditos} Créditos</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECCIÓN DERECHA (Botón) - Ancho fijo o auto */}
                                <div className="p-4 border-l border-default-100/50 flex items-center justify-center bg-default-50/50 h-full self-stretch">
                                    <div className="group-hover:scale-110 transition-transform p-2 bg-success text-white rounded-full shadow-lg shadow-success/30">
                                        <PlayCircle size={24} fill="currentColor" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-danger/10 rounded-md text-danger"><Lock size={18}/></div>
                    <h3 className="text-lg font-bold">Bloqueadas ({datos.bloqueadas.length})</h3>
                </div>
                <div className="flex flex-col gap-3 w-full">
                     {datos.bloqueadas.map(mat => (
                        <Card key={mat.id} className="w-full border border-default-200 bg-content1/50 opacity-80 hover:opacity-100 transition-opacity">
                            <CardBody className="py-3 px-4 w-full">
                                <div className="flex justify-between items-start mb-2 w-full">
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-default-600 line-clamp-1">{mat.nombre}</h4>
                                        <span className="text-xs text-default-400 mt-0.5">
                                            {mat.nivel ? `Año ${mat.nivel}` : 'Electiva'}
                                        </span>
                                    </div>
                                    <Lock size={18} className="text-default-300 shrink-0"/>
                                </div>
                                <Divider className="my-2"/>
                                <div className="space-y-1.5 w-full">
                                    <p className="text-[10px] font-bold text-danger uppercase tracking-wider mb-1">Requisitos faltantes:</p>
                                    {mat.faltantes.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-default-500 bg-danger/5 p-1.5 rounded w-full">
                                            <AlertCircle size={12} className="text-danger shrink-0"/>
                                            <span className="truncate">Debes <strong>{f.condicion}</strong>: {f.nombre}</span>
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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen pb-20">
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