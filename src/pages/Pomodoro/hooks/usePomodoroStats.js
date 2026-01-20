import { useState, useEffect, useCallback } from "react";

/**
 * Hook para rastrear estadísticas del Pomodoro
 */
export const usePomodoroStats = () => {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem("pomodoroStats");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultStats();
            }
        }
        return getDefaultStats();
    });

    function getDefaultStats() {
        return {
            totalSessions: 0,
            totalMinutes: 0,
            focusSessions: 0,
            breakSessions: 0,
            streak: 0,
            lastSessionDate: null,
            todaySessions: 0,
            todayDate: new Date().toDateString()
        };
    }

    // Guardar en localStorage cuando cambien las stats
    useEffect(() => {
        localStorage.setItem("pomodoroStats", JSON.stringify(stats));
    }, [stats]);

    // Verificar si es un nuevo día
    useEffect(() => {
        const today = new Date().toDateString();
        if (stats.todayDate !== today) {
            setStats(prev => ({
                ...prev,
                todaySessions: 0,
                todayDate: today
            }));
        }
    }, [stats.todayDate]);

    const addSession = useCallback((type, minutes) => {
        setStats(prev => {
            const today = new Date().toDateString();
            const lastDate = prev.lastSessionDate ? new Date(prev.lastSessionDate).toDateString() : null;

            // Calcular racha
            let newStreak = prev.streak;
            if (lastDate === today) {
                // Misma fecha, mantener racha
                newStreak = prev.streak;
            } else if (lastDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastDate === yesterday.toDateString()) {
                    // Día consecutivo, incrementar racha
                    newStreak = prev.streak + 1;
                } else {
                    // Se rompió la racha
                    newStreak = 1;
                }
            } else {
                // Primera sesión
                newStreak = 1;
            }

            return {
                ...prev,
                totalSessions: prev.totalSessions + 1,
                totalMinutes: prev.totalMinutes + minutes,
                focusSessions: type === "focus" ? prev.focusSessions + 1 : prev.focusSessions,
                breakSessions: type !== "focus" ? prev.breakSessions + 1 : prev.breakSessions,
                streak: newStreak,
                lastSessionDate: new Date().toISOString(),
                todaySessions: prev.todaySessions + 1
            };
        });
    }, []);

    const resetStats = useCallback(() => {
        const defaultStats = getDefaultStats();
        setStats(defaultStats);
        localStorage.setItem("pomodoroStats", JSON.stringify(defaultStats));
    }, []);

    return {
        stats,
        addSession,
        resetStats
    };
};
