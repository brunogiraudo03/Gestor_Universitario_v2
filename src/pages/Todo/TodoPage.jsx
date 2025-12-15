import { useState } from "react";
import { 
  Button, Card, CardBody, Input, Checkbox, ScrollShadow, Divider, Spinner 
} from "@nextui-org/react";
import { Plus, Trash2, ChevronLeft, CheckSquare, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTodos } from "../../hooks/useTodos"; // Usamos el hook que te pasé antes

const TodoPage = () => {
  const navigate = useNavigate();
  const { todos, loading, agregarTodo, toggleTodo, borrarTodo } = useTodos();
  const [nuevoTexto, setNuevoTexto] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;
    await agregarTodo(nuevoTexto);
    setNuevoTexto("");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" color="primary"/></div>;

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto min-h-screen">
      <Button variant="light" startContent={<ChevronLeft/>} onPress={() => navigate("/")} className="mb-4 pl-0 text-default-500">
        Volver al Dashboard
      </Button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-2xl shadow-lg shadow-green-500/20">
            <CheckSquare className="text-white" size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Mis Tareas</h1>
            <p className="text-default-500">Organiza tus entregas y objetivos académicos.</p>
        </div>
      </div>

      <Card className="bg-content1 border border-default-100 shadow-md">
        <CardBody className="p-6">
            {/* Input de Nueva Tarea */}
            <form onSubmit={handleAdd} className="flex gap-3 mb-6">
                <Input 
                    size="lg" 
                    variant="bordered" 
                    placeholder="Escribe una nueva tarea (ej: Entregar TP de Sistemas)..." 
                    value={nuevoTexto} 
                    onChange={(e) => setNuevoTexto(e.target.value)}
                    startContent={<Plus className="text-default-400"/>}
                />
                <Button isIconOnly color="primary" size="lg" type="submit" variant="shadow" className="font-bold">
                    <Plus size={24}/>
                </Button>
            </form>

            <Divider className="my-4"/>

            {/* Lista de Tareas */}
            <div className="flex flex-col gap-3">
                {todos.length === 0 && (
                    <div className="text-center py-10 text-default-400 flex flex-col items-center">
                        <CalendarDays size={48} className="mb-2 opacity-50"/>
                        <p>No tienes tareas pendientes. ¡A disfrutar! 🎉</p>
                    </div>
                )}
                
                {todos.map((todo) => (
                    <div 
                        key={todo.id} 
                        className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                            todo.completado 
                            ? "bg-default-50 border-transparent opacity-60" 
                            : "bg-content2 border-default-200 hover:border-primary/50"
                        }`}
                    >
                        <Checkbox 
                            size="lg" 
                            isSelected={todo.completado} 
                            onValueChange={() => toggleTodo(todo)}
                            classNames={{
                                label: `w-full ${todo.completado ? "line-through text-default-400" : "font-medium"}`
                            }}
                        >
                            {todo.texto}
                        </Checkbox>
                        
                        <Button 
                            isIconOnly color="danger" variant="light" 
                            onPress={() => borrarTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={20}/>
                        </Button>
                    </div>
                ))}
            </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TodoPage;