import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import useUserStore from '../stores/useUserStore';
import { toast } from 'sonner';

/**
 * Hook para gestionar los datos detallados de una materia en estado "Cursando".
 * Lee y escribe en el campo `cursandoInfo` del documento de la materia.
 * También sincroniza los horarios con la colección `horarios` del usuario.
 */
export const useCursando = (materiaId) => {
    const { user } = useUserStore();
    const [materiaPlan, setMateriaPlan] = useState(null);
    const [materiaElectiva, setMateriaElectiva] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [loadingElectiva, setLoadingElectiva] = useState(true);

    const planRef = useMemo(() => user && materiaId ? doc(db, 'usuarios', user.uid, 'plan', materiaId) : null, [user, materiaId]);
    const electivaRef = useMemo(() => user && materiaId ? doc(db, 'usuarios', user.uid, 'electivas', materiaId) : null, [user, materiaId]);

    useEffect(() => {
        if (!planRef) { setLoadingPlan(false); return; }
        return onSnapshot(planRef, (snap) => {
            if (snap.exists()) setMateriaPlan({ id: snap.id, ...snap.data(), isElectiva: false });
            else setMateriaPlan(null);
            setLoadingPlan(false);
        });
    }, [planRef]);

    useEffect(() => {
        if (!electivaRef) { setLoadingElectiva(false); return; }
        return onSnapshot(electivaRef, (snap) => {
            if (snap.exists()) setMateriaElectiva({ id: snap.id, ...snap.data(), isElectiva: true });
            else setMateriaElectiva(null);
            setLoadingElectiva(false);
        });
    }, [electivaRef]);

    const materia = materiaPlan || materiaElectiva;
    const loading = loadingPlan && loadingElectiva;

    const materiaRef = useMemo(() => {
        if (!user || !materia || !materiaId) return null;
        return materia.isElectiva ? electivaRef : planRef;
    }, [user, materia, materiaId, planRef, electivaRef]);

    const cursandoInfo = useMemo(() => ({
        notebookLMUrl: '',
        condicionesAprobacion: '',
        parciales: [],
        notas: [],
        profesores: [],
        horarios: [],  // [{ horarioId, dia, inicio, fin, aula, comision, color }]
        ...(materia?.cursandoInfo || {})
    }), [materia]);

    const _updateInfo = async (patch) => {
        if (!materiaRef) return;
        try {
            await updateDoc(materiaRef, {
                cursandoInfo: { ...cursandoInfo, ...patch }
            });
        } catch (err) {
            console.error('Error guardando:', err);
            toast.error('Error al guardar');
            throw err;
        }
    };

    const cambiarEstado = async (nuevoEstado, borrarDatos = false) => {
        if (!materiaRef) return;
        const patch = { estado: nuevoEstado };
        if (borrarDatos) patch.cursandoInfo = null;
        await updateDoc(materiaRef, patch);
    };

    const cambiarColor = async (color) => {
        if (!materiaRef || !user) return;

        // 1. Guardar el nuevo color en la materia principal
        await updateDoc(materiaRef, { color });

        // 2. Propagar el color a todos los horarios asociados globalmente
        if (cursandoInfo.horarios && cursandoInfo.horarios.length > 0) {
            for (const h of cursandoInfo.horarios) {
                if (h.horarioId) {
                    try {
                        const hRef = doc(db, 'usuarios', user.uid, 'horarios', h.horarioId);
                        await updateDoc(hRef, { color });
                    } catch (err) {
                        console.error('Error sincronizando color de horario:', err);
                    }
                }
            }
            // Actualizar la lista interna de cursandoInfo
            const nuevosHorarios = cursandoInfo.horarios.map(h => ({ ...h, color }));
            await _updateInfo({ horarios: nuevosHorarios });
        }
    };


    // ── Parciales ─────────────────────────────────────────────────────
    const agregarParcial = async (parcial) => {
        const id = Date.now().toString();
        await _updateInfo({ parciales: [...cursandoInfo.parciales, { ...parcial, id }] });
        toast.success('Evaluación guardada ✓');
    };
    const editarParcial = async (id, datos) => {
        const nuevos = cursandoInfo.parciales.map(p => p.id === id ? { ...p, ...datos } : p);
        await _updateInfo({ parciales: nuevos });
        toast.success('Evaluación actualizada');
    };
    const borrarParcial = async (id) => {
        await _updateInfo({ parciales: cursandoInfo.parciales.filter(p => p.id !== id) });
        toast.success('Eliminado');
    };

    // ── Condiciones ────────────────────────────────────────────────────
    const guardarCondiciones = async (texto) => {
        await _updateInfo({ condicionesAprobacion: texto });
        toast.success('Condiciones guardadas ✓');
    };

    // ── Notas/Links ────────────────────────────────────────────────────
    const agregarNota = async (nota) => {
        const id = Date.now().toString();
        await _updateInfo({ notas: [...cursandoInfo.notas, { ...nota, id }] });
        toast.success('Nota guardada ✓');
    };
    const borrarNota = async (id) => {
        await _updateInfo({ notas: cursandoInfo.notas.filter(n => n.id !== id) });
        toast.success('Nota eliminada');
    };

    // ── Profesores ─────────────────────────────────────────────────────
    const agregarProfesor = async (prof) => {
        const id = Date.now().toString();
        await _updateInfo({ profesores: [...cursandoInfo.profesores, { ...prof, id }] });
        toast.success('Profe guardado ✓');
    };
    const borrarProfesor = async (id) => {
        await _updateInfo({ profesores: cursandoInfo.profesores.filter(p => p.id !== id) });
        toast.success('Profe eliminado');
    };

    // ── NotebookLM ─────────────────────────────────────────────────────
    const guardarNotebookLM = async (url) => {
        await _updateInfo({ notebookLMUrl: url });
        toast.success('Link guardado ✓');
    };

    // ── Horarios (sincronizados con colección horarios) ────────────────
    const agregarHorario = async (horarioData) => {
        if (!user) return;
        try {
            // 1. Crear el documento en la colección horarios del usuario
            const horariosRef = collection(db, 'usuarios', user.uid, 'horarios');
            const newDoc = await addDoc(horariosRef, horarioData);

            // 2. Guardar referencia del ID en cursandoInfo.horarios
            const horarioEntry = { ...horarioData, horarioId: newDoc.id };
            await _updateInfo({ horarios: [...cursandoInfo.horarios, horarioEntry] });
            toast.success('Horario agregado ✓ Se sincronizó con Horarios');
        } catch (err) {
            console.error('Error agregando horario:', err);
            toast.error('Error al agregar horario');
            throw err;
        }
    };

    const borrarHorario = async (horarioId) => {
        if (!user) return;
        try {
            // Borrar de la colección horarios
            await deleteDoc(doc(db, 'usuarios', user.uid, 'horarios', horarioId));
            // Borrar referencia de cursandoInfo
            await _updateInfo({ horarios: cursandoInfo.horarios.filter(h => h.horarioId !== horarioId) });
            toast.success('Horario eliminado');
        } catch (err) {
            console.error('Error borrando horario:', err);
            toast.error('Error al eliminar');
        }
    };

    return {
        materia,
        cursandoInfo,
        loading,
        agregarParcial, editarParcial, borrarParcial,
        guardarCondiciones,
        agregarNota, borrarNota,
        agregarProfesor, borrarProfesor,
        guardarNotebookLM,
        agregarHorario, borrarHorario,
        cambiarEstado, cambiarColor,
    };
};
