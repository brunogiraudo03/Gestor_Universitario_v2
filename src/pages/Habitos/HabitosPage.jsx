import { useState, useEffect } from 'react';
import { Button, Spinner, useDisclosure } from '@nextui-org/react';
import { Plus, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitos } from '../../hooks/useHabitos';
import { getWeekDates, getDayName, formatDate } from '../../utils/habitUtils';
import HabitCard from './components/HabitCard';
import HabitModal from './components/HabitModal';
import StatsModal from './components/StatsModal';

const HabitosPage = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [weekDates, setWeekDates] = useState([]);
    const [habitoToEdit, setHabitoToEdit] = useState(null);
    const [completadosMap, setCompletadosMap] = useState({});

    const { habitos, loading, agregarHabito, editarHabito, borrarHabito, toggleCompletado, obtenerCompletados } = useHabitos();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isStatsOpen, onOpen: onStatsOpen, onOpenChange: onStatsOpenChange } = useDisclosure();

    useEffect(() => {
        setWeekDates(getWeekDates(weekOffset));
    }, [weekOffset]);

    useEffect(() => {
        // Cargar completados para todos los hábitos
        const loadCompletados = async () => {
            const map = {};
            for (const habito of habitos) {
                const completados = await obtenerCompletados(habito.id);
                map[habito.id] = completados;
            }
            setCompletadosMap(map);
        };

        if (habitos.length > 0) {
            loadCompletados();
        }
    }, [habitos, obtenerCompletados]);

    const handleCreateHabit = () => {
        setHabitoToEdit(null);
        onOpen();
    };

    const handleEditHabit = (habito) => {
        setHabitoToEdit(habito);
        onOpen();
    };

    const handleSaveHabit = async (habitoData) => {
        if (habitoToEdit) {
            await editarHabito(habitoToEdit.id, habitoData);
        } else {
            await agregarHabito(habitoData);
        }
    };

    const handleDeleteHabit = async (habitoId) => {
        if (confirm('¿Estás seguro de eliminar este hábito? Se perderán todos los registros.')) {
            await borrarHabito(habitoId);
        }
    };

    const handleToggleDay = async (habitoId, fecha) => {
        await toggleCompletado(habitoId, fecha);
        // Recargar completados para este hábito
        const completados = await obtenerCompletados(habitoId);
        setCompletadosMap(prev => ({
            ...prev,
            [habitoId]: completados
        }));
    };

    const getWeekLabel = () => {
        if (weekOffset === 0) return 'Esta Semana';
        if (weekOffset === -1) return 'Semana Pasada';
        if (weekOffset === 1) return 'Próxima Semana';

        const firstDay = weekDates[0];
        const lastDay = weekDates[6];
        return `${firstDay.getDate()}/${firstDay.getMonth() + 1} - ${lastDay.getDate()}/${lastDay.getMonth() + 1}`;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size="lg" label="Cargando hábitos..." />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-default-50">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-divider bg-background/80 backdrop-blur-md">
                <div className="px-4 md:px-8 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Seguimiento de Hábitos
                            </h1>
                            <p className="text-default-500 mt-1">
                                Construye mejores hábitos, un día a la vez
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<BarChart3 size={20} />}
                                className="hidden sm:flex"
                                onPress={onStatsOpen}
                            >
                                Estadísticas
                            </Button>
                            <Button
                                color="primary"
                                startContent={<Plus size={20} />}
                                onPress={handleCreateHabit}
                            >
                                Nuevo Hábito
                            </Button>
                        </div>
                    </div>

                    {/* Selector de semana */}
                    <div className="flex items-center justify-between">
                        <Button
                            isIconOnly
                            variant="flat"
                            onPress={() => setWeekOffset(weekOffset - 1)}
                        >
                            <ChevronLeft size={20} />
                        </Button>

                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">{getWeekLabel()}</h2>
                            {weekOffset !== 0 && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={() => setWeekOffset(0)}
                                >
                                    Hoy
                                </Button>
                            )}
                        </div>

                        <Button
                            isIconOnly
                            variant="flat"
                            onPress={() => setWeekOffset(weekOffset + 1)}
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    {/* Días de la semana */}
                    <div className="flex justify-end gap-2 mt-4">
                        {weekDates.map((date, index) => (
                            <div key={index} className="w-10 text-center">
                                <p className="text-xs font-semibold text-default-500">
                                    {getDayName(date.getDay())}
                                </p>
                                <p className="text-sm font-bold mt-1">
                                    {date.getDate()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista de hábitos */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {habitos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center"
                    >
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-2xl font-bold mb-2">No tienes hábitos aún</h3>
                        <p className="text-default-500 mb-6 max-w-md">
                            Crea tu primer hábito y comienza a construir una mejor versión de ti mismo
                        </p>
                        <Button
                            color="primary"
                            size="lg"
                            startContent={<Plus size={20} />}
                            onPress={handleCreateHabit}
                        >
                            Crear Mi Primer Hábito
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-3 max-w-6xl mx-auto">
                        <AnimatePresence>
                            {habitos.map((habito) => (
                                <HabitCard
                                    key={habito.id}
                                    habito={habito}
                                    weekDates={weekDates}
                                    completados={completadosMap[habito.id] || []}
                                    onToggleDay={(fecha) => handleToggleDay(habito.id, fecha)}
                                    onEdit={() => handleEditHabit(habito)}
                                    onDelete={() => handleDeleteHabit(habito.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal de crear/editar */}
            <HabitModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onSave={handleSaveHabit}
                habitToEdit={habitoToEdit}
            />

            {/* Modal de estadísticas */}
            <StatsModal
                isOpen={isStatsOpen}
                onOpenChange={onStatsOpenChange}
                habitos={habitos}
                completadosMap={completadosMap}
            />
        </div>
    );
};

export default HabitosPage;
