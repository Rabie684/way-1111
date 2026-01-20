
import React, { useState, useEffect } from 'react';

const HalEye: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const moveEye = () => {
            // نطاق حركة أفقي أوسع، وحركة عمودية طفيفة جدًا
            const newX = (Math.random() - 0.5) * 20; // نطاق من -10 إلى 10
            const newY = (Math.random() - 0.5) * 4;  // نطاق من -2 إلى 2
            setPosition({ x: newX, y: newY });

            // تعيين مهلة جديدة بتأخير عشوائي
            const randomDelay = Math.random() * 2000 + 1500; // بين 1.5 و 3.5 ثانية
            timeoutId = setTimeout(moveEye, randomDelay);
        };

        let timeoutId = setTimeout(moveEye, 1500);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div 
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] h-4 w-16 bg-black rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-black/50"
            aria-hidden="true" // إخفاء من قارئات الشاشة لأنه عنصر زخرفي
        >
            <div
                className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_2px_rgba(239,68,68,0.7)] transition-transform duration-1000 ease-in-out"
                style={{
                    transform: `translateX(${position.x}px) translateY(${position.y}px)`
                }}
            ></div>
        </div>
    );
};

export default HalEye;
