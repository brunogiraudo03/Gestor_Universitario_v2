import { useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from '@nextui-org/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Flame, TrendingUp, Calendar, Target, Award, Activity } from 'lucide-react';
import { formatDate } from '../../../utils/habitUtils';

const StatsModal = ({ isOpen, onOpenChange, habitos, completadosMap }) => {
    const stats = useMemo(() => {
        if (!habitos.length) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calcular estadísticas generales
        let totalCompletados = 0;
        let mejorRacha = 0;
        let rachaActual = 0;
        const allStreaks = [];

        habitos.forEach(habito => {
            const completados = completadosMap[habito.id] || [];
            totalCompletados += completados.length;

            // Calcular racha para este hábito
            let streak = 0;
            let checkDate = new Date(today);

            while (true) {
                const dateStr = formatDate(checkDate);
                const isCompleted = completados.some(c => c.fecha === dateStr);
                if (isCompleted) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            allStreaks.push(streak);
            if (streak > mejorRacha) mejorRacha = streak;
            rachaActual += streak;
        });

        // Datos para gráfico de línea (últimos 30 días)
        const last30DaysData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = formatDate(date);

            let completadosEnDia = 0;
            habitos.forEach(habito => {
                const completados = completadosMap[habito.id] || [];
                if (completados.some(c => c.fecha === dateStr)) {
                    completadosEnDia++;
                }
            });

            last30DaysData.push({
                dia: `${date.getDate()}/${date.getMonth() + 1}`,
                completados: completadosEnDia,
                fecha: date
            });
        }

        // Datos para gráfico de barras (últimas 4 semanas)
        const weeklyData = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            let completadosEnSemana = 0;
            habitos.forEach(habito => {
                const completados = completadosMap[habito.id] || [];
                completados.forEach(c => {
                    const fecha = new Date(c.fecha);
                    if (fecha >= weekStart && fecha <= weekEnd) {
                        completadosEnSemana++;
                    }
                });
            });

            weeklyData.push({
                semana: i === 0 ? 'Esta' : `Hace ${i}`,
                completados: completadosEnSemana
            });
        }

        // Datos para gráfico circular (por categoría)
        const categoryCounts = {};
        habitos.forEach(habito => {
            const cat = habito.categoria || 'otro';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }));

        // Tasa de cumplimiento (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let posiblesCompletados = habitos.length * 30;
        let completadosUltimos30 = 0;

        habitos.forEach(habito => {
            const completados = completadosMap[habito.id] || [];
            completados.forEach(c => {
                const fecha = new Date(c.fecha);
                if (fecha >= thirtyDaysAgo) {
                    completadosUltimos30++;
                }
            });
        });

        const tasaCumplimiento = Math.round((completadosUltimos30 / posiblesCompletados) * 100);

        // Mejor y peor día de la semana
        const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Dom-Sáb
        habitos.forEach(habito => {
            const completados = completadosMap[habito.id] || [];
            completados.forEach(c => {
                const fecha = new Date(c.fecha);
                const dayOfWeek = fecha.getDay();
                dayOfWeekCounts[dayOfWeek]++;
            });
        });

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const maxDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
        const minDay = dayOfWeekCounts.indexOf(Math.min(...dayOfWeekCounts));

        // Consistencia (porcentaje de días con al menos 1 hábito completado en últimos 30 días)
        const diasConAlgunHabito = new Set();
        habitos.forEach(habito => {
            const completados = completadosMap[habito.id] || [];
            completados.forEach(c => {
                const fecha = new Date(c.fecha);
                if (fecha >= thirtyDaysAgo) {
                    diasConAlgunHabito.add(c.fecha);
                }
            });
        });
        const consistencia = Math.round((diasConAlgunHabito.size / 30) * 100);

        return {
            totalCompletados,
            mejorRacha,
            rachaActual: Math.round(rachaActual / habitos.length),
            rachaPromedio: allStreaks.length > 0 ? Math.round(allStreaks.reduce((a, b) => a + b, 0) / allStreaks.length) : 0,
            tasaCumplimiento: isNaN(tasaCumplimiento) ? 0 : tasaCumplimiento,
            consistencia: isNaN(consistencia) ? 0 : consistencia,
            weeklyData,
            categoryData,
            last30DaysData,
            mejorDia: dayNames[maxDay],
            peorDia: dayNames[minDay],
            habitosActivos: habitos.length
        };
    }, [habitos, completadosMap]);

    if (!stats) {
        return (
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Estadísticas</ModalHeader>
                            <ModalBody>
                                <p className="text-center text-default-500 py-8">
                                    No hay datos suficientes para mostrar estadísticas
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button onPress={onClose}>Cerrar</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        );
    }

    const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#06b6d4', '#eab308'];

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="5xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">📊 Estadísticas de Hábitos</h2>
                            <p className="text-sm text-default-500 font-normal">
                                Análisis completo de tu progreso
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            {/* Métricas principales */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <Target className="text-primary" size={24} />
                                        </div>
                                        <p className="text-2xl font-bold text-primary">{stats.totalCompletados}</p>
                                        <p className="text-xs text-default-500">Total</p>
                                    </CardBody>
                                </Card>

                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <Flame className="text-orange-500" size={24} fill="currentColor" />
                                        </div>
                                        <p className="text-2xl font-bold text-orange-500">{stats.mejorRacha}</p>
                                        <p className="text-xs text-default-500">Mejor Racha</p>
                                    </CardBody>
                                </Card>

                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <Calendar className="text-green-500" size={24} />
                                        </div>
                                        <p className="text-2xl font-bold text-green-500">{stats.rachaPromedio}</p>
                                        <p className="text-xs text-default-500">Racha Prom.</p>
                                    </CardBody>
                                </Card>

                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <TrendingUp className="text-purple-500" size={24} />
                                        </div>
                                        <p className="text-2xl font-bold text-purple-500">{stats.tasaCumplimiento}%</p>
                                        <p className="text-xs text-default-500">Cumplimiento</p>
                                    </CardBody>
                                </Card>

                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <Activity className="text-cyan-500" size={24} />
                                        </div>
                                        <p className="text-2xl font-bold text-cyan-500">{stats.consistencia}%</p>
                                        <p className="text-xs text-default-500">Consistencia</p>
                                    </CardBody>
                                </Card>

                                <Card className="border-2 border-default-200">
                                    <CardBody className="text-center p-3">
                                        <div className="flex justify-center mb-1">
                                            <Award className="text-yellow-500" size={24} />
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-500">{stats.habitosActivos}</p>
                                        <p className="text-xs text-default-500">Hábitos</p>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Gráfico de tendencia (30 días) */}
                            <Card className="border-2 border-default-200 mb-4">
                                <CardBody className="p-6">
                                    <h3 className="text-lg font-bold mb-4">Tendencia de los Últimos 30 Días</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={stats.last30DaysData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis
                                                dataKey="dia"
                                                tick={{ fontSize: 10 }}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="completados"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={{ fill: '#3b82f6', r: 3 }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>

                            {/* Gráficos */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Gráfico de barras - Progreso semanal */}
                                <Card className="border-2 border-default-200">
                                    <CardBody className="p-6">
                                        <h3 className="text-lg font-bold mb-4">Progreso Semanal</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={stats.weeklyData}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <XAxis dataKey="semana" />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                                <Bar dataKey="completados" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardBody>
                                </Card>

                                {/* Gráfico circular - Distribución por categoría */}
                                <Card className="border-2 border-default-200">
                                    <CardBody className="p-6">
                                        <h3 className="text-lg font-bold mb-4">Hábitos por Categoría</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={stats.categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={70}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {stats.categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Insights adicionales */}
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20">
                                    <CardBody className="p-4">
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            📅 Mejor día: {stats.mejorDia}
                                        </p>
                                        <p className="text-xs text-default-600 mt-1">
                                            Día con más hábitos completados
                                        </p>
                                    </CardBody>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
                                    <CardBody className="p-4">
                                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            💪 Consistencia: {stats.consistencia}%
                                        </p>
                                        <p className="text-xs text-default-600 mt-1">
                                            Días activos en los últimos 30 días
                                        </p>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Mensaje motivacional */}
                            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 mt-4">
                                <CardBody className="p-6 text-center">
                                    <p className="text-lg font-semibold">
                                        {stats.tasaCumplimiento >= 80
                                            ? "¡Excelente trabajo! 🎉 Eres un campeón de los hábitos"
                                            : stats.tasaCumplimiento >= 50
                                                ? "¡Vas por buen camino! 💪 Sigue construyendo momentum"
                                                : "¡Tú puedes! 🚀 Cada día es una nueva oportunidad"}
                                    </p>
                                    <p className="text-sm text-default-600 mt-2">
                                        Has completado {stats.totalCompletados} hábitos en total • Racha actual promedio: {stats.rachaPromedio} días
                                    </p>
                                </CardBody>
                            </Card>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose}>
                                Cerrar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default StatsModal;
