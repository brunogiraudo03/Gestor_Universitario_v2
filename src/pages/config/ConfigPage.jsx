import { useState, useEffect, useRef } from "react";
import { 
  Card, CardBody, Button, Switch, Input, Divider, Avatar 
} from "@nextui-org/react";
import { 
  Moon, Sun, Download, Upload, Trash2, Save, UserCircle, 
  AlertTriangle, Copy, Check, Smartphone, CheckCircle 
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import { doc, getDoc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../config/firebase";
import { usePWA } from "../../hooks/usePWA";

const ConfigPage = () => {
  const { user } = useUserStore();
  
  // Usamos el hook actualizado con 'isInstalled'
  const { isInstallable, isInstalled, installApp } = usePWA();
  
  const [loading, setLoading] = useState(false);
  const [carrera, setCarrera] = useState("");
  
  // Estados visuales
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Referencia para importar archivos
  const fileInputRef = useRef(null);

  // 1. CARGA INICIAL
  useEffect(() => {
    // Perfil
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

    // Tema (Dark Mode)
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
    } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
    }

    // Detectar iOS (iPhone/iPad)
    const isDeviceIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isDeviceIOS);
  }, [user]);

  // 2. CAMBIAR TEMA
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
      await updateDoc(doc(db, "usuarios", user.uid), { carrera });
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar");
    }
    setLoading(false);
  };

  // 4. EXPORTAR DATOS (BACKUP)
  const handleExportData = async () => {
    setLoading(true);
    try {
        const materiasRef = collection(db, "usuarios", user.uid, "materias");
        const materiasSnap = await getDocs(materiasRef);
        const materias = materiasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const horariosRef = collection(db, "usuarios", user.uid, "horarios");
        const horariosSnap = await getDocs(horariosRef);
        const horarios = horariosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const data = {
            version: 1,
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

  // 5. IMPORTAR DATOS (RESTAURAR)
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            setLoading(true);
            const data = JSON.parse(event.target.result);
            
            if (!data.materias || !data.horarios) {
                alert("El archivo no tiene el formato correcto.");
                setLoading(false);
                return;
            }

            if (!confirm("⚠️ ¡ATENCIÓN! \n\nAl importar, se sobrescribirán tus datos actuales. ¿Seguro?")) {
                setLoading(false);
                return;
            }

            const batch = writeBatch(db);

            // Restaurar Materias
            data.materias.forEach(m => {
                const docRef = doc(db, "usuarios", user.uid, "materias", m.id || doc(collection(db, "temp")).id);
                batch.set(docRef, m);
            });

            // Restaurar Horarios
            data.horarios.forEach(h => {
                const docRef = doc(db, "usuarios", user.uid, "horarios", h.id || doc(collection(db, "temp")).id);
                batch.set(docRef, h);
            });

            // Restaurar Carrera
            if (data.perfil?.carrera) {
                const userRef = doc(db, "usuarios", user.uid);
                batch.update(userRef, { carrera: data.perfil.carrera });
            }

            await batch.commit();
            alert("¡Datos restaurados! Recargando...");
            window.location.reload();

        } catch (error) {
            alert("Error al procesar el archivo.");
        } finally {
            setLoading(false);
            e.target.value = null; 
        }
    };
    reader.readAsText(file);
  };

  // 6. COPIAR ALIAS
  const handleCopyAlias = () => {
    navigator.clipboard.writeText("bruno.giraudo.s");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 7. RESETEAR CUENTA
  const handleResetAccount = async () => {
    if(!confirm("¿ESTÁS SEGURO? Se borrarán TODAS tus materias y horarios.")) return;
    
    setLoading(true);
    try {
        const matRef = collection(db, "usuarios", user.uid, "materias");
        const matSnap = await getDocs(matRef);
        const batch = writeBatch(db);
        matSnap.docs.forEach(d => batch.delete(d.ref));

        const horRef = collection(db, "usuarios", user.uid, "horarios");
        const horSnap = await getDocs(horRef);
        horSnap.docs.forEach(d => batch.delete(d.ref));
        
        await batch.commit();
        alert("Cuenta reseteada.");
        window.location.reload();
    } catch (e) {
        alert("Error al borrar.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      {/* 1. PERFIL */}
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
                label="Carrera / Título" placeholder="Ej: Ingeniería en Sistemas" 
                value={carrera} onChange={(e) => setCarrera(e.target.value)} variant="bordered"
            />
            <div className="flex justify-end">
                <Button color="primary" onPress={handleSaveProfile} isLoading={loading} startContent={<Save size={18}/>}>
                    Guardar Cambios
                </Button>
            </div>
        </CardBody>
      </Card>

      {/* 2. APARIENCIA */}
      <Card>
        <CardBody className="p-6 flex flex-row justify-between items-center">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Moon size={20}/> Apariencia</h3>
                <p className="text-default-500 text-sm">Cambiar entre modo claro y oscuro.</p>
            </div>
            <Switch 
                size="lg" color="secondary"
                startContent={<Sun size={14}/>} endContent={<Moon size={14}/>}
                isSelected={isDark} onValueChange={handleThemeChange}
            >
                {isDark ? "Modo Oscuro" : "Modo Claro"}
            </Switch>
        </CardBody>
      </Card>

      {/* 3. INSTALAR APP (PWA) */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
        <CardBody className="p-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><Smartphone /> Instalar App</h3>
                    <p className="text-white/90 text-sm mt-1">Accede más rápido desde tu inicio.</p>
                </div>
                
                {/* LÓGICA DE BOTONES PWA */}
                {isInstalled ? (
                    <div className="bg-white/20 p-2 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16}/> <span className="font-bold text-sm">App Instalada</span>
                    </div>
                ) : isInstallable ? (
                    <Button className="bg-white text-indigo-600 font-bold shadow-lg" onPress={installApp}>
                        Instalar
                    </Button>
                ) : isIOS ? (
                    <div className="bg-white/20 p-2 rounded-lg text-xs font-medium text-center max-w-[150px]">
                        Toca <strong>Compartir</strong> y <strong>"Agregar a Inicio"</strong>
                    </div>
                ) : null}
            </div>
        </CardBody>
      </Card>

      {/* 4. DONACIÓN */}
      <Card className="bg-gradient-to-r from-[#009EE3] to-[#0072bb] text-white border-none shadow-lg shadow-blue-500/20">
        <CardBody className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">🤝 Apoya el Proyecto</h3>
                <p className="text-white/90 text-sm mt-1">Invítame un café transfiriendo a mi alias.</p>
                <div className="mt-3 bg-white/20 p-2 rounded-lg inline-block">
                    <span className="font-mono font-bold tracking-wide">Bruno.Giraudo.mp</span>
                </div>
            </div>
            <Button 
                className="bg-white text-[#009EE3] font-bold shadow-lg" 
                size="lg" onPress={handleCopyAlias}
                startContent={copied ? <Check size={20}/> : <Copy size={20}/>}
            >
                {copied ? "¡Copiado!" : "Copiar Alias"}
            </Button>
        </CardBody>
      </Card>

      {/* 5. GESTIÓN DE DATOS */}
      <Card>
        <CardBody className="p-6 gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Download size={20}/> Gestión de Datos</h3>
            <p className="text-default-500 text-sm">Copia de seguridad y restauración.</p>
            
            <div className="flex gap-4">
                <Button variant="flat" color="success" onPress={handleExportData} startContent={<Download size={18}/>}>
                    Exportar Copia
                </Button>
                <Button variant="flat" color="primary" onPress={handleImportClick} startContent={<Upload size={18}/>}>
                    Restaurar Copia
                </Button>
                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
            </div>
            
            <Divider className="my-2"/>
            
            <div className="bg-danger-50 p-4 rounded-xl border border-danger-200">
                <h4 className="text-danger font-bold flex items-center gap-2 text-sm"><AlertTriangle size={16}/> Zona de Peligro</h4>
                <p className="text-danger-600 text-xs mb-3">Borrar todo permanentemente.</p>
                <Button size="sm" color="danger" variant="ghost" onPress={handleResetAccount} startContent={<Trash2 size={16}/>}>
                    Resetear Cuenta
                </Button>
            </div>
        </CardBody>
      </Card>
      
      <p className="text-center text-xs text-default-400 pt-4">Gestor Universitario v2.0 • Bruno Giraudo</p>
    </div>
  );
};

export default ConfigPage;