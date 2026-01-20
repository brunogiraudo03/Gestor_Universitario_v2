import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, getDoc, setDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

/**
 * Hook personalizado para gestionar materias electivas y metas académicas.
 * 
 * Maneja tanto las materias electivas como la configuración de metas de créditos.
 * Sincroniza en tiempo real con Firestore y soporta migración de formato antiguo.
 * 
 * @returns {Object} Objeto con electivas, configuración de metas y funciones CRUD
 * @returns {Array} electivas - Array de materias electivas del usuario
 * @returns {Object} configMetas - Configuración de metas de créditos
 * @returns {boolean} loading - Estado de carga inicial
 * @returns {Function} agregarElectiva - Agregar nueva electiva
 * @returns {Function} borrarElectiva - Eliminar electiva por ID
 * @returns {Function} editarElectiva - Actualizar electiva existente
 * @returns {Function} guardarMetas - Guardar configuración de metas
 * 
 * @example
 * const { electivas, configMetas, guardarMetas } = useElectivas();
 * 
 * // Configurar metas
 * await guardarMetas({
 *   metas: [
 *     { id: 1, nombre: "Título Intermedio", creditos: 20 },
 *     { id: 2, nombre: "Título Final", creditos: 40 }
 *   ]
 * });
 */
export const useElectivas = () => {
  const { user } = useUserStore();
  const [electivas, setElectivas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [configMetas, setConfigMetas] = useState({
    metas: [
      { id: 1, nombre: "Título Final", creditos: 0 }
    ],
    configurado: false
  });

  const electivasRef = user ? collection(db, "usuarios", user.uid, "electivas") : null;
  const configRef = user ? doc(db, "usuarios", user.uid, "config", "electivas_metas") : null;

  useEffect(() => {
    if (!user || !electivasRef) return;

    // 1. Escuchar materias
    const q = query(electivasRef, orderBy("nombre"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setElectivas(datos);
    });

    // 2. Escuchar configuración
    const cargarConfig = async () => {
      try {
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!data.metas && data.meta1Nombre) {
            setConfigMetas({
              metas: [
                { id: 1, nombre: data.meta1Nombre, creditos: Number(data.meta1Creditos) || 0 },
                { id: 2, nombre: data.meta2Nombre, creditos: Number(data.meta2Creditos) || 0 }
              ],
              configurado: true
            });
          } else {
            // Carga normal
            setConfigMetas({
              ...data,
              metas: data.metas || [],
              configurado: true
            });
          }
        }
      } catch (error) {
        console.error("Error cargando config:", error);
      }
      setLoading(false);
    };
    cargarConfig();

    return () => unsubscribe();
  }, [user]);

  // CRUD
  const agregarElectiva = async (electiva) => {
    await addDoc(electivasRef, { ...electiva, createdAt: new Date() });
  };
  const borrarElectiva = async (id) => {
    await deleteDoc(doc(db, "usuarios", user.uid, "electivas", id));
  };
  const editarElectiva = async (id, nuevosDatos) => {
    await updateDoc(doc(db, "usuarios", user.uid, "electivas", id), nuevosDatos);
  };
  const guardarMetas = async (nuevasMetas) => {
    await setDoc(configRef, { ...nuevasMetas, configurado: true });
    setConfigMetas({ ...nuevasMetas, configurado: true });
  };

  return { electivas, configMetas, loading, agregarElectiva, borrarElectiva, editarElectiva, guardarMetas };
};