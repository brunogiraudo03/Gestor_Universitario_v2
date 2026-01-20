import { useState, useEffect, useMemo } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch,
    getDocs
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

/**
 * Hook personalizado para gestionar listas dentro de tableros.
 * CON UI OPTIMISTA: Las actualizaciones se reflejan inmediatamente en el estado local.
 */
export const useListas = (tableroId) => {
    const { user } = useUserStore();
    const [listas, setListas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Memoizar la referencia para no causar re-renders innecesarios
    const listasRef = useMemo(
        () => user ? collection(db, "usuarios", user.uid, "listas") : null,
        [user]
    );

    useEffect(() => {
        if (!user || !listasRef || !tableroId) {
            setListas([]);
            setLoading(false);
            return;
        }

        // Query con orderBy (requiere índice compuesto en Firebase)
        const q = query(
            listasRef,
            where("tableroId", "==", tableroId),
            orderBy("orden", "asc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const datos = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListas(datos);
                setLoading(false);
            },
            (error) => {
                console.error("Error al suscribirse a listas:", error);
                console.error("Crea el índice en Firebase Console:", error.message);
                setListas([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, tableroId, listasRef]);

    const agregarLista = async (lista) => {
        if (!listasRef || !tableroId || !user) return;

        // UI Optimista: ID temporal
        const tempId = "temp-" + Date.now();
        const nuevaLista = {
            id: tempId,
            tableroId,
            nombre: lista.nombre || "Nueva Lista",
            color: lista.color || null,
            orden: listas.length,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Actualizar estado IMMEDIATELY
        setListas(prev => [...prev, nuevaLista]);

        try {
            const docRef = await addDoc(listasRef, {
                tableroId,
                nombre: lista.nombre || "Nueva Lista",
                color: lista.color || null,
                orden: listas.length,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            // El snapshot corregirá el ID
            return docRef.id;
        } catch (error) {
            console.error("Error al agregar lista:", error);
            // Revertir
            setListas(prev => prev.filter(l => l.id !== tempId));
            throw error;
        }
    };

    const editarLista = async (id, nuevosDatos) => {
        if (!user) return;

        // UI Optimista
        setListas(prev => prev.map(l => l.id === id ? { ...l, ...nuevosDatos } : l));

        try {
            await updateDoc(doc(db, "usuarios", user.uid, "listas", id), {
                ...nuevosDatos,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al editar lista:", error);
            throw error;
        }
    };

    const borrarLista = async (id) => {
        if (!user) return;

        // UI Optimista
        const backup = [...listas];
        setListas(prev => prev.filter(l => l.id !== id));

        try {
            const batch = writeBatch(db);

            // 1. Obtener todas las tarjetas de esta lista
            const tarjetasRef = collection(db, "usuarios", user.uid, "tarjetas");
            const tarjetasQuery = query(tarjetasRef, where("listaId", "==", id));
            const tarjetasSnapshot = await getDocs(tarjetasQuery);

            // 2. Para cada tarjeta, buscar y eliminar los todos asociados
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

            // 3. Eliminar la lista
            batch.delete(doc(db, "usuarios", user.uid, "listas", id));

            await batch.commit();
        } catch (error) {
            console.error("Error al borrar lista:", error);
            setListas(backup); // Revertir
            throw error;
        }
    };

    const reordenarListas = async (nuevasListas) => {
        if (!user) return;

        // UI Optimista
        setListas(nuevasListas);

        try {
            const batch = writeBatch(db);

            nuevasListas.forEach((lista, index) => {
                if (lista.id.startsWith("temp-")) return;
                const listaRef = doc(db, "usuarios", user.uid, "listas", lista.id);
                batch.update(listaRef, { orden: index });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error al reordenar listas:", error);
            throw error;
        }
    };

    return {
        listas,
        loading,
        agregarLista,
        editarLista,
        borrarLista,
        reordenarListas
    };
};
