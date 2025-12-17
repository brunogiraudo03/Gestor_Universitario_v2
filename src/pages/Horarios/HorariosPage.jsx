import { useState } from "react";
import { Button, useDisclosure, Spinner } from "@nextui-org/react";
import { Plus, CalendarClock } from "lucide-react";
import { useHorarios } from "../../hooks/useHorarios";
import HorariosGrid from "./components/HorariosGrid";
import HorariosForm from "./components/HorariosForm";

const HorariosPage = () => {
  const { horarios, loading, agregarHorario, borrarHorario, editarHorario } = useHorarios();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  
  // Estado para saber qué estamos editando (null = nuevo)
  const [editingItem, setEditingItem] = useState(null);

  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setEditingItem(null);
    onOpen();
  };

  // Abrir modal para EDITAR (viene del Grid)
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    onOpen();
  };

  // Guardar (crear o editar según corresponda)
  const handleSave = async (data) => {
    if (editingItem) {
        await editarHorario(editingItem.id, data);
    } else {
        await agregarHorario(data);
    }
    onClose();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que quieres borrar esta clase del horario?")) {
        await borrarHorario(id);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
            <div className="p-4 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/20">
                <CalendarClock className="text-white" size={32} />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Horarios de Cursada</h1>
                <p className="text-default-500">Organiza tu semana</p>
            </div>
        </div>
        
        <Button onPress={handleOpenCreate} color="primary" endContent={<Plus />}>
          Agregar Clase
        </Button>
      </div>

      {/* GRID */}
      <HorariosGrid 
        horarios={horarios} 
        onEdit={handleOpenEdit} 
        onDelete={handleDelete} 
      />

      {/* MODAL (FORM) */}
      <HorariosForm 
        isOpen={isOpen} 
        onClose={onOpenChange} 
        onSubmit={handleSave}
        initialData={editingItem} 
      />
    </div>
  );
};

export default HorariosPage;