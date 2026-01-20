import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook mejorado para el timer de Pomodoro
 * Usa requestAnimationFrame para mayor precisión y eliminar delays
 */
export const usePomodoroTimer = (initialMinutes, onComplete) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const startTimeRef = useRef(null);
    const pausedTimeRef = useRef(null);
    const rafRef = useRef(null);

    const tick = useCallback(() => {
        if (!startTimeRef.current) return;

        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const newTime = Math.max(0, (initialMinutes * 60) - elapsed);

        setTimeLeft(newTime);

        if (newTime > 0) {
            rafRef.current = requestAnimationFrame(tick);
        } else {
            setIsActive(false);
            startTimeRef.current = null;
            if (onComplete) onComplete();
        }
    }, [initialMinutes, onComplete]);

    useEffect(() => {
        if (isActive) {
            if (!startTimeRef.current) {
                // Calcular el tiempo de inicio basado en el tiempo restante
                const elapsed = (initialMinutes * 60) - timeLeft;
                startTimeRef.current = Date.now() - (elapsed * 1000);
            }
            rafRef.current = requestAnimationFrame(tick);
        } else {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [isActive, tick, initialMinutes, timeLeft]);

    const start = useCallback(() => {
        setIsActive(true);
    }, []);

    const pause = useCallback(() => {
        setIsActive(false);
        pausedTimeRef.current = timeLeft;
    }, [timeLeft]);

    const reset = useCallback(() => {
        setIsActive(false);
        setTimeLeft(initialMinutes * 60);
        startTimeRef.current = null;
        pausedTimeRef.current = null;
    }, [initialMinutes]);

    const toggle = useCallback(() => {
        setIsActive(prev => !prev);
    }, []);

    return {
        timeLeft,
        isActive,
        start,
        pause,
        reset,
        toggle,
        progress: ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100
    };
};
