import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { Github, Play } from "lucide-react"; // Usamos iconos de ejemplo

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); // Redirige al inicio tras loguearse
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Fondo decorativo (opcional) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-[350px] z-10 border-none bg-background/60 backdrop-blur-md shadow-2xl">
        <CardHeader className="flex flex-col gap-1 pb-0 pt-8 px-8 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Bienvenido
          </h1>
          <p className="text-sm text-default-500">Gestor Universitario 2.0</p>
        </CardHeader>
        
        <CardBody className="gap-4 py-8 px-8">
          <Button 
            onPress={handleGoogleLogin} // Aquí usamos onPress como pide NextUI
            color="primary" 
            variant="shadow"
            className="w-full font-semibold"
            startContent={<Play size={18} className="rotate-0 fill-current" />} 
          >
            Continuar con Google
          </Button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-[1px] bg-default-200 w-full"></div>
            <span className="text-tiny text-default-400">O</span>
            <div className="h-[1px] bg-default-200 w-full"></div>
          </div>

          <Button 
            variant="bordered" 
            className="w-full"
            startContent={<Github size={18} />}
            isDisabled
          >
            GitHub (Próximamente)
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginPage;