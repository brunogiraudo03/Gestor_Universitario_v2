import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { LogOut, AlertTriangle } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose} 
      placement="center" 
      backdrop="blur"
      size="sm"
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
          exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center pt-6">
                <div className="p-3 bg-danger/10 rounded-full text-danger mb-2">
                    <LogOut size={28} />
                </div>
                <span className="text-xl font-bold">¿Cerrar Sesión?</span>
            </ModalHeader>
            <ModalBody className="text-center pb-4">
              <p className="text-default-500">
                  ¿Estás seguro de que quieres salir? <br/>
                  Tendrás que volver a ingresar con Google.
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-center pb-6">
              <Button variant="light" onPress={onClose} className="font-medium">
                Cancelar
              </Button>
              <Button color="danger" variant="shadow" onPress={onConfirm} className="font-bold px-6">
                Sí, Salir
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;