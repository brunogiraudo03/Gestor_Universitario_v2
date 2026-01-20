import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, where, getDocs, writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useTodos = () => {
  const { user } = useUserStore();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const todosRef = user ? collection(db, "usuarios", user.uid, "todos") : null;

  useEffect(() => {
    if (!user || !todosRef) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const q = query(todosRef, orderBy("fechaEntrega", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const agregarEvento = async (datos) => {
    if (!todosRef) return;
    const docRef = await addDoc(todosRef, {
      ...datos,
      completado: false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  const editarEvento = async (id, datos) => {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "todos", id), {
      ...datos
    });
  };

  const toggleTodo = async (todo) => {
    if (!todosRef) return;
    await updateDoc(doc(db, "usuarios", user.uid, "todos", todo.id), {
      completado: !todo.completado
    });
  };

  const borrarTodo = async (id) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // 1. Borrar evento
      const eventoRef = doc(db, "usuarios", user.uid, "todos", id);
      batch.delete(eventoRef);

      // 2. Buscar y borrar tareas vinculadas (Sync Bidireccional)
      const tarjetasRef = collection(db, "usuarios", user.uid, "tarjetas");
      const q = query(tarjetasRef, where("eventId", "==", id));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error al borrar evento y tareas vinculadas:", error);
      // Fallback simple si falla el batch (raro)
      await deleteDoc(doc(db, "usuarios", user.uid, "todos", id));
    }
  };

  return { todos, loading, agregarEvento, editarEvento, toggleTodo, borrarTodo };
};