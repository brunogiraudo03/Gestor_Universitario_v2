import { Button, User, Spacer, useDisclosure } from "@nextui-org/react";
import { 
  LogOut, LayoutDashboard, BookOpen, Trophy, 
  Network, CalendarClock, CalendarRange, Timer
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import useUserStore from "../stores/useUserStore";
import LogoutModal from "./LogoutModal";

const Sidebar = ({ onClose }) => { 
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const { user, userData, clearUser } = useUserStore();
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const confirmLogout = () => {
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
  ];

  return (
    <>
      <aside className="h-full flex flex-col bg-background border-r border-divider p-6 w-64">
        {/* LOGO */}
        <div className="flex justify-center px-2 mb-8 w-full">
            <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
                <img 
                    src="/negro.png" 
                    alt="Uplanner Logo" 
                    className="w-[110px] h-[110px] object-contain mx-auto block" 
                />
            </div>
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
                          if (onClose) onClose();
                      }}
                  >
                      {item.label}
                  </Button>
              )
          })}
        </nav>

        {/* USUARIO */}
        <div className="border-t border-divider pt-4 mt-2">
            <div 
                className="cursor-pointer hover:bg-default-100 p-2 rounded-lg transition-all duration-200 group"
                onClick={() => {
                    navigate("/config");
                    if (onClose) onClose();
                }}
            >
                <User   
                    name={user?.displayName?.split(" ")[0] || "Estudiante"}
                    description={userData?.carrera || "Carrera sin definir"} 
                    avatarProps={{ 
                        src: user?.photoURL, 
                        size: "sm",
                        className: "transition-transform group-hover:scale-105"
                    }}
                    classNames={{
                        name: "font-bold group-hover:text-primary transition-colors",
                        description: "text-default-400 text-xs truncate max-w-[140px]" // truncate por si es muy largo
                    }}
                />
            </div>
            
            <Spacer y={2} />
            
            <Button onPress={onOpen} color="danger" variant="light" startContent={<LogOut size={18}/>} fullWidth className="justify-start px-4">
                Cerrar Sesión
            </Button>
        </div>
      </aside>

      <LogoutModal 
        isOpen={isOpen} 
        onClose={onOpenChange} 
        onConfirm={confirmLogout} 
      />
    </>
  );
};

export default Sidebar;