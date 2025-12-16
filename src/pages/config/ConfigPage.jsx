import { useState, useEffect } from "react";
import { 
  Card, CardBody, Button, Switch, Input, Divider, Avatar, Snippet 
} from "@nextui-org/react";
import { 
  Moon, Sun, Download, Trash2, Save, UserCircle, AlertTriangle, Copy, Check 
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";

const ConfigPage = () => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [carrera, setCarrera] = useState("");
  
  // Estados para Tema y Donación
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. CARGAR DATOS Y TEMA AL INICIO
  useEffect(() => {
    // Cargar Perfil
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCarrera(snap.data().carrera || "");
        }
      }
    };
    fetchProfile();

    // Cargar Tema Guardado
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
    } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
    }
  }, [user]);

  // 2. CAMBIAR TEMA (LÓGICA REAL)
  const handleThemeChange = (isSelected) => {
    setIsDark(isSelected);
    if (isSelected) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
  };

  // 3. GUARDAR PERFIL
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "usuarios", user.uid);
      await updateDoc(docRef, { carrera });
      // Usamos un alert simple o podrías poner un toast si tienes
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar");
    }
    setLoading(false);
  };

  // 4. EXPORTAR DATOS
  const handleExportData = async () => {
    setLoading(true);
    try {
        const materiasRef = collection(db, "usuarios", user.uid, "materias");
        const materiasSnap = await getDocs(materiasRef);
        const materias = materiasSnap.docs.map(d => d.data());

        const horariosRef = collection(db, "usuarios", user.uid, "horarios");
        const horariosSnap = await getDocs(horariosRef);
        const horarios = horariosSnap.docs.map(d => d.data());

        const data = {
            perfil: { nombre: user.displayName, carrera },
            materias,
            horarios,
            fecha: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup_gestor_${user.uid.slice(0,5)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert("Error al exportar datos");
    }
    setLoading(false);
  };

  // 5. COPIAR ALIAS MP
  const handleCopyAlias = () => {
    navigator.clipboard.writeText("Bruno.Giraudo.mp");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      {/* SECCIÓN 1: PERFIL */}
      <Card>
        <CardBody className="p-6 gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <UserCircle /> Perfil Académico
            </h3>
            <div className="flex items-center gap-4 mb-4">
                <Avatar src={user?.photoURL} size="lg" isBordered color="primary" />
                <div>
                    <p className="font-bold text-lg">{user?.displayName}</p>
                    <p className="text-default-500 text-sm">{user?.email}</p>
                </div>
            </div>
            
            <Input 
                label="Carrera / Título" 
                placeholder="Ej: Ingeniería en Sistemas" 
                value={carrera} 
                onChange={(e) => setCarrera(e.target.value)}
                variant="bordered"
            />
            
            <div className="flex justify-end">
                <Button color="primary" onPress={handleSaveProfile} isLoading={loading} startContent={<Save size={18}/>}>
                    Guardar Cambios
                </Button>
            </div>
        </CardBody>
      </Card>

      {/* SECCIÓN 2: APARIENCIA */}
      <Card>
        <CardBody className="p-6 flex flex-row justify-between items-center">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Moon size={20}/> Apariencia</h3>
                <p className="text-default-500 text-sm">Cambiar entre modo claro y oscuro.</p>
            </div>
            <Switch 
                size="lg" 
                color="secondary"
                startContent={<Sun size={14}/>} 
                endContent={<Moon size={14}/>}
                isSelected={isDark}
                onValueChange={handleThemeChange}
            >
                {isDark ? "Modo Oscuro" : "Modo Claro"}
            </Switch>
        </CardBody>
      </Card>

      {/* SECCIÓN 3: MERCADO PAGO */}
      <Card className="bg-gradient-to-r from-[#009EE3] to-[#0072bb] text-white border-none shadow-lg shadow-blue-500/20">
        <CardBody className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">🤝 Apoya el Proyecto</h3>
                <p className="text-white/90 text-sm mt-1">
                    ¿Te sirve la app? Puedes invitarme un café transfiriendo a mi alias.
                </p>
                <div className="mt-3 bg-white/20 p-2 rounded-lg inline-block">
                    <span className="font-mono font-bold tracking-wide">Bruno.Giraudo.mp</span>
                </div>
            </div>
            
            <Button 
                className="bg-white text-[#009EE3] font-bold shadow-lg" 
                size="lg"
                onPress={handleCopyAlias}
                startContent={copied ? <Check size={20}/> : <Copy size={20}/>}
            >
                {copied ? "¡Copiado!" : "Copiar Alias"}
            </Button>
        </CardBody>
      </Card>

      {/* SECCIÓN 4: DATOS */}
      <Card>
        <CardBody className="p-6 gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Download size={20}/> Gestión de Datos</h3>
            <p className="text-default-500 text-sm">
                Descarga una copia de seguridad de toda tu información académica en formato JSON.
            </p>
            <div>
                <Button variant="flat" color="success" onPress={handleExportData} startContent={<Download size={18}/>}>
                    Descargar mis datos
                </Button>
            </div>
            
            <Divider className="my-2"/>
            
            <div className="bg-danger-50 p-4 rounded-xl border border-danger-200">
                <h4 className="text-danger font-bold flex items-center gap-2 text-sm"><AlertTriangle size={16}/> Zona de Peligro</h4>
                <p className="text-danger-600 text-xs mb-3">
                    Esta acción borrará todas tus materias, horarios y notas. No se puede deshacer.
                </p>
                <Button size="sm" color="danger" variant="ghost" startContent={<Trash2 size={16}/>}>
                    Resetear Cuenta
                </Button>
            </div>
        </CardBody>
      </Card>

      <p className="text-center text-xs text-default-400 pt-4">
        Gestor Universitario v1.0 • Bruno Giraudo
      </p>
    </div>
  );
};

export default ConfigPage;