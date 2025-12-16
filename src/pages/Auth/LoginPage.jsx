import { useState, useEffect } from "react";
import { 
  Button, Card, CardBody, CardHeader, Input, Divider, Link,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@nextui-org/react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Mail, Lock, User as UserIcon, CheckCircle2, ArrowLeft } from "lucide-react"; 

// Icono Google SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // Login/Register States
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 
  const [isVisible, setIsVisible] = useState(false); 

  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Reset Password States
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("idle"); // idle | loading | success | error
  const [resetMsg, setResetMsg] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Al abrir el modal de reset, pre-llenar con el email del login si existe
  useEffect(() => {
    if (isOpen && email) {
        setResetEmail(email);
    }
    // Resetear estados del modal al abrir
    if (isOpen) {
        setResetStatus("idle");
        setResetMsg("");
    }
  }, [isOpen]);

  // --- HANDLERS PRINCIPALES ---

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); 
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    if (!email || !password) return setError("Por favor completa todos los campos.");
    if (isSignUp && !name.trim()) return setError("El nombre es obligatorio.");

    setLoading(true);
    try {
        if (isSignUp) {
            // REGISTRO
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            navigate("/");
        } else {
            // LOGIN
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        }
    } catch (err) {
        console.error(err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError("Correo o contraseña incorrectos.");
        else if (err.code === 'auth/user-not-found') setError("No existe una cuenta con este correo.");
        else if (err.code === 'auth/email-already-in-use') setError("Este correo ya está registrado.");
        else if (err.code === 'auth/weak-password') setError("La contraseña debe tener al menos 6 caracteres.");
        else setError("Ocurrió un error inesperado.");
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLER RESET PASSWORD (PROFESIONAL) ---
  
  const handleResetPassword = async () => {
    if (!resetEmail) {
        setResetStatus("error");
        setResetMsg("Ingresa tu correo electrónico.");
        return;
    }
    
    setResetStatus("loading");
    setResetMsg("");

    try {
        await sendPasswordResetEmail(auth, resetEmail);
        setResetStatus("success"); // Cambia la vista del modal a Éxito
    } catch (e) {
        console.error(e);
        setResetStatus("error");
        if (e.code === 'auth/user-not-found') setResetMsg("No encontramos ninguna cuenta con este correo.");
        else if (e.code === 'auth/invalid-email') setResetMsg("El formato del correo no es válido.");
        else setResetMsg("Error al enviar. Intenta más tarde.");
    }
  };

  return (
    <div className="dark text-foreground flex items-center justify-center min-h-screen bg-black relative selection:bg-primary/30">
      
      {/* Fondo Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* --- TARJETA PRINCIPAL --- */}
      <Card className="w-full max-w-[380px] m-4 z-10 bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader className="flex flex-col gap-2 pt-8 px-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-default-500 bg-clip-text text-transparent animate-appearance-in">
            {isSignUp ? "Crear Cuenta" : "Bienvenido"}
          </h1>
          <p className="text-sm text-default-400">Uplanner</p>
        </CardHeader>
        
        <CardBody className="gap-5 px-8 pb-8">
          
          <Button 
            onPress={handleGoogleLogin} 
            className="bg-white text-black font-medium shadow-lg hover:bg-gray-100 transition-all active:scale-95"
            startContent={<GoogleIcon />}
            isLoading={loading}
          >
            Continuar con Google
          </Button>

          <div className="flex items-center gap-2">
            <Divider className="flex-1 opacity-50"/>
            <span className="text-tiny text-default-400 uppercase tracking-wider">O con email</span>
            <Divider className="flex-1 opacity-50"/>
          </div>

          <div className="flex flex-col gap-4">
             {/* CAMPO NOMBRE (Solo Registro) */}
             {isSignUp && (
                 <Input 
                    type="text" 
                    label="Nombre Completo" 
                    placeholder="Tu nombre"
                    variant="bordered" 
                    startContent={<UserIcon size={18} className="text-default-400"/>}
                    value={name}
                    onValueChange={setName}
                    classNames={{ inputWrapper: "border-default-200/50 focus-within:!border-primary" }}
                 />
             )}

             <Input 
                type="email" 
                label="Correo Electrónico" 
                placeholder="ejemplo@correo.com"
                variant="bordered" 
                startContent={<Mail size={18} className="text-default-400"/>}
                value={email}
                onValueChange={setEmail}
                classNames={{ inputWrapper: "border-default-200/50 focus-within:!border-primary" }}
             />
             
             <div>
                <Input 
                    label="Contraseña" 
                    placeholder="••••••••"
                    variant="bordered"
                    startContent={<Lock size={18} className="text-default-400"/>}
                    endContent={
                    <button className="focus:outline-none opacity-70 hover:opacity-100" type="button" onClick={toggleVisibility}>
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    }
                    type={isVisible ? "text" : "password"}
                    value={password}
                    onValueChange={setPassword}
                    classNames={{ inputWrapper: "border-default-200/50 focus-within:!border-primary" }}
                />
                {!isSignUp && (
                    <div className="flex justify-end mt-1.5">
                        <Link 
                            as="button"
                            size="sm" 
                            className="text-default-400 cursor-pointer hover:text-primary text-[11px] transition-colors" 
                            onPress={onOpen}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                )}
             </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-danger text-xs bg-danger/10 p-3 rounded-lg border border-danger/20 animate-appearance-in">
                <AlertCircle size={16} /> <span className="font-medium">{error}</span>
            </div>
          )}

          <Button 
            color="primary" 
            size="lg"
            className="w-full font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            onPress={handleEmailAuth}
            isLoading={loading}
          >
            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </Button>

          <p className="text-center text-sm text-default-400 mt-2">
            {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "} 
            <Link 
                as="button" size="sm" color="primary" className="cursor-pointer font-bold underline hover:opacity-80"
                onPress={() => { setIsSignUp(!isSignUp); setError(null); }}
            >
                {isSignUp ? "Inicia Sesión" : "Regístrate"}
            </Link>
          </p>

        </CardBody>
      </Card>

      {/* --- MODAL RECUPERAR CONTRASEÑA (DISEÑO PRO) --- */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        placement="center" 
        backdrop="blur" 
        className="dark text-foreground border border-white/10"
      >
        <ModalContent>
          {(onClose) => (
            <>
              {/* VISTA 1: FORMULARIO */}
              {resetStatus !== "success" && (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Recuperar Contraseña</ModalHeader>
                    <ModalBody>
                        <p className="text-sm text-default-500 mb-2">
                            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                        </p>
                        <Input 
                            autoFocus
                            label="Correo Electrónico"
                            placeholder="tu@email.com"
                            variant="bordered"
                            startContent={<Mail size={18} className="text-default-400"/>}
                            value={resetEmail}
                            onValueChange={setResetEmail}
                            isInvalid={resetStatus === "error"}
                            errorMessage={resetStatus === "error" && resetMsg}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>Cancelar</Button>
                        <Button color="primary" onPress={handleResetPassword} isLoading={resetStatus === "loading"}>
                        Enviar Enlace
                        </Button>
                    </ModalFooter>
                  </>
              )}

              {resetStatus === "success" && (
                  <ModalBody className="py-10 flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success mb-2 animate-bounce-in">
                          <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-xl font-bold">¡Correo Enviado!</h3>
                      <p className="text-sm text-default-500 max-w-[250px]">
                          Revisa tu bandeja de entrada (y spam) en <strong>{resetEmail}</strong> para restablecer tu clave.
                      </p>
                      <Button color="success" variant="flat" onPress={onClose} className="mt-2 w-full max-w-[200px] font-semibold">
                          Entendido, volver
                      </Button>
                  </ModalBody>
              )}
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default LoginPage;