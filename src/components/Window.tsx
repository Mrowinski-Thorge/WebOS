import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOS } from '../context/OSContext';
import { cn } from '../utils/cn';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  onFocus: () => void;
  initialPosition?: { x: number; y: number };
  isMinimized?: boolean;
}

export function Window({ title, children, isOpen, onClose, onMinimize, isActive, onFocus, initialPosition = { x: 100, y: 100 }, isMinimized }: WindowProps) {
  const { glassStyle, theme } = useOS();
  const controls = useDragControls();
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragControls={controls}
      dragMomentum={false}
      initial={initialPosition}
      onDragStart={onFocus}
      onClick={onFocus}
      style={{ display: isMinimized ? 'none' : 'flex' }}
      className={cn(
        "absolute rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 border",
        // Theme & Glass Styles
        theme === 'dark' ? "text-white" : "text-gray-900",
        glassStyle === 'frosted'
            ? "backdrop-blur-[20px] bg-black/40 border-white/10"
            : "backdrop-blur-[2px] bg-white/5 border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]", // Liquid look
        isActive ? "shadow-2xl z-50 ring-1 ring-white/20" : "shadow-lg z-10 opacity-90 grayscale-[0.2]",
        isMaximized ? "!top-0 !left-0 !w-full !h-full !transform-none !rounded-none" : "w-[800px] h-[600px]"
      )}
    >
      {/* Title Bar */}
      <div
        className="h-10 flex items-center justify-between px-4 select-none cursor-default bg-white/5 border-b border-white/10"
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="flex items-center gap-2">
           {/* Traffic Lights */}
           <div className="flex gap-2 group">
             <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
             <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
             <button onClick={() => setIsMaximized(!isMaximized)} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
           </div>
           <span className="ml-4 text-sm font-medium opacity-80">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 relative">
        {children}
      </div>
    </motion.div>
  );
}
