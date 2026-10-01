import { motion } from 'motion/react';

interface LetterCardProps {
  letter: string;
  letterName: string;
  onClick: () => void;
  index: number;
}

export function LetterCard({ letter, letterName, onClick, index }: LetterCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        duration: 0.2,
        delay: index * 0.01
      }}
      className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-gray-300 transition-all flex flex-col items-center justify-center w-full aspect-square group"
      style={{
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#fad656';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <div 
        className="text-2xl"
        style={{ color: '#652b82' }}
      >
        {letter}
      </div>
    </motion.button>
  );
}