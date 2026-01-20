export const HABIT_COLORS = [
    { id: 'red', name: 'Rojo', value: '#ef4444' },
    { id: 'orange', name: 'Naranja', value: '#f97316' },
    { id: 'yellow', name: 'Amarillo', value: '#eab308' },
    { id: 'green', name: 'Verde', value: '#22c55e' },
    { id: 'blue', name: 'Azul', value: '#3b82f6' },
    { id: 'purple', name: 'Púrpura', value: '#a855f7' },
    { id: 'pink', name: 'Rosa', value: '#ec4899' },
    { id: 'cyan', name: 'Cian', value: '#06b6d4' }
];

export const HABIT_ICONS = [
    '💪', '🏃', '📚', '💧', '🧘', '🎯', '✍️', '🎨',
    '🎵', '🌱', '🍎', '😴', '🧠', '💻', '📝', '🏋️',
    '🚴', '🧹', '📖', '🎓', '💼', '☕', '🌅', '🌙'
];

export const HABIT_CATEGORIES = [
    { id: 'salud', name: 'Salud', icon: '💪' },
    { id: 'productividad', name: 'Productividad', icon: '🎯' },
    { id: 'aprendizaje', name: 'Aprendizaje', icon: '📚' },
    { id: 'bienestar', name: 'Bienestar', icon: '🧘' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'creatividad', name: 'Creatividad', icon: '🎨' },
    { id: 'otro', name: 'Otro', icon: '⭐' }
];

export const getDayName = (dayIndex) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex];
};

export const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (weekOffset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }

    return dates;
};

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
};

export const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
};
