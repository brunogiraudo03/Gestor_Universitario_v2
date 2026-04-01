import { useState, useEffect, useMemo } from "react";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";
import { toast } from "sonner";

export const useHorarios = () => {
  const { user } = useUserStore();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Referencia estable a la colección
  const horariosRef = useMemo(
    () => user ? collection(db, "usuarios", user.uid, "horarios") : null,
    [user]
  );

  // Suscripción en tiempo real con onSnapshot (igual que el resto de hooks)
  useEffect(() => {
    if (!user || !horariosRef) {
      setHorarios([]);
      setLoading(false);
      return;
    }

    const q = query(horariosRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHorarios(data);
      setLoading(false);
    }, (error) => {
      console.error("Error al suscribirse a horarios:", error);
      toast.error("Error al cargar horarios");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, horariosRef]);

  // Agregar
  const agregarHorario = async (nuevoHorario) => {
    if (!horariosRef) return;
    try {
      await addDoc(horariosRef, nuevoHorario);
      toast.success("Clase agregada al horario");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  // Borrar
  const borrarHorario = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "horarios", id));
      toast.success("Clase eliminada");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  // Editar
  const editarHorario = async (id, datosActualizados) => {
    if (!user) return;
    try {
      const docRef = doc(db, "usuarios", user.uid, "horarios", id);
      await updateDoc(docRef, datosActualizados);
      toast.success("Horario actualizado");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar");
    }
  };

  return { horarios, loading, agregarHorario, borrarHorario, editarHorario };
};