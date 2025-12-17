import { useState, useEffect } from "react";
import { 
  collection, query, getDocs, addDoc, deleteDoc, updateDoc, doc 
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { toast } from "sonner";

export const useHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchHorarios = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "usuarios", user.uid, "horarios"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHorarios(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, [user]);

  // Agregar
  const agregarHorario = async (nuevoHorario) => {
    try {
      await addDoc(collection(db, "usuarios", user.uid, "horarios"), nuevoHorario);
      toast.success("Clase agregada al horario");
      fetchHorarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  // Borrar
  const borrarHorario = async (id) => {
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "horarios", id));
      toast.success("Clase eliminada");
      fetchHorarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  // Editar
  const editarHorario = async (id, datosActualizados) => {
    try {
      const docRef = doc(db, "usuarios", user.uid, "horarios", id);
      await updateDoc(docRef, datosActualizados);
      toast.success("Horario actualizado");
      fetchHorarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar");
    }
  };

  return { horarios, loading, agregarHorario, borrarHorario, editarHorario };
};