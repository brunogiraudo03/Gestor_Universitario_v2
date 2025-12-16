import { useState } from "react";
import { 
  Card, CardBody, CardHeader, Input, Button, DatePicker, Select, SelectItem 
} from "@nextui-org/react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import useUserStore from "../../stores/useUserStore";
import { Rocket, GraduationCap, Calendar, University } from "lucide-react";
import { parseDate } from "@internationalized/date"; // Utilidad de NextUI para fechas
import { toast } from "sonner";

const OnboardingPage = ({ onComplete }) => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [carrera, setCarrera] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(null);

  const handleSave = async () => {
    if (!carrera || !universidad || !fechaNacimiento) {
        toast.success("Por favor completa todos los campos para continuar.");
        return;
    }

    setLoading(true);
    try {
        // Guardamos los datos extendidos en Firestore
        // Convertimos la fecha de objeto CalendarDate a String (YYYY-MM-DD)
        const fechaStr = fechaNacimiento.toString();

        await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            carrera: carrera,
            universidad: universidad,
            fechaNacimiento: fechaStr,
            createdAt: new Date().toISOString()
        }, { merge: true }); // Merge para no borrar datos si ya existen

        // Avisamos a App.jsx que terminamos
        onComplete();
        
    } catch (error) {
        console.error("Error guardando datos:", error);
        toast.error("Hubo un error al guardar tus datos.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[150px] pointer-events-none" />

        <Card className="w-full max-w-md bg-background/80 backdrop-blur-md border border-white/10 shadow-2xl">
            <CardHeader className="flex flex-col gap-2 pt-8 px-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/30">
                    <Rocket className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">¡Casi estamos listos!</h1>
                <p className="text-default-400 text-sm">
                    Hola <span className="text-primary font-semibold">{user?.displayName?.split(" ")[0]}</span>, necesitamos unos datos para configurar tu espacio académico.
                </p>
            </CardHeader>

            <CardBody className="px-8 pb-8 gap-6">
                
                {/* 1. Carrera */}
                <Input 
                    label="¿Qué estás estudiando?" 
                    placeholder="Ej: Ingeniería en Sistemas"
                    variant="bordered"
                    startContent={<GraduationCap className="text-default-400" size={18}/>}
                    value={carrera}
                    onValueChange={setCarrera}
                />

                {/* 2. Universidad */}
                <Input 
                    label="Universidad / Institución" 
                    placeholder="Ej: UTN, UBA, Siglo 21"
                    variant="bordered"
                    startContent={<University className="text-default-400" size={18}/>}
                    value={universidad}
                    onValueChange={setUniversidad}
                />

                {/* 3. Fecha Nacimiento */}
                <DatePicker 
                    label="Fecha de Nacimiento"
                    variant="bordered"
                    startContent={<Calendar className="text-default-400" size={18}/>}
                    value={fechaNacimiento}
                    onChange={setFechaNacimiento}
                    showMonthAndYearPickers
                />

                <Button 
                    size="lg" 
                    className="w-full font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    onPress={handleSave}
                    isLoading={loading}
                >
                    Comenzar Aventura 🚀
                </Button>

            </CardBody>
        </Card>
    </div>
  );
};

export default OnboardingPage;