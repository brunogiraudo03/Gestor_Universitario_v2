import { useState, useRef } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { Download, Upload, Trash2, AlertTriangle, FileText } from "lucide-react";
import useUserStore from "../../../stores/useUserStore";
import { collection, getDocs, writeBatch, query, where, doc } from "firebase/firestore";
import { db } from "../../../config/firebase";

const DataSection = () => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // --- LÓGICA DE LIMPIEZA ---
  const handleCleanAgenda = async () => {
    if (!confirm("¿Borrar tareas antiguas ya finalizadas?")) return;
    setLoading(true);
    try {
        const hoy = new Date();
        const fechaHoyString = hoy.toISOString().split('T')[0];
        const collectionRef = collection(db, "usuarios", user.uid, "todos");
        const q = query(collectionRef, where("fechaEntrega", "<", fechaHoyString));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("Tu agenda ya está limpia.");
            setLoading(false); return;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        alert(`Se eliminaron ${snapshot.size} eventos antiguos.`);
        window.location.reload(); 
    } catch (error) {
        console.error(error);
        alert("Error al limpiar.");
    }
    setLoading(false);
  };

  // --- LÓGICA DE EXPORTAR ---
  const handleExportData = async () => {
    setLoading(true);
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
    } catch (error) {
        alert("Error al exportar");
    }
    setLoading(false);
  };

  // --- LÓGICA DE IMPORTAR ---
  const handleImportClick = () => fileInputRef.current.click();
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            setLoading(true);
            const data = JSON.parse(event.target.result);
            if (!confirm("⚠️ Se sobrescribirán tus datos. ¿Continuar?")) { setLoading(false); return; }

            const batch = writeBatch(db);
            data.materias?.forEach(m => batch.set(doc(db, "usuarios", user.uid, "materias", m.id || doc(collection(db, "temp")).id), m));
            data.horarios?.forEach(h => batch.set(doc(db, "usuarios", user.uid, "horarios", h.id || doc(collection(db, "temp")).id), h));
            
            await batch.commit();
            window.location.reload();
        } catch (error) { alert("Error al importar."); } 
        finally { setLoading(false); e.target.value = null; }
    };
    reader.readAsText(file);
  };

  // --- LÓGICA DE RESET ---
  const handleResetAccount = async () => {
    if(!confirm("⚠️ PELIGRO: Se borrará TODO permanentemente. ¿Seguro?")) return;
    setLoading(true);
    try {
        const batch = writeBatch(db);
        const collections = ["materias", "horarios", "todos"];
        for (const colName of collections) {
            const snap = await getDocs(collection(db, "usuarios", user.uid, colName));
            snap.docs.forEach(d => batch.delete(d.ref));
        }
        await batch.commit();
        window.location.reload();
    } catch (e) { alert("Error al resetear."); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-bold px-1 mt-6">Gestión de Datos</h3>
        
        {/* Mantenimiento */}
        <Card className="border border-warning-200 bg-warning-50/50 dark:bg-warning-900/10">
            <CardBody className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning-100 text-warning-700 rounded-lg dark:bg-warning-900/50 dark:text-warning-500">
                        <AlertTriangle size={20}/>
                    </div>
                    <div>
                        <span className="font-bold text-sm">Limpiar Agenda</span>
                        <p className="text-tiny text-default-500">Borrar eventos pasados para optimizar</p>
                    </div>
                </div>
                <Button size="sm" color="warning" variant="flat" onPress={handleCleanAgenda} isLoading={loading}>
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

        {/* Danger Zone */}
        <Card className="border border-danger-200 bg-danger-50 dark:bg-danger-900/10">
            <CardBody className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-danger-100 text-danger-600 rounded-lg dark:bg-danger-900/50 dark:text-danger-500">
                        <Trash2 size={20}/>
                    </div>
                    <div>
                        <span className="font-bold text-sm text-danger">Resetear Cuenta</span>
                        <p className="text-tiny text-danger-600/70">Borrar todo permanentemente</p>
                    </div>
                </div>
                <Button size="sm" color="danger" variant="solid" onPress={handleResetAccount}>
                    Borrar
                </Button>
            </CardBody>
        </Card>
    </div>
  );
};

export default DataSection;