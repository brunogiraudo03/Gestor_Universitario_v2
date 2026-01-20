import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { formatDate, isToday, isFutureDate } from '../../../utils/habitUtils';

const HabitDayCircle = ({ date, isCompleted, onToggle, color, disabled = false }) => {
    const today = isToday(date);
    const future = isFutureDate(date);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (disabled || future) return;
        setIsAnimating(true);
        onToggle();
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            disabled={disabled || future}
            whileHover={!disabled && !future ? { scale: 1.1 } : {}}
            whileTap={!disabled && !future ? { scale: 0.95 } : {}}
            className={`
                relative w-10 h-10 rounded-full transition-all duration-200
                ${future ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                ${today && !isCompleted ? 'ring-2 ring-offset-2 ring-primary' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{
                backgroundColor: isCompleted ? color : 'transparent',
                border: isCompleted ? 'none' : `2px solid ${color}40`
            }}
        >
            {isCompleted && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Check size={20} className="text-white" strokeWidth={3} />
                </motion.div>
            )}

            {isAnimating && (
                <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: color }}
                />
            )}
        </motion.button>
    );
};

export default HabitDayCircle;
