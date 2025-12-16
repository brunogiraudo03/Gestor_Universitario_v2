import { 
  Button, useDisclosure, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter 
} from "@nextui-org/react";
import { 
  ChevronLeft, Plus, CalendarRange, Eraser, Trash2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHorarios } from "../../hooks/useHorarios";
import HorariosGrid from "./components/HorariosGrid";
import HorariosForm from "./components/HorariosForm";

const HorariosPage = () => {
  const navigate = useNavigate();
  const { horarios, loading, agregarClaseCompleta, limpiarHorarios } = useHorarios();
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { isOpen: isCleanOpen, onOpen: onCleanOpen, onOpenChange: onCleanOpenChange, onClose: onCleanClose } = useDisclosure();

  const handleOpenCreate = () => {
    onOpen();
  };

  const handleSubmit = async (formData) => {
    await agregarClaseCompleta(
        { 
            materia: formData.materia, 
            comision: formData.comision, 
            color: formData.color 
        }, 
        formData.horarios
    );
    onClose();
  };

  const handleLimpiarTodo = async () => {
    await limpiarHorarios();
    onCleanClose();
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Cargando cronograma..." color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 self-start">
            <Button variant="light" isIconOnly onPress={() => navigate("/")}><ChevronLeft className="text-default-500"/></Button>
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/20">
                <CalendarRange className="text-white" size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Mis Horarios</h1>
                <p className="text-default-500">Cronograma semanal de clases.</p>
            </div>
        </div>
        
        <div className="flex gap-3">
            {horarios.length > 0 && (
                <Button color="danger" variant="flat" startContent={<Eraser size={18}/>} onPress={onCleanOpen}>
                    Limpiar Todo
                </Button>
            )}
            <Button color="primary" variant="shadow" endContent={<Plus/>} onPress={handleOpenCreate}>
                Agregar Materia
            </Button>
        </div>
      </div>

      <HorariosGrid 
        horarios={horarios} 
        // No pasamos onEdit ni onDelete para que sea solo lectura
      />

      <HorariosForm 
        isOpen={isOpen} 
        onClose={onOpenChange} 
        onSubmit={handleSubmit} 
      />

      {/* MODAL LIMPIAR TODO */}
      <Modal isOpen={isCleanOpen} onOpenChange={onCleanClose} backdrop="blur" size="sm">
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader className="text-danger flex items-center gap-2">
                        <Trash2 /> Borrar Cronograma
                    </ModalHeader>
                    <ModalBody>
                        <p>¿Estás seguro de que quieres eliminar <b>TODOS</b> los horarios?</p>
                        <p className="text-xs text-default-500">Esta acción no se puede deshacer.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>Cancelar</Button>
                        <Button color="danger" onPress={handleLimpiarTodo}>Sí, borrar todo</Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default HorariosPage;