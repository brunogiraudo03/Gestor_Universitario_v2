import { BOARD_BACKGROUNDS, BOARD_ICONS } from "../../../utils/boardBackgrounds";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";

const BoardBackgroundPicker = ({ selectedBackground, onSelectBackground, selectedIcon, onSelectIcon }) => {
    const isSelectedBg = (bg) => {
        if (!selectedBackground) return false;
        return selectedBackground.id === bg.id;
    };

    return (
        <div className="space-y-6">
            {/* Selector de Icono */}
            <div>
                <p className="text-xs font-semibold text-default-500 mb-2 uppercase tracking-wide">
                    Icono del Tablero
                </p>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {BOARD_ICONS.map((icon) => (
                        <button
                            type="button"
                            key={icon}
                            onClick={() => onSelectIcon(icon)}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all
                                ${selectedIcon === icon
                                    ? 'bg-primary text-white scale-110 shadow-lg ring-2 ring-primary ring-offset-2'
                                    : 'bg-default-100 hover:bg-default-200 text-default-600'}
                            `}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Imagen Personalizada */}
            <div>
                <p className="text-xs font-semibold text-default-500 mb-2 uppercase tracking-wide">
                    Imagen Personalizada
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Pegar URL de imagen (https://...)"
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-default-200 focus:border-primary focus:outline-none text-sm"
                        value={selectedBackground?.tipo === 'image' ? selectedBackground.valor : ''}
                        onChange={(e) => onSelectBackground && onSelectBackground({
                            tipo: 'image',
                            valor: e.target.value,
                            id: 'custom'
                        })}
                    />
                </div>
                {selectedBackground?.tipo === 'image' && selectedBackground.valor && (
                    <div
                        className="mt-2 h-20 w-full rounded-lg bg-cover bg-center border-2 border-primary/50"
                        style={{ backgroundImage: `url(${selectedBackground.valor})` }}
                    />
                )}
            </div>

            {/* Gradientes */}
            <div>
                <p className="text-xs font-semibold text-default-500 mb-2 uppercase tracking-wide">
                    Fondo - Gradientes
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {BOARD_BACKGROUNDS.gradients.map((bg) => (
                        <motion.button
                            key={bg.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectBackground && onSelectBackground({ tipo: 'gradient', valor: bg.value, id: bg.id })}
                            className={`
                relative h-20 rounded-lg overflow-hidden cursor-pointer
                transition-all duration-200
                ${isSelectedBg(bg) ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-2 hover:ring-default-300'}
              `}
                            style={{ background: bg.value }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <span className="text-white text-xs font-semibold drop-shadow-lg">
                                    {bg.name}
                                </span>
                                {isSelectedBg(bg) && (
                                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Colores Sólidos */}
            <div>
                <p className="text-xs font-semibold text-default-500 mb-2 uppercase tracking-wide">
                    Fondo - Colores Sólidos
                </p>
                <div className="grid grid-cols-6 gap-3">
                    {BOARD_BACKGROUNDS.colors.map((bg) => (
                        <motion.button
                            key={bg.id}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelectBackground && onSelectBackground({ tipo: 'color', valor: bg.value, id: bg.id })}
                            className={`
                relative h-16 rounded-lg overflow-hidden cursor-pointer
                transition-all duration-200
                ${isSelectedBg(bg) ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-2 hover:ring-default-300'}
              `}
                            style={{ backgroundColor: bg.value }}
                        >
                            {isSelectedBg(bg) && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BoardBackgroundPicker;
