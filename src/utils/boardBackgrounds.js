/**
 * Colores predefinidos para listas
 */
export const LIST_COLORS = [
    { id: 'none', name: 'Sin color', value: null, class: '' },
    { id: 'red', name: 'Rojo', value: '#ef4444', class: 'bg-red-500' },
    { id: 'orange', name: 'Naranja', value: '#f97316', class: 'bg-orange-500' },
    { id: 'yellow', name: 'Amarillo', value: '#eab308', class: 'bg-yellow-500' },
    { id: 'green', name: 'Verde', value: '#22c55e', class: 'bg-green-500' },
    { id: 'blue', name: 'Azul', value: '#3b82f6', class: 'bg-blue-500' },
    { id: 'purple', name: 'Púrpura', value: '#a855f7', class: 'bg-purple-500' },
    { id: 'pink', name: 'Rosa', value: '#ec4899', class: 'bg-pink-500' },
    { id: 'gray', name: 'Gris', value: '#6b7280', class: 'bg-gray-500' }
];

/**
 * Fondos predefinidos para tableros
 * Incluye gradientes hermosos y colores sólidos
 */

export const BOARD_BACKGROUNDS = {
    gradients: [
        {
            id: 'aurora',
            name: 'Aurora',
            emoji: '🌌',
            value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
            preview: 'from-[#00c6ff] to-[#0072ff]'
        },
        {
            id: 'nebula',
            name: 'Nebula',
            emoji: '👾',
            value: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
            preview: 'from-[#8E2DE2] to-[#4A00E0]'
        },
        {
            id: 'midnight',
            name: 'Midnight',
            emoji: '🌃',
            value: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            preview: 'from-[#232526] to-[#414345]'
        },
        {
            id: 'deepsea',
            name: 'Deep Sea',
            emoji: '🐋',
            value: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
            preview: 'from-[#1A2980] to-[#26D0CE]'
        },
        {
            id: 'sunset',
            name: 'Sunset',
            emoji: '🌅',
            value: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
            preview: 'from-[#ff9966] to-[#ff5e62]'
        },
        {
            id: 'forest',
            name: 'Forest',
            emoji: '🌲',
            value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
            preview: 'from-[#134E5E] to-[#71B280]'
        }
    ],
    colors: [
        {
            id: 'slate',
            name: 'Slate',
            emoji: '⚫',
            value: '#1e293b',
            preview: 'bg-[#1e293b]'
        },
        {
            id: 'emerald',
            name: 'Emerald',
            emoji: '🟢',
            value: '#059669',
            preview: 'bg-[#059669]'
        },
        {
            id: 'purple',
            name: 'Purple',
            emoji: '🟣',
            value: '#7c3aed',
            preview: 'bg-[#7c3aed]'
        },
        {
            id: 'orange',
            name: 'Orange',
            emoji: '🟠',
            value: '#ea580c',
            preview: 'bg-[#ea580c]'
        },
        {
            id: 'blue',
            name: 'Blue',
            emoji: '🔵',
            value: '#2563eb',
            preview: 'bg-[#2563eb]'
        },
        {
            id: 'rose',
            name: 'Rose',
            emoji: '🌹',
            value: '#e11d48',
            preview: 'bg-[#e11d48]'
        }
    ]
};

export const getBackgroundStyle = (fondo) => {
    if (!fondo) return { background: '#1e293b' };

    if (fondo.tipo === 'gradient') {
        return { background: fondo.valor };
    }

    if (fondo.tipo === 'image') {
        return {
            backgroundImage: `url(${fondo.valor})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };
    }

    return { backgroundColor: fondo.valor };
};

export const getDefaultBackground = () => ({
    tipo: 'gradient',
    valor: BOARD_BACKGROUNDS.gradients[0].value,
    id: BOARD_BACKGROUNDS.gradients[0].id
});

export const BOARD_ICONS = [
    "📋", "🚀", "🎓", "💼", "📅", "💡", "🎯", "🤖",
    "🎨", "🎵", "🎮", "🌍", "🏠", "❤️", "⭐", "🔥",
    "⚠️", "✅", "📚", "✏️", "💻", "📊", "🏆", "⏰"
];
