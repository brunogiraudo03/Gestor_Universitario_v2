import { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, ScrollShadow, Checkbox, Chip
} from "@nextui-org/react";
import { Check, Plus, Trash2, Clock, CalendarDays } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#71717a", "#78716c", "#0f172a"
];

// Estado inicial para una franja horaria por día
const defaultSlot = () => ({ inicio: "08:00", fin: "10:00" });

// Estado inicial para modo CREAR (multi-día)
const defaultCreateState = () => ({
  materia: "",
  comision: "",
  aula: "",
  color: "#3b82f6",
  // días seleccionados: { "Lunes": [{ inicio, fin }, ...], ... }
  diasSlots: {},
});

// Estado inicial para modo EDITAR (un solo registro)
const defaultEditState = (data) => ({
  materia: data.materia || "",
  comision: data.comision || "",
  aula: data.aula || "",
  color: data.color || "#3b82f6",
  dia: data.dia || "Lunes",
  inicio: data.inicio || "08:00",
  fin: data.fin || "10:00",
});

const HorariosForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;

  // EDIT MODE state
  const [editData, setEditData] = useState(defaultEditState({}));

  // CREATE MODE state
  const [createData, setCreateData] = useState(defaultCreateState());

  // Reset al abrir/cerrar o cambiar item
  useEffect(() => {
    if (isEditing) {
      setEditData(defaultEditState(initialData));
    } else {
      setCreateData(defaultCreateState());
    }
  }, [initialData, isOpen]);

  // ── HANDLERS MODO EDITAR ──────────────────────────────
  const handleEditChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const handleEditSubmit = () => {
    if (!editData.materia.trim()) return;
    const { materia, comision, aula, color, dia, inicio, fin } = editData;
    onSubmit({ materia, comision, aula, color, dia, inicio, fin });
  };

  // ── HANDLERS MODO CREAR (multi-día) ──────────────────
  const handleCreateChange = (key, value) => {
    setCreateData(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day) => {
    setCreateData(prev => {
      const newDias = { ...prev.diasSlots };
      if (newDias[day]) {
        delete newDias[day];
      } else {
        newDias[day] = [defaultSlot()];
      }
      return { ...prev, diasSlots: newDias };
    });
  };

  const addSlotToDay = (day) => {
    setCreateData(prev => {
      const slots = prev.diasSlots[day] || [];
      return {
        ...prev,
        diasSlots: {
          ...prev.diasSlots,
          [day]: [...slots, defaultSlot()],
        },
      };
    });
  };

  const removeSlotFromDay = (day, idx) => {
    setCreateData(prev => {
      const slots = [...(prev.diasSlots[day] || [])];
      if (slots.length <= 1) {
        // Si solo hay un slot y lo borran, deseleccionamos el día
        const newDias = { ...prev.diasSlots };
        delete newDias[day];
        return { ...prev, diasSlots: newDias };
      }
      slots.splice(idx, 1);
      return { ...prev, diasSlots: { ...prev.diasSlots, [day]: slots } };
    });
  };

  const updateSlot = (day, idx, key, value) => {
    setCreateData(prev => {
      const slots = [...(prev.diasSlots[day] || [])];
      slots[idx] = { ...slots[idx], [key]: value };
      return { ...prev, diasSlots: { ...prev.diasSlots, [day]: slots } };
    });
  };

  const handleCreateSubmit = () => {
    if (!createData.materia.trim()) return;
    const { materia, comision, aula, color, diasSlots } = createData;
    const selectedDays = Object.keys(diasSlots);
    if (selectedDays.length === 0) return;

    // Creamos un registro por cada día+slot
    const records = [];
    selectedDays.forEach(day => {
      (diasSlots[day] || []).forEach(slot => {
        records.push({ materia, comision, aula, color, dia: day, inicio: slot.inicio, fin: slot.fin });
      });
    });

    onSubmit(records); // array de registros
  };

  const selectedDaysCount = Object.keys(createData.diasSlots).length;
  const canCreateSubmit = createData.materia.trim() && selectedDaysCount > 0;

  // ── RENDER ─────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isEditing ? "Editar Clase" : "Agregar Clase al Horario"}
              <span className="text-sm font-normal text-default-400">
                {isEditing
                  ? "Modificá los datos de esta clase"
                  : "Completá los datos y seleccioná los días de cursada"}
              </span>
            </ModalHeader>

            <ModalBody className="gap-5 scrollbar-hide">
              {/* ── CAMPOS COMUNES ── */}
              <div className="flex gap-3">
                <Input
                  autoFocus
                  label="Materia *"
                  placeholder="Ej: Análisis Matemático II"
                  value={isEditing ? editData.materia : createData.materia}
                  onValueChange={(v) => isEditing ? handleEditChange("materia", v) : handleCreateChange("materia", v)}
                  className="flex-1"
                  variant="bordered"
                />
                <Input
                  label="Comisión"
                  placeholder="Ej: 1K4"
                  value={isEditing ? editData.comision : createData.comision}
                  onValueChange={(v) => isEditing ? handleEditChange("comision", v) : handleCreateChange("comision", v)}
                  className="w-1/3"
                  variant="bordered"
                />
              </div>

              <Input
                label="Aula / Edificio"
                placeholder="Ej: Aula 204 – Edificio B"
                value={isEditing ? editData.aula : createData.aula}
                onValueChange={(v) => isEditing ? handleEditChange("aula", v) : handleCreateChange("aula", v)}
                variant="bordered"
              />

              {/* ── COLOR ── */}
              <div>
                <label className="text-small font-medium text-default-700 block mb-2">Color de etiqueta</label>
                <ScrollShadow orientation="horizontal" className="pb-2 scrollbar-hide">
                  <div className="flex gap-2">
                    {COLORS.map((c) => {
                      const currentColor = isEditing ? editData.color : createData.color;
                      return (
                        <button
                          key={c}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${currentColor === c ? 'border-default-foreground scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                          onClick={() => isEditing ? handleEditChange("color", c) : handleCreateChange("color", c)}
                          type="button"
                        >
                          {currentColor === c && <Check size={14} className="text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollShadow>
              </div>

              {/* ── MODO EDITAR: campos de día y hora fijos ── */}
              {isEditing && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <label className="text-small font-medium text-default-700 block mb-2">Día de cursada</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleEditChange("dia", day)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${editData.dia === day
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-default-200 text-default-500 hover:border-default-400'}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input type="time" label="Inicio" value={editData.inicio} onValueChange={(v) => handleEditChange("inicio", v)} variant="bordered" />
                  <Input type="time" label="Fin" value={editData.fin} onValueChange={(v) => handleEditChange("fin", v)} variant="bordered" />
                </div>
              )}

              {/* ── MODO CREAR: selector multi-día ── */}
              {!isEditing && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={16} className="text-primary" />
                    <label className="text-small font-semibold text-default-700">
                      Días de cursada
                    </label>
                    {selectedDaysCount > 0 && (
                      <Chip size="sm" color="primary" variant="flat">{selectedDaysCount} día{selectedDaysCount !== 1 ? 's' : ''}</Chip>
                    )}
                  </div>

                  {/* Botones de día */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {DAYS.map(day => {
                      const isSelected = !!createData.diasSlots[day];
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${isSelected
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-default-200 text-default-500 hover:border-default-400'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Si no hay días seleccionados */}
                  {selectedDaysCount === 0 && (
                    <p className="text-sm text-default-400 italic text-center py-3 bg-default-50 rounded-xl border border-dashed border-default-200">
                      Seleccioná al menos un día para continuar
                    </p>
                  )}

                  {/* Slots horarios por día seleccionado */}
                  <div className="space-y-4">
                    {DAYS.filter(day => createData.diasSlots[day]).map(day => (
                      <div key={day} className="bg-default-50 dark:bg-default-100/50 rounded-xl p-3 border border-default-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-sm text-foreground flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: createData.color }}
                            />
                            {day}
                          </span>
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Plus size={14} />}
                            onPress={() => addSlotToDay(day)}
                          >
                            Agregar franja
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(createData.diasSlots[day] || []).map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-background rounded-lg p-2 border border-default-100">
                              <Clock size={14} className="text-default-400 flex-shrink-0" />
                              <Input
                                type="time"
                                label="Inicio"
                                size="sm"
                                value={slot.inicio}
                                onValueChange={(v) => updateSlot(day, idx, "inicio", v)}
                                className="flex-1"
                                variant="flat"
                              />
                              <span className="text-default-400 font-semibold text-sm">→</span>
                              <Input
                                type="time"
                                label="Fin"
                                size="sm"
                                value={slot.fin}
                                onValueChange={(v) => updateSlot(day, idx, "fin", v)}
                                className="flex-1"
                                variant="flat"
                              />
                              {(createData.diasSlots[day].length > 1 || true) && (
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  isIconOnly
                                  onPress={() => removeSlotFromDay(day, idx)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onModalClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                className="font-bold"
                onPress={isEditing ? handleEditSubmit : handleCreateSubmit}
                isDisabled={isEditing ? !editData.materia.trim() : !canCreateSubmit}
              >
                {isEditing
                  ? "Guardar Cambios"
                  : `Agregar ${selectedDaysCount > 0
                    ? `(${Object.values(createData.diasSlots).reduce((acc, slots) => acc + slots.length, 0)} clase${Object.values(createData.diasSlots).reduce((acc, slots) => acc + slots.length, 0) !== 1 ? 's' : ''})`
                    : "Clase"}`
                }
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default HorariosForm;