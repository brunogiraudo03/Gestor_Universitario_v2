import { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { Rocket, GraduationCap } from "lucide-react";

const OnboardingPage = ({ onComplete }) => {
  const [carrera, setCarrera] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuardar = async () => {
    if (!carrera.trim()) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        // Guardamos el nombre de la carrera en el perfil del usuario
        await setDoc(doc(db, "usuarios", user.uid), {
          carrera: carrera,
          configurado: true, // Bandera para saber que ya pasó por aquí
          email: user.email,
          nombre: user.displayName
        }, { merge: true });

        // Avisamos a la App que ya terminó
        onComplete(); 
      }
    } catch (error) {
      console.error("Error al guardar carrera:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md z-10 bg-background/60 backdrop-blur-md border border-white/10">
        <CardHeader className="flex flex-col gap-2 text-center pt-8 px-8">
          <div className="mx-auto bg-gradient-to-tr from-primary to-secondary p-3 rounded-xl mb-2 shadow-lg shadow-primary/20">
            <Rocket className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold">¡Bienvenido a bordo! 🚀</h1>
          <p className="text-default-500">Para configurar tu espacio de trabajo, necesitamos saber qué estás estudiando.</p>
        </CardHeader>
        
        <CardBody className="gap-6 py-8 px-8">
          <Input 
            autoFocus
            label="Nombre de tu Carrera" 
            placeholder="Ej: Ingeniería en Sistemas, Medicina, Abogacía..." 
            variant="bordered"
            size="lg"
            startContent={<GraduationCap className="text-default-400"/>}
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
          />

          <Button 
            onPress={handleGuardar} 
            color="primary" 
            size="lg" 
            className="font-bold shadow-lg shadow-primary/20"
            isLoading={loading}
          >
            Comenzar mi Carrera
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default OnboardingPage;