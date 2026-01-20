import { useState, useEffect } from 'react';
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';
import { MoreVertical, Edit2, Trash2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import HabitDayCircle from './HabitDayCircle';
import { formatDate, getDayName } from '../../../utils/habitUtils';

const HabitCard = ({ habito, weekDates, completados, onToggleDay, onEdit, onDelete }) => {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        // Calcular racha actual
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let checkDate = new Date(today);

        while (true) {
            const dateStr = formatDate(checkDate);
            const isCompleted = completados.some(c => c.fecha === dateStr);

            if (isCompleted) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        setStreak(currentStreak);
    }, [completados]);

    const isDateCompleted = (date) => {
        const dateStr = formatDate(date);
        return completados.some(c => c.fecha === dateStr);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="border-2 border-default-200 hover:border-default-300 transition-colors">
                <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Icono y nombre */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ backgroundColor: `${habito.color}20` }}
                            >
                                {habito.icono}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{habito.nombre}</h3>
                                {habito.descripcion && (
                                    <p className="text-sm text-default-500 truncate">{habito.descripcion}</p>
                                )}
                            </div>
                        </div>

                        {/* Racha */}
                        {streak > 0 && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500">
                                <Flame size={16} fill="currentColor" />
                                <span className="font-bold text-sm">{streak}</span>
                            </div>
                        )}

                        {/* Días de la semana */}
                        <div className="flex gap-2">
                            {weekDates.map((date, index) => (
                                <HabitDayCircle
                                    key={index}
                                    date={date}
                                    isCompleted={isDateCompleted(date)}
                                    onToggle={() => onToggleDay(formatDate(date))}
                                    color={habito.color}
                                />
                            ))}
                        </div>

                        {/* Menú de opciones */}
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    className="text-default-400"
                                >
                                    <MoreVertical size={18} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Opciones del hábito"
                                onAction={(key) => {
                                    if (key === 'edit') onEdit();
                                    if (key === 'delete') onDelete();
                                }}
                            >
                                <DropdownItem
                                    key="edit"
                                    startContent={<Edit2 size={16} />}
                                >
                                    Editar
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<Trash2 size={16} />}
                                >
                                    Eliminar
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
};

export default HabitCard;
