import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Palette, Sparkles, Star, Eraser } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityFooter } from './ActivityFooter';
import { AppHeader } from './AppHeader';
import { User } from '../types';
import tigerImg from 'figma:asset/d844153878e904df36a1b42e94cd19505b2fa01b.png';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

interface ColorLettersProps {
  currentLetter?: string;
  letterName?: string;
 
}

export function ColorLetters({ currentLetter: propLetter, letterName}: ColorLettersProps) {
  const [selectedColor, setSelectedColor] = useState('#652b82');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [brushSize, setBrushSize] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    { name: 'بنفسجي', value: '#652b82' },
    { name: 'أصفر', value: '#fad656' },
    { name: 'أحمر', value: '#EF4444' },
    { name: 'أزرق', value: '#3B82F6' },
    { name: 'أخضر', value: '#10B981' },
    { name: 'وردي', value: '#EC4899' },
    { name: 'برتقالي', value: '#F97316' },
    { name: 'سماوي', value: '#06B6D4' },
    { name: 'أرجواني', value: '#A855F7' },
  ];

  if (!propLetter || !letterName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-3">🎨</div>
          <p className="text-base text-gray-400">اختر حرفاً من صفحة الحروف</p>
        </div>
      </div>
    );
  }

  const currentLetter = propLetter;

  // رسم الكانفاس
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // مسح الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم الحرف كحدود خارجية
    ctx.save();
    ctx.font = 'bold 300px Arial, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 4;
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2);
    ctx.restore();

    // رسم المسارات الملونة
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // رسم المسار الحالي
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      currentStroke.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [currentLetter, strokes, currentStroke, selectedColor, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = getPoint(e, rect);
    setCurrentStroke([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = getPoint(e, rect);
    setCurrentStroke(prev => [...prev, point]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes(prev => [...prev, { points: currentStroke, color: selectedColor }]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const getPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    rect: DOMRect
  ): Point => {
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  return (
    <div className="relative overflow-hidden pb-24" dir="rtl">
      {/* خلفية متدرجة ملونة */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-yellow-50 to-purple-50"></div>
      
      {/* دوائر ملونة في الخلفية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: '#fad656' }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: '#652b82' }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* المحتوى الرئيسي */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="max-w-5xl w-full">
            {/* العنوان */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl mb-3" style={{ color: '#652b82' }}>
                🎨 لوّن حرف {letterName} 🎨
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                استخدم الألوان الجميلة لتلوين الحرف بإبداع
              </p>
            </motion.div>

            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
              {/* Canvas */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-3xl border-4 overflow-hidden shadow-2xl" style={{ borderColor: '#fad656' }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className="w-full h-auto cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                {/* زر المسح */}
                <motion.div className="mt-6 flex justify-center">
                  <motion.button
                    onClick={clearCanvas}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl text-white text-lg"
                    style={{ backgroundColor: '#ef4444' }}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eraser className="w-6 h-6" />
                    <span>مسح الكل</span>
                    <RotateCcw className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* لوحة الألوان والأدوات */}
              <div className="space-y-6">
                {/* لوحة الألوان */}
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#fad656' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl md:text-2xl mb-5 text-center" style={{ color: '#652b82' }}>
                    🎨 لوحة الألوان
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {colors.map((color, index) => (
                      <motion.button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`relative w-full aspect-square rounded-2xl shadow-lg transition-all ${
                          selectedColor === color.value ? 'ring-4 ring-offset-4' : ''
                        }`}
                        style={{
                          backgroundColor: color.value,
                          ringColor: color.value
                        }}
                        title={color.name}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {selectedColor === color.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center h-full"
                          >
                            <Star className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* حجم الفرشاة */}
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#652b82' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl mb-4 text-center" style={{ color: '#652b82' }}>
                    ✏️ حجم الفرشاة
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #652b82 0%, #fad656 50%, #652b82 100%)`
                      }}
                    />
                    <div className="flex justify-center">
                      <div
                        className="rounded-full shadow-lg"
                        style={{
                          width: `${brushSize * 2}px`,
                          height: `${brushSize * 2}px`,
                          backgroundColor: selectedColor,
                        }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      الحجم: {brushSize}
                    </p>
                  </div>
                </motion.div>

                {/* نصائح التلوين */}
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#fad656' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl md:text-2xl mb-4 text-center" style={{ color: '#652b82' }}>
                    💡 نصائح
                  </h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="bg-purple-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">🎨</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>استخدم ألوان متنوعة</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-yellow-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">✨</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>لوّن بعناية وإبداع</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-purple-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">🌈</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>استمتع بالتلوين</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* رسالة تشجيعية */}
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#fad656' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🌟</div>
                    <p className="text-base" style={{ color: '#652b82' }}>
                      رائع! لوحتك جميلة جداً
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* رسالة تحفيزية أسفل */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl border-4" style={{ borderColor: '#fad656' }}>
                <p className="text-xl md:text-2xl text-gray-700">
                  ✨ أنت فنان مبدع! استمر في التلوين الجميل ✨
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* النمر في الزاوية */}
        <motion.div
          className="fixed bottom-2 left-2 md:bottom-4 md:left-4 z-20"
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.5
          }}
        >
          <motion.img
            src={tigerImg}
            alt="نمر"
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Activity Footer */}
     
        <ActivityFooter 
          currentLetter={currentLetter}
          letterName={letterName}
        />
    </div>
  );
}