import { Button, User, Spacer, useDisclosure, Tooltip } from "@nextui-org/react";
import {
  LogOut, LayoutDashboard, BookOpen, Trophy,
  Network, CalendarClock, CalendarRange, Timer, LayoutGrid,
  ChevronLeft, ChevronRight, Target
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../config/firebase";
import useUserStore from "../stores/useUserStore";
import useUIStore from "../stores/useUIStore";
import LogoutModal from "./LogoutModal";

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userData, clearUser } = useUserStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

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
    { label: "Tableros", icon: LayoutGrid, path: "/tableros" },
    { label: "Hábitos", icon: Target, path: "/habitos" },
    { label: "Agenda", icon: CalendarClock, path: "/agenda" },
    { label: "Horarios", icon: CalendarRange, path: "/horarios" },
    { label: "Pomodoro", icon: Timer, path: "/pomodoro" },
  ];

  return (
    <>
      <aside className={`
        h-full flex flex-col bg-background border-r border-divider transition-all duration-300 relative z-[100] overflow-visible
        ${sidebarCollapsed ? 'w-20 p-2' : 'w-64 p-6'}
      `}>
        {/* HEADER: LOGO + TOGGLE */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center py-4' : 'justify-between px-2 py-4 mb-4'}`}>

          {/* Logo (Solo Visible Expandido) */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-primary to-secondary p-1.5 rounded-lg shadow-sm">
                <img
                  src="/negro.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">Uplanner</span>
            </div>
          )}

          {/* Toggle Button (Integrado) */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={toggleSidebar}
            className={`hidden md:flex text-default-500 hover:text-foreground hover:bg-default-100 ${sidebarCollapsed ? '' : ''}`}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* MENÚ */}
        <nav id="sidebar-menu" className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const itemId = `sidebar-item-${item.path === '/' ? 'dashboard' : item.path.substring(1)}`;

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.path} content={item.label} placement="right">
                  <Button
                    id={itemId}
                    isIconOnly
                    variant={isActive ? "flat" : "light"}
                    color={isActive ? "primary" : "default"}
                    className={`${isActive ? "" : "text-default-500 hover:text-foreground"}`}
                    onPress={() => {
                      navigate(item.path);
                      if (onClose) onClose();
                    }}
                  >
                    <item.icon size={20} />
                  </Button>
                </Tooltip>
              );
            }

            return (
              <Button
                key={item.path}
                id={itemId}
                variant={isActive ? "flat" : "light"}
                color={isActive ? "primary" : "default"}
                startContent={<item.icon size={20} />}
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
          {sidebarCollapsed ? (
            <>
              <Tooltip content="Configuración" placement="right">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => {
                    navigate("/config");
                    if (onClose) onClose();
                  }}
                  className="w-full mb-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {user?.displayName?.charAt(0) || "U"}
                  </div>
                </Button>
              </Tooltip>

              <Tooltip content="Cerrar Sesión" placement="right">
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  onPress={onOpen}
                  className="w-full"
                >
                  <LogOut size={18} />
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <div id="sidebar-user"
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
                    description: "text-default-400 text-xs truncate max-w-[140px]"
                  }}
                />
              </div>

              <Spacer y={2} />

              <Button onPress={onOpen} color="danger" variant="light" startContent={<LogOut size={18} />} fullWidth className="justify-start px-4">
                Cerrar Sesión
              </Button>
            </>
          )}
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