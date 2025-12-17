import { useState, useMemo } from "react";
import { Button, Spinner, useDisclosure, Card, CardBody, Progress, Divider } from "@nextui-org/react";
import { Plus, ChevronLeft, GraduationCap, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterias } from "../../hooks/useMaterias";

import PlanEstudioTable from "./components/PlanEstudioTable";
import PlanEstudioForm from "./components/PlanEstudioForm";

const PlanEstudioPage = () => {
  const navigate = useNavigate();
  const { materias, loading, agregarMateria, borrarMateria, editarMateria } = useMaterias();
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [materiaAEditar, setMateriaAEditar] = useState(null);

  // --- CÁLCULOS ESTADÍSTICOS GLOBALES ---
  const stats = useMemo(() => {
    const totalMaterias = materias.length;
    const aprobadas = materias.filter(m => m.estado === "Aprobada");
    const totalAprobadas = aprobadas.length;
    
    // Calcular porcentaje
    const porcentajeCarrera = totalMaterias > 0 ? (totalAprobadas / totalMaterias) * 100 : 0;

    // Calcular promedio (solo de materias con nota numérica válida)
    const materiasConNota = aprobadas.filter(m => m.nota && !isNaN(parseFloat(m.nota)));
    const sumaNotas = materiasConNota.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
    const promedio = materiasConNota.length > 0 ? (sumaNotas / materiasConNota.length).toFixed(2) : "-";

    return { totalMaterias, totalAprobadas, porcentajeCarrera, promedio };
  }, [materias]);

  const handleAbrirNuevo = () => {
    setMateriaAEditar(null);
    onOpen();
  };

  const handleAbrirEditar = (materia) => {
    setMateriaAEditar(materia);
    onOpen();
  };

  const handleGuardar = async (datos) => {
    if (materiaAEditar) {
      await editarMateria(materiaAEditar.id, datos);
    } else {
      await agregarMateria(datos);
    }
    onClose();
  };

  if (loading) return <div className="flex justify-center p-10 min-h-screen items-center"><Spinner size="lg" label="Cargando Plan..." color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Navegación */}
      <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="mb-4 pl-0 text-default-500">
        Volver al Dashboard
      </Button>

      {/* Header Principal con Estadísticas Integradas */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between mb-8">
        <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
                <GraduationCap className="text-white" size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Plan de Estudios</h1>
                <p className="text-default-500">Gestión académica integral</p>
            </div>
        </div>

        {/* Tarjeta de Estadísticas Rápidas */}
        <Card className="w-full lg:w-auto min-w-[300px] bg-content1 border border-default-100 shadow-sm">
            <CardBody className="flex flex-row gap-6 items-center py-3 px-5">
                <div className="flex flex-col">
                    <span className="text-tiny text-default-500 uppercase font-bold flex items-center gap-1">
                        <Trophy size={14}/> Promedio
                    </span>
                    <span className="text-2xl font-bold text-primary">{stats.promedio}</span>
                </div>
                <Divider orientation="vertical" className="h-8" />
                <div className="flex flex-col flex-1 min-w-[150px]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-tiny text-default-500 uppercase font-bold flex items-center gap-1">
                            <TrendingUp size={14}/> Avance Total
                        </span>
                        <span className="text-tiny font-bold text-default-600">{Math.round(stats.porcentajeCarrera)}%</span>
                    </div>
                    <Progress 
                        size="sm" 
                        value={stats.porcentajeCarrera} 
                        color="success" 
                        className="max-w-full"
                        aria-label="Avance total de la carrera"
                    />
                </div>
            </CardBody>
        </Card>

        <Button onPress={handleAbrirNuevo} color="primary" variant="shadow" endContent={<Plus />} size="lg" className="w-full lg:w-auto">
          Nueva Materia
        </Button>
      </div>

      {/* Tabla con Barras por Año */}
      <PlanEstudioTable 
        materias={materias} 
        onEdit={handleAbrirEditar} 
        onDelete={borrarMateria} 
      />

      <PlanEstudioForm 
        isOpen={isOpen} 
        onClose={onOpenChange} 
        onSubmit={handleGuardar}
        initialData={materiaAEditar}
      />

    </div>
  );
};

export default PlanEstudioPage;