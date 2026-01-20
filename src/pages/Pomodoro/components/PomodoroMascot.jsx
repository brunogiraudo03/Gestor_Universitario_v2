import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MASCOT_STATES = {
    idle: {
        emoji: "🐱",
        message: "¡Listo para estudiar!",
        animation: "bounce",
        color: "text-default-500"
    },
    focusing: {
        emoji: "📚",
        message: "¡Vamos, tú puedes!",
        animation: "study",
        color: "text-primary"
    },
    tired: {
        emoji: "😅",
        message: "Ya casi terminas...",
        animation: "tired",
        color: "text-warning"
    },
    break: {
        emoji: "😴",
        message: "Descansa bien",
        animation: "sleep",
        color: "text-success"
    },
    celebrating: {
        emoji: "🎉",
        message: "¡Excelente trabajo!",
        animation: "celebrate",
        color: "text-success"
    },
    sad: {
        emoji: "💙",
        message: "No te rindas",
        animation: "sad",
        color: "text-danger"
    }
};

const PomodoroMascot = ({ state = "idle", onAnimationComplete }) => {
    const mascotData = MASCOT_STATES[state];
    const [showMessage, setShowMessage] = useState(true);

    useEffect(() => {
        setShowMessage(true);
        const timer = setTimeout(() => setShowMessage(false), 3000);
        return () => clearTimeout(timer);
    }, [state]);

    const getAnimationVariants = () => {
        switch (mascotData.animation) {
            case "bounce":
                return {
                    animate: {
                        y: [0, -10, 0],
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }
                };
            case "study":
                return {
                    animate: {
                        rotate: [-2, 2, -2],
                        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }
                };
            case "tired":
                return {
                    animate: {
                        scale: [1, 1.05, 1],
                        transition: { duration: 2, repeat: Infinity }
                    }
                };
            case "sleep":
                return {
                    animate: {
                        y: [0, 5, 0],
                        opacity: [1, 0.8, 1],
                        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }
                };
            case "celebrate":
                return {
                    animate: {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 0.5, repeat: 3 }
                    }
                };
            case "sad":
                return {
                    animate: {
                        y: [0, 3, 0],
                        transition: { duration: 1.5, repeat: Infinity }
                    }
                };
            default:
                return {};
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 select-none">
            <motion.div
                key={state}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="relative"
            >
                <motion.div
                    className={`text-9xl ${mascotData.color} drop-shadow-2xl`}
                    {...getAnimationVariants()}
                >
                    {mascotData.emoji}
                </motion.div>

                {/* Partículas decorativas */}
                {state === "celebrating" && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-2xl"
                                initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    scale: 0
                                }}
                                animate={{
                                    x: Math.cos((i / 8) * Math.PI * 2) * 100,
                                    y: Math.sin((i / 8) * Math.PI * 2) * 100,
                                    opacity: 0,
                                    scale: 1
                                }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                            >
                                ✨
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showMessage ? 1 : 0, y: showMessage ? 0 : 10 }}
                className={`text-lg font-bold ${mascotData.color} text-center px-4`}
            >
                {mascotData.message}
            </motion.p>
        </div>
    );
};

export default PomodoroMascot;
