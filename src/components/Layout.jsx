import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button, Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";
import { Menu, School } from "lucide-react";

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      
      {/* --- SIDEBAR DE ESCRITORIO (Oculto en móvil) --- */}
      <div className="hidden md:flex h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- NAVBAR MÓVIL (Solo visible en celular) --- */}
        <div className="md:hidden">
            <Navbar isBordered className="bg-background/80 backdrop-blur-md">
                <NavbarContent justify="start">
                    <Button isIconOnly variant="light" onPress={() => setIsMenuOpen(true)}>
                        <Menu size={24} />
                    </Button>
                </NavbarContent>
                <NavbarContent justify="center">
                    <NavbarBrand className="gap-2">
                        <School className="text-primary" size={24}/>
                        <p className="font-bold text-inherit">Gestor Univ.</p>
                    </NavbarBrand>
                </NavbarContent>
                <NavbarContent justify="end">
                    {/* Espacio vacío para equilibrar */}
                    <div className="w-8"></div> 
                </NavbarContent>
            </Navbar>
        </div>

        {/* El contenido de la página va aquí */}
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>

      {/* --- SIDEBAR MÓVIL (OVERLAY) --- */}
      {/* Fondo oscuro al abrir menú */}
      {isMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* El menú deslizante */}
      <div className={`
          fixed top-0 left-0 h-full w-64 bg-background z-50 transform transition-transform duration-300 md:hidden shadow-2xl
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
          <Sidebar onClose={() => setIsMenuOpen(false)} />
      </div>

    </div>
  );
};

export default Layout;