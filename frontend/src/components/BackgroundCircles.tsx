import { motion } from 'motion/react';

export function BackgroundCircles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Purple Circle - Top Left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.15, 
          scale: 1,
          y: [0, -20, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -top-20 -left-20 w-48 h-48 md:w-64 md:h-64 rounded-full"
        style={{ backgroundColor: '#652b82' }}
      />

      {/* Yellow Circle - Top Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.2, 
          scale: 1,
          y: [0, 25, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }
        }}
        className="absolute -top-32 -right-32 w-56 h-56 md:w-80 md:h-80 rounded-full"
        style={{ backgroundColor: '#fad656' }}
      />

      {/* Light Purple Circle - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.12, 
          scale: 1,
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          x: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }
        }}
        className="absolute -bottom-24 -right-24 w-52 h-52 md:w-72 md:h-72 rounded-full"
        style={{ backgroundColor: '#652b82' }}
      />

      {/* Light Yellow Circle - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 0.15, 
          scale: 1,
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          x: {
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          },
          y: {
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -bottom-32 -left-32 w-60 h-60 md:w-80 md:h-80 rounded-full"
        style={{ backgroundColor: '#fad656' }}
      />
    </div>
  );
}