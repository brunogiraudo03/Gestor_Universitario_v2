import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import useUserStore from '../stores/useUserStore';
import { toast } from 'sonner';

export const useHabitos = () => {
    const [habitos, setHabitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserStore();

    // Referencia a la colección de hábitos del usuario
    const habitosRef = useMemo(
        () => user ? collection(db, 'usuarios', user.uid, 'habitos') : null,
        [user]
    );

    useEffect(() => {
        if (!user || !habitosRef) {
            setHabitos([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(habitosRef, (snapshot) => {
            const habitosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Ordenar en memoria
            habitosData.sort((a, b) => {
                const dateA = a.creadoEn?.toDate?.() || new Date(0);
                const dateB = b.creadoEn?.toDate?.() || new Date(0);
                return dateB - dateA;
            });

            setHabitos(habitosData);
            setLoading(false);
        }, (error) => {
            console.error('Error al cargar hábitos:', error);
            toast.error(`Error: ${error.message}`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, habitosRef]);

    const agregarHabito = async (habitoData) => {
        if (!user || !habitosRef) {
            toast.error('Debes iniciar sesión');
            return;
        }

        try {
            const nuevoHabito = {
                ...habitoData,
                userId: user.uid, // Redundante pero útil
                creadoEn: new Date()
            };

            await addDoc(habitosRef, nuevoHabito);
            toast.success('Hábito creado');
        } catch (error) {
            console.error('Error al crear hábito:', error);
            toast.error(`Error al crear: ${error.message}`);
            throw error;
        }
    };

    const editarHabito = async (habitoId, habitoData) => {
        if (!user) return;
        try {
            const habitoRef = doc(db, 'usuarios', user.uid, 'habitos', habitoId);
            await updateDoc(habitoRef, habitoData);
            toast.success('Hábito actualizado');
        } catch (error) {
            console.error('Error al editar hábito:', error);
            toast.error('Error al actualizar hábito');
            throw error;
        }
    };

    const borrarHabito = async (habitoId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'usuarios', user.uid, 'habitos', habitoId));
            toast.success('Hábito eliminado');
        } catch (error) {
            console.error('Error al borrar hábito:', error);
            toast.error('Error al eliminar hábito');
            throw error;
        }
    };

    const toggleCompletado = async (habitoId, fecha) => {
        if (!user) return;
        try {
            const habitoRef = doc(db, 'usuarios', user.uid, 'habitos', habitoId);
            const completadosRef = collection(habitoRef, 'completados');

            // Buscar si ya existe un registro para esta fecha
            // Nota: Aquí usamos una query simple, no requiere índice compuesto
            const q = query(completadosRef);
            const snapshot = await getDocs(q);

            // Filtrar en memoria para evitar índices complejos si es necesario, 
            // aunque 'where' simple debería funcionar. Por seguridad y consistencia:
            const registroExistente = snapshot.docs.find(d => d.data().fecha === fecha);

            if (!registroExistente) {
                // Crear nuevo registro
                await addDoc(completadosRef, {
                    fecha,
                    completado: true,
                    timestamp: new Date()
                });
            } else {
                // Eliminar registro existente (toggle off)
                await deleteDoc(doc(completadosRef, registroExistente.id));
            }
        } catch (error) {
            console.error('Error al marcar completado:', error);
            toast.error('Error al actualizar');
            throw error;
        }
    };

    const obtenerCompletados = async (habitoId) => {
        if (!user) return [];
        try {
            const habitoRef = doc(db, 'usuarios', user.uid, 'habitos', habitoId);
            const completadosRef = collection(habitoRef, 'completados');
            const snapshot = await getDocs(completadosRef);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error al obtener completados:', error);
            return [];
        }
    };

    return {
        habitos,
        loading,
        agregarHabito,
        editarHabito,
        borrarHabito,
        toggleCompletado,
        obtenerCompletados
    };
};
