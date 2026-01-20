import React from "react";
import { motion } from "framer-motion";

const BookLoader = ({ label = "Cargando..." }) => {
    const bookVariants = {
        initial: { scale: 0.9, rotateX: 30, rotateY: -10 },
        animate: { scale: 1, rotateX: 10, rotateY: 0, transition: { duration: 0.8, ease: "easeOut" } }, // Faster entrance
        exit: { scale: 0.9, rotateX: 30, rotateY: -10, transition: { duration: 0.5, ease: "easeIn" } }
    };

    const coverVariants = {
        initial: { rotateY: 0 },
        animate: {
            rotateY: -180,
            transition: { duration: 0.8, ease: "easeInOut" }
        },
        exit: {
            rotateY: 0,
            transition: { duration: 0.5, ease: "easeInOut" } // Ensure clean close
        }
    };

    // Improved page physics: Staggered flip -> Quick close reset
    const pageVariants = {
        initial: { rotateY: 0, zIndex: 1 },
        animate: (i) => ({
            rotateY: -180,
            zIndex: i + 5,
            transition: {
                duration: 1.5,
                delay: 0.8 + (i * 0.2), // Wait for cover to open fully
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
            }
        }),
        exit: {
            rotateY: 0,
            zIndex: 1,
            transition: { duration: 0.3 } // Pages snap shut quickly inside cover
        }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-8 md:gap-12 w-full px-4"
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Wrapper to keep book centered when it opens */}
            <div
                className="scale-75 md:scale-100"
                style={{
                    width: "100%",
                    maxWidth: 320, // Double the book width to accommodate the open state
                    height: 208,
                    perspective: "1200px",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto"
                }}
            >
                {/* Inner container positioned to center the closed book */}
                <div style={{
                    width: 160,
                    height: 208,
                    position: "relative",
                    marginLeft: "80px" // Offset to keep book centered when it opens to the left
                }}>
                    <motion.div
                        style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
                        variants={bookVariants}
                    >

                        {/* BASE / BACK COVER */}
                        <div
                            className="absolute inset-0 bg-[#0f172a] rounded-r-lg rounded-l-sm border-l-[14px] border-[#1e293b]"
                            style={{
                                transform: "translateZ(-4px)",
                                boxShadow: "25px 25px 50px rgba(0,0,0,0.5)"
                            }}
                        />

                        {/* STATIC RIGHT PAGES BLOCK */}
                        <div className="absolute top-1 bottom-1 right-1 w-[calc(100%-16px)] bg-white rounded-r-md border-l border-gray-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-400/30 via-transparent to-transparent opacity-50 rounded-r-md" />
                            <div className="absolute right-0 top-1 bottom-1 w-1 bg-gray-100 border-l border-gray-300" />
                        </div>

                        {/* FLIPPING PAGES */}
                        {[0, 1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                custom={i}
                                variants={pageVariants}
                                className="absolute top-1 bottom-1 right-1 w-[calc(100%-16px)] bg-white rounded-r-md origin-left"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* FRONT SIDE */}
                                <div
                                    className="absolute inset-0 bg-white rounded-r-md flex flex-col justify-start p-4 gap-3 border-r border-gray-200"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    {/* Spine Shadow */}
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-300/60 to-transparent" />

                                    {/* Text Lines */}
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                                    <div className="w-5/6 h-1.5 bg-gray-200 rounded-full" />
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2" />
                                    <div className="w-4/5 h-1.5 bg-gray-200 rounded-full" />
                                </div>

                                {/* BACK SIDE */}
                                <div
                                    className="absolute inset-0 bg-white rounded-l-md flex flex-col justify-start p-4 gap-3 border-l border-gray-200"
                                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-300/60 to-transparent" />
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                                    <div className="w-3/4 h-1.5 bg-gray-200 rounded-full" />
                                    <div className="absolute inset-0 bg-black/5 rounded-l-md" />
                                </div>
                            </motion.div>
                        ))}

                        {/* FRONT COVER */}
                        <motion.div
                            variants={coverVariants}
                            className="absolute inset-0 bg-[#1e293b] rounded-r-lg rounded-l-sm origin-left border-l-[3px] border-[#334155] z-50 flex items-center justify-center overflow-hidden"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                            {/* Decorative Spine visual on cover */}
                            <div className="absolute left-0 top-0 bottom-0 w-5 bg-[#0f172a] shadow-2xl" />

                            <div
                                className="flex flex-col items-center gap-2 pl-4"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <div className="w-14 h-14 border-[3px] border-amber-500/80 rounded-full flex items-center justify-center shadow-lg bg-[#1e293b]">
                                    <span className="text-amber-500 font-serif font-bold text-3xl pb-1">U</span>
                                </div>
                            </div>

                            <div
                                className="absolute inset-0 bg-[#334155]"
                                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/30 to-transparent" />
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>

            {label && (
                <motion.span
                    className="text-primary font-bold tracking-[0.2em] text-xs uppercase"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                >
                    {label}
                </motion.span>
            )}
        </motion.div>
    );
};

export default BookLoader;
