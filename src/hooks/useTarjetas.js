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
    writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

export const useTarjetas = (tableroId) => {
    const { user } = useUserStore();
    const [tarjetas, setTarjetas] = useState([]);
    const [loading, setLoading] = useState(true);

    const tarjetasRef = useMemo(
        () => user ? collection(db, "usuarios", user.uid, "tarjetas") : null,
        [user]
    );

    useEffect(() => {
        if (!user || !tarjetasRef || !tableroId) {
            setTarjetas([]);
            setLoading(false);
            return;
        }

        // Query con orderBy (requiere índice compuesto en Firebase)
        const q = query(
            tarjetasRef,
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
                setTarjetas(datos);
                setLoading(false);
            },
            (error) => {
                console.error("Error al suscribirse a tarjetas:", error);
                console.error("Crea el índice en Firebase Console:", error.message);
                setTarjetas([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, tableroId, tarjetasRef]);

    const agregarTarjeta = async (tarjeta) => {
        if (!user || !tarjetasRef) return;

        const tarjetasEnLista = tarjetas.filter(t => t.listaId === tarjeta.listaId);

        // UI Optimista
        const tempId = "temp-" + Date.now();
        const nuevaTarjeta = {
            id: tempId,
            tableroId,
            listaId: tarjeta.listaId,
            titulo: tarjeta.titulo,
            descripcion: tarjeta.descripcion || "",
            fechaVencimiento: tarjeta.fechaVencimiento || "",
            etiquetas: tarjeta.etiquetas || [],
            eventId: tarjeta.eventId || null,
            completada: false,
            orden: tarjetasEnLista.length,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        setTarjetas(prev => [...prev, nuevaTarjeta]);

        try {
            await addDoc(tarjetasRef, {
                tableroId,
                listaId: tarjeta.listaId,
                titulo: tarjeta.titulo,
                descripcion: tarjeta.descripcion || "",
                fechaVencimiento: tarjeta.fechaVencimiento || "",
                etiquetas: tarjeta.etiquetas || [],
                eventId: tarjeta.eventId || null,
                completada: false,
                orden: tarjetasEnLista.length,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al agregar tarjeta:", error);
            setTarjetas(prev => prev.filter(t => t.id !== tempId));
            throw error;
        }
    };

    const toggleCompletada = async (id, estadoActual) => {
        if (!user) return;

        setTarjetas(prev => prev.map(t =>
            t.id === id ? { ...t, completada: !estadoActual } : t
        ));

        try {
            await updateDoc(doc(db, "usuarios", user.uid, "tarjetas", id), {
                completada: !estadoActual,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al toggle tarjeta:", error);
            setTarjetas(prev => prev.map(t =>
                t.id === id ? { ...t, completada: estadoActual } : t
            ));
        }
    };

    const editarTarjeta = async (id, datos) => {
        if (!user) return;

        setTarjetas(prev => prev.map(t =>
            t.id === id ? { ...t, ...datos } : t
        ));

        try {
            await updateDoc(doc(db, "usuarios", user.uid, "tarjetas", id), {
                ...datos,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al editar tarjeta:", error);
            throw error;
        }
    };

    const borrarTarjeta = async (id) => {
        if (!user) return;

        const tarjeta = tarjetas.find(t => t.id === id);
        const backup = [...tarjetas];
        setTarjetas(prev => prev.filter(t => t.id !== id));

        try {
            await deleteDoc(doc(db, "usuarios", user.uid, "tarjetas", id));

            if (tarjeta && tarjeta.eventId) {
                try {
                    await deleteDoc(doc(db, "usuarios", user.uid, "todos", tarjeta.eventId));
                } catch (e) {
                    console.warn("No se pudo borrar evento agenda", e);
                }
            }
        } catch (error) {
            console.error("Error al borrar tarjeta:", error);
            setTarjetas(backup);
            throw error;
        }
    };

    const moverTarjeta = async (tarjetaId, nuevaListaId, nuevoOrden) => {
        if (!user) return;

        setTarjetas(prev => prev.map(t => {
            if (t.id === tarjetaId) {
                return { ...t, listaId: nuevaListaId, orden: nuevoOrden };
            }
            return t;
        }));

        try {
            await updateDoc(doc(db, "usuarios", user.uid, "tarjetas", tarjetaId), {
                listaId: nuevaListaId,
                orden: nuevoOrden,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al mover tarjeta:", error);
        }
    };

    const reordenarTarjetas = async (listaId, nuevasTarjetas) => {
        if (!user) return;

        const orderMap = new Map();
        nuevasTarjetas.forEach((t, idx) => orderMap.set(t.id, idx));

        setTarjetas(prev => {
            return prev.map(t => {
                if (orderMap.has(t.id)) {
                    const newData = nuevasTarjetas.find(nt => nt.id === t.id);
                    return { ...t, orden: orderMap.get(t.id), listaId: newData.listaId || t.listaId };
                }
                return t;
            });
        });

        try {
            const batch = writeBatch(db);

            nuevasTarjetas.forEach((tarjeta, index) => {
                if (tarjeta.id.startsWith("temp-")) return;
                const tarjetaRef = doc(db, "usuarios", user.uid, "tarjetas", tarjeta.id);
                batch.update(tarjetaRef, {
                    orden: index,
                    listaId: listaId
                });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error al reordenar tarjetas:", error);
            throw error;
        }
    };

    return {
        tarjetas,
        loading,
        agregarTarjeta,
        editarTarjeta,
        borrarTarjeta,
        moverTarjeta,
        reordenarTarjetas,
        toggleCompletada
    };
};
