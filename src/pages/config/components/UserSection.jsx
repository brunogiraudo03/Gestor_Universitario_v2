import { useState, useEffect } from "react";
import { Card, CardBody, Input, Button, User, Divider, Chip } from "@nextui-org/react";
import { Save, GraduationCap, University, Calendar, User as UserIcon } from "lucide-react";
import useUserStore from "../../../stores/useUserStore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth"; // Importante para actualizar nombre
import { auth, db } from "../../../config/firebase";
import { toast } from "sonner";

const UserSection = () => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  // Cargar datos
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setNombre(user.displayName || ""); // Cargar nombre actual
        try {
            const docRef = doc(db, "usuarios", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setCarrera(data.carrera || "");
                setUniversidad(data.universidad || "");
                setFechaNacimiento(data.fechaNacimiento || "");
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // 1. Actualizar Nombre en Auth (Firebase User)
      if (auth.currentUser && nombre !== user.displayName) {
          await updateProfile(auth.currentUser, { displayName: nombre });
      }

      // 2. Actualizar Datos en Firestore
      await updateDoc(doc(db, "usuarios", user.uid), { 
        carrera,
        universidad,
        fechaNacimiento
      });

      toast.success("Perfil actualizado correctamente. Recarga la página para ver el nombre nuevo.");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar perfil.");
    }
    setLoading(false);
  };

  return (
    <Card className="border border-default-100 shadow-sm">
        <CardBody className="p-6 gap-6">
            
            {/* Cabecera Visual */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <User   
                    name={<span className="text-lg font-bold">{nombre || user?.displayName}</span>}
                    description={user?.email}
                    avatarProps={{ 
                        src: user?.photoURL, 
                        size: "lg", 
                        isBordered: true, 
                        color: "primary" 
                    }}
                />
                <Chip variant="flat" color="primary" className="font-medium">Estudiante</Chip>
            </div>
            
            <Divider />

            {/* Formulario */}
            <div className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider">Datos Personales</h3>
                
                {/* Input Nombre (Nuevo) */}
                <Input 
                    label="Nombre Completo" 
                    placeholder="Tu nombre" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<UserIcon className="text-default-400" size={18}/>}
                    classNames={{ inputWrapper: "bg-default-50 hover:bg-default-100 transition-colors" }}
                />

                <Input 
                    label="Carrera" 
                    placeholder="Ej: Ingeniería en Sistemas" 
                    value={carrera} 
                    onChange={(e) => setCarrera(e.target.value)}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<GraduationCap className="text-default-400" size={18}/>}
                    classNames={{ inputWrapper: "bg-default-50 hover:bg-default-100 transition-colors" }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input 
                        label="Universidad" 
                        placeholder="Ej: UTN, UBA" 
                        value={universidad} 
                        onChange={(e) => setUniversidad(e.target.value)}
                        variant="bordered"
                        labelPlacement="outside"
                        startContent={<University className="text-default-400" size={18}/>}
                        classNames={{ inputWrapper: "bg-default-50 hover:bg-default-100 transition-colors" }}
                    />

                    <Input 
                        type="date"
                        label="Fecha de Nacimiento" 
                        value={fechaNacimiento} 
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        variant="bordered"
                        labelPlacement="outside"
                        startContent={<Calendar className="text-default-400" size={18}/>}
                        classNames={{ inputWrapper: "bg-default-50 hover:bg-default-100 transition-colors" }}
                    />
                </div>

                <div className="flex justify-end mt-2">
                    <Button 
                        color="primary" 
                        onPress={handleSaveProfile} 
                        isLoading={loading} 
                        startContent={<Save size={18}/>}
                        className="font-semibold shadow-md shadow-primary/20"
                    >
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </CardBody>
    </Card>
  );
};

export default UserSection;