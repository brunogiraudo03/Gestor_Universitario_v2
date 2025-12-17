import { useState, useMemo, useEffect } from "react";
import { Button, Spinner, useDisclosure, Card, CardBody, Progress } from "@nextui-org/react";
import { Plus, ChevronLeft, BookOpen, Settings2, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useElectivas } from "../../hooks/useElectivas";

import ElectivasTable from "./components/ElectivasTable";
import ElectivasForm from "./components/ElectivasForm";
import ElectivasConfigModal from "./components/ElectivasConfigModal";

const ElectivasPage = () => {
  const navigate = useNavigate();
  const { electivas, configMetas, loading, agregarElectiva, borrarElectiva, editarElectiva, guardarMetas } = useElectivas();
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure(); 
  const [configOpen, setConfigOpen] = useState(false); 
  const [materiaAEditar, setMateriaAEditar] = useState(null);

  useEffect(() => {
    if (!loading && (!configMetas.configurado || !configMetas.metas || configMetas.metas.length === 0)) {
        setConfigOpen(true);
    }
  }, [loading, configMetas]);

  // CÁLCULO DINÁMICO DE PROGRESO
  const stats = useMemo(() => {
    const aprobadas = electivas.filter(e => e.estado === "Aprobada");
    const totalCreditosGlobal = aprobadas.reduce((acc, curr) => acc + (curr.creditos || 0), 0);
    const metasSafe = Array.isArray(configMetas.metas) ? configMetas.metas : [];

    const metasStats = metasSafe.map(meta => {
        const objetivo = meta.creditos || 1;
        const creditosAcumuladosMeta = aprobadas.reduce((acc, curr) => {
            const aplicaAMeta = curr.metasIds 
                ? curr.metasIds.includes(String(meta.id)) 
                : true; 
            return aplicaAMeta ? acc + (curr.creditos || 0) : acc;
        }, 0);

        const porcentaje = Math.min((creditosAcumuladosMeta / objetivo) * 100, 100);
        return { ...meta, creditosAcumulados: creditosAcumuladosMeta, porcentaje };
    });

    return { totalCreditosGlobal, metasStats };
  }, [electivas, configMetas]);

  const handleGuardar = async (datos) => {
    if (materiaAEditar) {
      await editarElectiva(materiaAEditar.id, datos);
    } else {
      await agregarElectiva(datos);
    }
    onClose();
  };

  if (loading) return <div className="flex justify-center p-10 min-h-screen items-center"><Spinner size="lg" label="Cargando..." color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Botones superiores */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="pl-0 text-default-500">
            Volver
        </Button>
        <div className="flex gap-2">
            <Button variant="flat" size="sm" startContent={<Settings2 size={16}/>} onPress={() => setConfigOpen(true)}>
                Configurar Metas
            </Button>
            <Button onPress={() => {setMateriaAEditar(null); onOpen();}} color="primary" size="sm" endContent={<Plus size={16}/>} className="font-bold">
                Nueva
            </Button>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between mb-8">
        
        {/* Título e Icono */}
        <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20 mt-1">
                <BookOpen className="text-white" size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold mt-1">Electivas</h1>
                <p className="text-default-500 max-w-sm">
                    Gestión de créditos flexible para cumplir tus objetivos académicos.
                </p>
            </div>
        </div>

        {/* TARJETA DE PROGRESO DINÁMICA */}
        <Card className="w-full lg:w-[450px] bg-content1 border border-default-100 shadow-sm">
            <CardBody className="py-4 px-5">
                <div className="flex items-center gap-2 mb-4 border-b border-default-100 pb-2">
                    <Coins className="text-warning" size={20}/>
                    <span className="text-lg font-bold">{stats.totalCreditosGlobal} Créditos Totales</span>
                </div>

                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                    {stats.metasStats.map((meta, idx) => (
                        <div key={meta.id || idx}>
                            <div className="flex justify-between text-small mb-1">
                                <span className="text-default-500 font-medium truncate pr-2">{meta.nombre}</span>
                                <span className={meta.porcentaje === 100 ? "font-bold text-success whitespace-nowrap" : "font-bold text-primary whitespace-nowrap"}>
                                    {meta.creditosAcumulados} / {meta.creditos}
                                </span>
                            </div>
                            <Progress 
                                size="sm" 
                                value={meta.porcentaje} 
                                color={meta.porcentaje === 100 ? "success" : "primary"} 
                                className="max-w-full" 
                            />
                        </div>
                    ))}
                    {stats.metasStats.length === 0 && <p className="text-xs text-default-400">Sin metas configuradas.</p>}
                </div>
            </CardBody>
        </Card>
      </div>

      <ElectivasTable 
        electivas={electivas} 
        onEdit={(materia) => {setMateriaAEditar(materia); onOpen();}} 
        onDelete={borrarElectiva} 
      />

      <ElectivasForm 
        isOpen={isOpen} 
        onClose={onOpenChange} 
        onSubmit={handleGuardar} 
        initialData={materiaAEditar}
        availableMetas={configMetas.metas || []} 
      />

      <ElectivasConfigModal 
        isOpen={configOpen} onClose={() => setConfigOpen(false)} onSave={guardarMetas} currentConfig={configMetas}
      />

    </div>
  );
};

export default ElectivasPage;