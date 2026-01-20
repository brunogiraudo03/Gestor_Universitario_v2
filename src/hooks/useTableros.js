import { useState, useEffect, useMemo } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
    where,
    getDocs
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";
import { getDefaultBackground } from "../utils/boardBackgrounds";

export const useTableros = () => {
    const { user } = useUserStore();
    const [tableros, setTableros] = useState([]);
    const [loading, setLoading] = useState(true);

    const tablerosRef = useMemo(
        () => user ? collection(db, "usuarios", user.uid, "tableros") : null,
        [user]
    );

    useEffect(() => {
        if (!user || !tablerosRef) {
            setTableros([]);
            setLoading(false);
            return;
        }

        const q = query(tablerosRef, orderBy("orden", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const datos = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTableros(datos);
                setLoading(false);
            },
            (error) => {
                console.error("Error al suscribirse a tableros:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, tablerosRef]);

    const agregarTablero = async (tablero) => {
        if (!tablerosRef || !user) return;

        const nuevoTablero = {
            nombre: tablero.nombre || "Nuevo Tablero",
            descripcion: tablero.descripcion || "",
            icono: tablero.icono || "📋",
            fondo: tablero.fondo || getDefaultBackground(),
            orden: tableros.length,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            const docRef = await addDoc(tablerosRef, nuevoTablero);
            return docRef.id;
        } catch (error) {
            console.error("Error al agregar tablero:", error);
            throw error;
        }
    };

    const editarTablero = async (id, nuevosDatos) => {
        if (!user) return;

        try {
            await updateDoc(doc(db, "usuarios", user.uid, "tableros", id), {
                ...nuevosDatos,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al editar tablero:", error);
            throw error;
        }
    };

    const borrarTablero = async (id) => {
        if (!user) return;

        try {
            // UI Optimista: Remover inmediatamente del estado
            setTableros(prev => prev.filter(t => t.id !== id));

            const batch = writeBatch(db);

            // 1. Borrar todas las listas del tablero
            const listasRef = collection(db, "usuarios", user.uid, "listas");
            const listasQuery = query(listasRef, where("tableroId", "==", id));
            const listasSnapshot = await getDocs(listasQuery);

            listasSnapshot.docs.forEach((listaDoc) => {
                batch.delete(listaDoc.ref);
            });

            // 2. Obtener todas las tarjetas del tablero
            const tarjetasRef = collection(db, "usuarios", user.uid, "tarjetas");
            const tarjetasQuery = query(tarjetasRef, where("tableroId", "==", id));
            const tarjetasSnapshot = await getDocs(tarjetasQuery);

            // 3. Para cada tarjeta, buscar y eliminar los todos asociados
            const todosRef = collection(db, "usuarios", user.uid, "todos");

            for (const tarjetaDoc of tarjetasSnapshot.docs) {
                const tarjetaId = tarjetaDoc.id;

                // Buscar todos vinculados a esta tarjeta
                const todosQuery = query(todosRef, where("tarjetaId", "==", tarjetaId));
                const todosSnapshot = await getDocs(todosQuery);

                // Eliminar cada todo
                todosSnapshot.docs.forEach((todoDoc) => {
                    batch.delete(todoDoc.ref);
                });

                // Eliminar la tarjeta
                batch.delete(tarjetaDoc.ref);
            }

            // 4. Borrar el tablero
            batch.delete(doc(db, "usuarios", user.uid, "tableros", id));

            await batch.commit();
        } catch (error) {
            console.error("Error al borrar tablero:", error);
            // Recargar tableros si falla
            const q = query(tablerosRef, orderBy("orden", "asc"));
            const snapshot = await getDocs(q);
            setTableros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            throw error;
        }
    };

    const reordenarTableros = async (nuevosTableros) => {
        if (!user) return;

        try {
            const batch = writeBatch(db);

            nuevosTableros.forEach((tablero, index) => {
                const tableroRef = doc(db, "usuarios", user.uid, "tableros", tablero.id);
                batch.update(tableroRef, { orden: index });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error al reordenar tableros:", error);
            throw error;
        }
    };

    return {
        tableros,
        loading,
        agregarTablero,
        editarTablero,
        borrarTablero,
        reordenarTableros
    };
};
