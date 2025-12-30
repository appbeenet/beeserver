import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 }); // Başlangıçta ekranda görünmesin diye dışarı aldık
    const [isClicking, setIsClicking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        // Link veya buton üzerine gelince cursor büyüsün
        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    const networkBlue = '#2563eb'; // Tailwind Blue-600

    return (
        <>
            {/* pointer-events-none: ÇOK ÖNEMLİ. Bu olmazsa cursor tıklamaları engeller.
        z-[99999]: Her şeyin en üstünde olması için çok yüksek bir değer.
      */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full hidden md:block"
                animate={{
                    x: mousePosition.x - 16, // Ortalamak için (32px / 2)
                    y: mousePosition.y - 16,
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1, // Tıklayınca küçül, linkte büyü
                }}
                transition={{
                    type: "spring",
                    stiffness: 800, // Daha hızlı tepki
                    damping: 35,
                    mass: 0.5
                }}
                style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'transparent', // İÇİ BOŞ
                    border: `2px solid ${networkBlue}`, // Sadece kenarlık
                    boxShadow: `
            0 0 15px ${networkBlue},    /* Dış Işık */
            inset 0 0 10px ${networkBlue} /* İç Işık (Hüzme efekti için) */
          `,
                }}
            >
                {/* Ortada küçük bir nişangah noktası (Opsiyonel - İstersen silebilirsin ama içi boşken nişan almak zor olabilir) */}
                {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full opacity-80"></div> */}
            </motion.div>

            {/* Arkadan gelen ikinci bir takipçi (Daha yumuşak bir iz bırakır - Opsiyonel görsel şölen) */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[99998] rounded-full hidden md:block opacity-30"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                }}
                transition={{
                    type: "spring",
                    stiffness: 200, // Daha yavaş takip eder
                    damping: 20,
                }}
                style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: networkBlue,
                    boxShadow: `0 0 20px 5px ${networkBlue}`,
                }}
            />
        </>
    );
};

export default CustomCursor;