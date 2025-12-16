import { useState, useRef } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { Download, Upload, Trash2, AlertTriangle, FileText } from "lucide-react";
import useUserStore from "../../../stores/useUserStore";
import { collection, getDocs, writeBatch, query, where, doc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { toast } from "sonner"; 

const DataSection = () => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. LIMPIEZA DE AGENDA ---
  const handleCleanAgenda = async () => {
    // Confirmación nativa (por seguridad es mejor que el usuario tenga que frenar y leer)
    if (!confirm("⚠️ ¿Estás seguro de borrar los eventos pasados?")) return;
    
    setLoading(true);
    try {
        const hoy = new Date();
        const fechaHoyString = hoy.toISOString().split('T')[0];
        const collectionRef = collection(db, "usuarios", user.uid, "todos");
        const q = query(collectionRef, where("fechaEntrega", "<", fechaHoyString));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            toast.info("Tu agenda ya está limpia y al día. ✨");
            setLoading(false); return;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        
        toast.success(`¡Listo! Eliminamos ${snapshot.size} eventos antiguos.`);
        
        // Recarga suave
        setTimeout(() => window.location.reload(), 1500); 

    } catch (error) {
        console.error(error);
        toast.error("Hubo un error al intentar limpiar la agenda.");
    }
    setLoading(false);
  };

  // --- 2. EXPORTAR DATOS ---
  const handleExportData = async () => {
    setLoading(true);
    const toastId = toast.loading("Generando copia de seguridad..."); // Feedback de carga

    try {
        const materiasRef = collection(db, "usuarios", user.uid, "materias");
        const materias = (await getDocs(materiasRef)).docs.map(d => ({ id: d.id, ...d.data() }));
        const horariosRef = collection(db, "usuarios", user.uid, "horarios");
        const horarios = (await getDocs(horariosRef)).docs.map(d => ({ id: d.id, ...d.data() }));

        const data = {
            version: 1,
            perfil: { nombre: user.displayName },
            materias, horarios,
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
        
        toast.dismiss(toastId);
        toast.success("Copia descargada correctamente. 📂");
    } catch (error) {
        toast.dismiss(toastId);
        toast.error("Error al exportar. Intenta nuevamente.");
    }
    setLoading(false);
  };

  // --- 3. IMPORTAR DATOS ---
  const handleImportClick = () => fileInputRef.current.click();
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            setLoading(true);
            const data = JSON.parse(event.target.result);
            if (!confirm("⚠️ ATENCIÓN: Esto sobrescribirá tus materias actuales. ¿Continuar?")) { 
                setLoading(false); return; 
            }

            const batch = writeBatch(db);
            data.materias?.forEach(m => batch.set(doc(db, "usuarios", user.uid, "materias", m.id || doc(collection(db, "temp")).id), m));
            data.horarios?.forEach(h => batch.set(doc(db, "usuarios", user.uid, "horarios", h.id || doc(collection(db, "temp")).id), h));
            
            await batch.commit();
            toast.success("¡Datos restaurados con éxito! 🚀");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) { 
            toast.error("El archivo está dañado o no es válido."); 
        } 
        finally { setLoading(false); e.target.value = null; }
    };
    reader.readAsText(file);
  };

  // --- 4. RESETEAR CUENTA (PELIGRO) ---
  const handleResetAccount = async () => {
    // Doble confirmación por seguridad
    if(!confirm("⛔ PELIGRO: Se borrará TODO (Materias, Notas, Horarios).")) return;
    if(!confirm("¿Estás 100% seguro? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    try {
        const batch = writeBatch(db);
        const collections = ["materias", "horarios", "todos"];
        for (const colName of collections) {
            const snap = await getDocs(collection(db, "usuarios", user.uid, colName));
            snap.docs.forEach(d => batch.delete(d.ref));
        }
        await batch.commit();
        
        toast.success("Cuenta reseteada a 0. Empezando de nuevo...");
        setTimeout(() => window.location.reload(), 2000);
    } catch (e) { 
        toast.error("No se pudo resetear la cuenta. Revisa tu conexión."); 
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 pb-10">
        <h3 className="text-lg font-bold px-1 mt-6">Gestión de Datos</h3>
        
        {/* Mantenimiento */}
        <Card className="border border-warning-200 bg-warning-50/50 dark:bg-warning-900/10">
            <CardBody className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning-100 text-warning-700 rounded-lg dark:bg-warning-900/50 dark:text-warning-500">
                        <AlertTriangle size={20}/>
                    </div>
                    <div>
                        <span className="font-bold text-sm">Limpiar Agenda</span>
                        <p className="text-tiny text-default-500">Borrar eventos pasados</p>
                    </div>
                </div>
                <Button className="w-full sm:w-auto" size="sm" color="warning" variant="flat" onPress={handleCleanAgenda} isLoading={loading}>
                    Limpiar
                </Button>
            </CardBody>
        </Card>

        {/* Backup */}
        <Card className="border border-default-100">
            <CardBody className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-default-100 rounded-lg"><FileText size={20}/></div>
                    <div>
                        <span className="font-bold text-sm">Copia de Seguridad</span>
                        <p className="text-tiny text-default-500">Respalda tus materias y horarios</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" className="flex-1" variant="flat" onPress={handleExportData} startContent={<Download size={16}/>}>
                        Descargar
                    </Button>
                    <Button size="sm" className="flex-1" variant="flat" onPress={handleImportClick} startContent={<Upload size={16}/>}>
                        Restaurar
                    </Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            </CardBody>
        </Card>

        {/* --- ZONA DE PELIGRO (DISEÑO ARREGLADO) --- */}
        <Card className="border border-danger-200 bg-danger-50 dark:bg-danger-900/10">
            <CardBody className="p-5 flex flex-col gap-6"> 
                {/* ✅ CAMBIO: Usamos 'flex-col' y 'gap-6'.
                   Esto separa visualmente el texto del botón y evita que se peguen.
                */}
                
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-danger-100 text-danger-600 rounded-xl dark:bg-danger-900/50 dark:text-danger-500">
                        <Trash2 size={24}/>
                    </div>
                    <div>
                        <span className="font-bold text-base text-danger">Resetear Cuenta</span>
                        <p className="text-xs text-danger-600/70 dark:text-danger-400/70">
                            Esta acción borrará todas tus materias, horarios y tareas de forma permanente.
                        </p>
                    </div>
                </div>

                <Button 
                    className="w-full font-bold" 
                    size="lg" 
                    color="danger" 
                    variant="shadow" 
                    onPress={handleResetAccount}
                >
                    Borrar Todo
                </Button>
            </CardBody>
        </Card>
    </div>
  );
};

export default DataSection;