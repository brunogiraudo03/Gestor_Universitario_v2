import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useWeeklyTodos = () => {
  const { user } = useUserStore();
  const [weeklyTodos, setWeeklyTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const todosRef = user ? collection(db, "usuarios", user.uid, "weeklyTodos") : null;

  useEffect(() => {
    if (!user || !todosRef) {
      setWeeklyTodos([]);
      setLoading(false);
      return;
    }

    const q = query(todosRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWeeklyTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const agregarWeeklyTodo = async (texto, fechaISO) => {
    if (!todosRef) return;
    const docRef = await addDoc(todosRef, {
      texto,
      fecha: fechaISO,
      completado: false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  const toggleWeeklyTodo = async (todo) => {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "weeklyTodos", todo.id), {
      completado: !todo.completado
    });
  };

  const borrarWeeklyTodo = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "weeklyTodos", id));
  };

  return { weeklyTodos, loading, agregarWeeklyTodo, toggleWeeklyTodo, borrarWeeklyTodo };
};
