import { useState, useEffect } from "react";
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useTodos = () => {
  const { user } = useUserStore();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const todosRef = user ? collection(db, "usuarios", user.uid, "todos") : null;

  useEffect(() => {
    if (!user || !todosRef) return;

    const q = query(todosRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const agregarTodo = async (texto) => {
    if (!texto.trim()) return;
    await addDoc(todosRef, { 
        texto, 
        completado: false, 
        createdAt: new Date() 
    });
  };

  const toggleTodo = async (todo) => {
    await updateDoc(doc(db, "usuarios", user.uid, "todos", todo.id), {
        completado: !todo.completado
    });
  };

  const borrarTodo = async (id) => {
    await deleteDoc(doc(db, "usuarios", user.uid, "todos", id));
  };

  return { todos, loading, agregarTodo, toggleTodo, borrarTodo };
};