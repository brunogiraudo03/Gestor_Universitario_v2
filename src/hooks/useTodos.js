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
    if (!user || !todosRef) {
        setTodos([]);
        setLoading(false);
        return;
    }
    
    // Traemos todo ordenado por fecha
    const q = query(todosRef, orderBy("fechaEntrega", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const agregarEvento = async (datos) => {
    /* datos = { 
        texto: "Parcial Física", 
        fechaEntrega: "2023-10-25", 
        tipo: "parcial" | "entrega" | "tarea" | "otro",
        hora: "14:00"
      } 
    */
    if (!datos.texto.trim()) return;
    await addDoc(todosRef, { 
        ...datos,
        completado: false, 
        createdAt: new Date().toISOString() 
    });
  };

  const toggleTodo = async (todo) => {
    if (!todosRef) return;
    await updateDoc(doc(db, "usuarios", user.uid, "todos", todo.id), {
        completado: !todo.completado
    });
  };

  const borrarTodo = async (id) => {
    if (!todosRef) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "todos", id));
  };

  return { todos, loading, agregarEvento, toggleTodo, borrarTodo };
};