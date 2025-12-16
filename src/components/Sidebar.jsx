import { Button, User, Spacer } from "@nextui-org/react";
import { 
  LogOut, LayoutDashboard, BookOpen, Trophy, 
  Network, CalendarClock, CalendarRange, Timer, School, Settings 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import useUserStore from "../stores/useUserStore";

const Sidebar = ({ onClose }) => { // Recibe onClose para cerrar el menú en móvil al hacer click
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué página estamos
  const { user, clearUser } = useUserStore();

  const handleLogout = () => {
    auth.signOut();
    clearUser();
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Plan de Estudio", icon: BookOpen, path: "/plan" },
    { label: "Electivas", icon: Trophy, path: "/electivas" },
    { label: "Correlativas", icon: Network, path: "/correlativas" },
    { label: "Agenda", icon: CalendarClock, path: "/agenda" },
    { label: "Horarios", icon: CalendarRange, path: "/horarios" },
    { label: "Pomodoro", icon: Timer, path: "/pomodoro" },
    { label: "Configuración", icon: Settings, path: "/config" },
  ];

  return (
    <aside className="h-full flex flex-col bg-background border-r border-divider p-6 w-64">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-2 mb-8">
          <div className="bg-gradient-to-tr from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <School className="text-white" size={26} />
          </div>
          <span className="text-lg font-bold tracking-tight leading-tight">Uplanner</span>
      </div>
      
      {/* MENÚ */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
                <Button 
                    key={item.path}
                    variant={isActive ? "flat" : "light"} 
                    color={isActive ? "primary" : "default"}
                    startContent={<item.icon size={20}/>} 
                    className={`justify-start font-medium ${isActive ? "" : "text-default-500 hover:text-foreground"}`}
                    onPress={() => {
                        navigate(item.path);
                        if (onClose) onClose(); // Cerrar menú en móvil
                    }}
                >
                    {item.label}
                </Button>
            )
        })}
      </nav>

      {/* USUARIO */}
      <div className="border-t border-divider pt-4 mt-2">
          <User   
              name={user?.displayName?.split(" ")[0] || "Estudiante"}
              description="Ingeniería" 
              avatarProps={{ src: user?.photoURL, size: "sm" }}
              classNames={{name: "font-bold", description: "text-default-400 text-xs"}}
          />
          <Spacer y={2} />
          <Button onPress={handleLogout} color="danger" variant="light" startContent={<LogOut size={18}/>} fullWidth className="justify-start">
              Cerrar Sesión
          </Button>
      </div>
    </aside>
  );
};

export default Sidebar;