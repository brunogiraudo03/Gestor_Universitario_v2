import { useState, useEffect } from "react";
import { 
  collection, doc, onSnapshot, query, orderBy, writeBatch, updateDoc, deleteDoc, getDocs 
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useHorarios = () => {
  const { user } = useUserStore();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const horariosRef = user ? collection(db, "usuarios", user.uid, "horarios") : null;

  useEffect(() => {
    if (!user || !horariosRef) {
        setHorarios([]);
        setLoading(false);
        return;
    }

    const q = query(horariosRef, orderBy("inicio", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHorarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 1. CREAR (Masivo)
  const agregarClaseCompleta = async (datosMateria, listaHorarios) => {
    if (!datosMateria.materia || listaHorarios.length === 0) return;
    const batch = writeBatch(db);
    listaHorarios.forEach(horario => {
        const docRef = doc(collection(db, "usuarios", user.uid, "horarios"));
        batch.set(docRef, {
            ...datosMateria,
            ...horario,
            createdAt: new Date().toISOString()
        });
    });
    await batch.commit();
  };

  // 2. EDITAR (Individual)
  const editarHorario = async (id, datos) => {
    if (!id || !horariosRef) return;
    await updateDoc(doc(db, "usuarios", user.uid, "horarios", id), datos);
  };

  // 3. BORRAR (Individual)
  const borrarHorario = async (id) => {
    if (!id || !horariosRef) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "horarios", id));
  };

  // 4. LIMPIAR TODO
  const limpiarHorarios = async () => {
    if (!horariosRef) return;
    const snapshot = await getDocs(horariosRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  };

  return { horarios, loading, agregarClaseCompleta, editarHorario, borrarHorario, limpiarHorarios };
};