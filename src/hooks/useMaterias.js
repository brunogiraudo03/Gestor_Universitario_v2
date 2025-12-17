import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useMaterias = () => {
  const { user } = useUserStore();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);

  const materiasRef = user ? collection(db, "usuarios", user.uid, "plan") : null;

  useEffect(() => {
    if (!user || !materiasRef) return;

    const q = query(materiasRef, orderBy("nombre"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(datos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Funciones del CRUD
  const agregarMateria = async (materia) => {
    if (!materiasRef) return;
    await addDoc(materiasRef, {
      ...materia,
      createdAt: new Date()
    });
  };

  const borrarMateria = async (id) => {
    await deleteDoc(doc(db, "usuarios", user.uid, "plan", id));
  };

  const editarMateria = async (id, nuevosDatos) => {
    await updateDoc(doc(db, "usuarios", user.uid, "plan", id), nuevosDatos);
  };

  return { materias, loading, agregarMateria, borrarMateria, editarMateria };
};