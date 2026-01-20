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

/**
 * Hook personalizado para gestionar las materias del plan de estudios del usuario.
 * 
 * Proporciona funcionalidad CRUD completa y sincronización en tiempo real con Firestore.
 * Las materias se almacenan en la colección "plan" dentro del documento del usuario.
 * 
 * @returns {Object} Objeto con las materias, estado de carga y funciones CRUD
 * @returns {Array} materias - Array de materias del usuario
 * @returns {boolean} loading - Estado de carga inicial
 * @returns {Function} agregarMateria - Función para agregar una nueva materia
 * @returns {Function} borrarMateria - Función para eliminar una materia por ID
 * @returns {Function} editarMateria - Función para actualizar una materia existente
 * 
 * @example
 * const { materias, loading, agregarMateria } = useMaterias();
 * 
 * // Agregar una materia
 * await agregarMateria({
 *   nombre: "Cálculo I",
 *   nivel: 1,
 *   estado: "Cursando",
 *   correlativas: []
 * });
 */
export const useMaterias = () => {
  const { user, materias, setMaterias } = useUserStore();
  // Si ya tenemos materias en el store, no mostramos loading inicial para evitar parpadeos
  const [loading, setLoading] = useState(materias.length === 0);

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
    }, (error) => {
      console.error("Error al suscribirse a materias:", error);
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