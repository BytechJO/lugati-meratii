import { Volume2, Play, Pause, Award, Star, Music, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ActivityFooter } from './ActivityFooter';
import { progressTracking } from '../utils/progressTracking';
import { storage } from '../utils/storage';
import { AppHeader } from './AppHeader';
import { User } from '../types';
import tigerImg from 'figma:asset/d844153878e904df36a1b42e94cd19505b2fa01b.png';

interface LetterSoundsProps {
  currentLetter?: string;
  letterName?: string;
  onBack?: () => void;
  onActivityChange?: (activity: string) => void;
  user?: User;
  onLogout?: () => void;
}

const arabicLetters = [
  { letter: 'أ', name: 'ألف', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/alif--_ar_1.mp3', word: 'أسد', emoji: '🦁' },
  { letter: 'ب', name: 'باء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/ba--_ar_1.mp3', word: 'بطة', emoji: '🦆' },
  { letter: 'ت', name: 'تاء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/ta--_ar_1.mp3', word: 'تفاحة', emoji: '🍎' },
  { letter: 'ث', name: 'ثاء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/tha--_ar_1.mp3', word: 'ثعلب', emoji: '🦊' },
  { letter: 'ج', name: 'جيم', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/jim--_ar_1.mp3', word: 'جمل', emoji: '🐪' },
  { letter: 'ح', name: 'حاء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/ha--_ar_1.mp3', word: 'حصان', emoji: '🐴' },
  { letter: 'خ', name: 'خاء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/kha--_ar_1.mp3', word: 'خروف', emoji: '🐑' },
  { letter: 'د', name: 'دال', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/dal--_ar_1.mp3', word: 'دب', emoji: '🐻' },
  { letter: 'ذ', name: 'ذال', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/dhal--_ar_1.mp3', word: 'ذئب', emoji: '🐺' },
  { letter: 'ر', name: 'راء', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/ra--_ar_1.mp3', word: 'رمان', emoji: '🍊' },
  { letter: 'ز', name: 'زاي', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/zay--_ar_1.mp3', word: 'زهرة', emoji: '🌸' },
  { letter: 'س', name: 'سين', sound: 'https://ssl.gstatic.com/dictionary/static/sounds/20200429/sin--_ar_1.mp3', word: 'سمكة', emoji: '🐠' },
];

export function LetterSounds({ currentLetter, letterName, onBack, onActivityChange, user, onLogout }: LetterSoundsProps) {
  const [selectedLetter, setSelectedLetter] = useState(currentLetter || 'أ');
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [showCelebration, setShowCelebration] = useState(false);

  const currentLetterData = arabicLetters.find(l => l.letter === selectedLetter) || arabicLetters[0];

  useEffect(() => {
    // تحميل التقدم المحفوظ
    const currentUser = user || storage.getCurrentUser();
    if (currentUser) {
      const stats = progressTracking.calculateStats(currentUser.id);
      setCompletedLetters(stats.completedLetters || []);
    }
  }, [user]);

  const playSound = () => {
    const audio = new Audio(currentLetterData.sound);
    setIsPlaying(true);
    
    audio.play();
    audio.onended = () => {
      setIsPlaying(false);
      handleComplete();
    };
  };

  const handleComplete = () => {
    const currentUser = user || storage.getCurrentUser();
    if (!currentUser) return;

    if (!completedLetters.includes(selectedLetter)) {
      const newCompleted = [...completedLetters, selectedLetter];
      setCompletedLetters(newCompleted);
      
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const newScore = Math.min(100, score + 20);
      setScore(newScore);

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);

      progressTracking.saveProgress(currentUser.id, {
        activityType: 'letter-sounds',
        letter: selectedLetter,
        score: newScore,
        timeSpent,
        completedAt: Date.now(),
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" dir="rtl">
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

      <div className="relative z-10">
        {/* الهيدر */}
        <AppHeader
          showUserInfo={true}
          user={user}
          onLogout={onLogout}
          showBackButton={true}
          onBack={onBack}
        />

        {/* المحتوى الرئيسي */}
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* العنوان */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl mb-3" style={{ color: '#652b82' }}>
                🔊 استمع لصوت الحرف 🔊
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                اضغط على الحرف لتسمع نطقه الصحيح
              </p>
            </motion.div>

            {/* لوحة التقدم */}
            <motion.div
              className="bg-white rounded-3xl p-6 mb-8 shadow-2xl border-4"
              style={{ borderColor: '#fad656' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#652b82' }}>
                    <Award className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الحروف المكتملة</p>
                    <p className="text-3xl" style={{ color: '#652b82' }}>
                      {completedLetters.length} / {arabicLetters.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-8 h-8 ${
                          i < Math.floor(completedLetters.length / 3) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
              {/* بطاقة الحرف الرئيسية */}
              <motion.div
                key={selectedLetter}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-4"
                style={{ borderColor: '#fad656' }}
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* الحرف والإيموجي */}
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-block relative mb-6"
                    animate={isPlaying ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <div 
                      className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl"
                      style={{ background: 'linear-gradient(135deg, #fad656, #f5c842)' }}
                    >
                      <span className="text-8xl" style={{ color: '#652b82' }}>
                        {currentLetterData.letter}
                      </span>
                    </div>

                    {/* موجات الصوت */}
                    {isPlaying && (
                      <>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-4"
                            style={{ borderColor: '#652b82' }}
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* علامة الإكمال */}
                    {completedLetters.includes(selectedLetter) && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                        style={{ backgroundColor: '#22c55e' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Star className="w-8 h-8 text-white fill-white" />
                      </motion.div>
                    )}
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl mb-4" style={{ color: '#652b82' }}>
                    {currentLetterData.name}
                  </h2>

                  <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl mb-6">
                    <span className="text-4xl">{currentLetterData.emoji}</span>
                    <span className="text-gray-700">{currentLetterData.word}</span>
                  </div>
                </div>

                {/* زر التشغيل */}
                <div className="text-center">
                  <motion.button
                    onClick={playSound}
                    disabled={isPlaying}
                    className="relative w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, #652b82, #7d3ba0)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isPlaying ? { 
                      boxShadow: [
                        '0 0 0 0 rgba(101, 43, 130, 0.7)',
                        '0 0 0 20px rgba(101, 43, 130, 0)',
                        '0 0 0 0 rgba(101, 43, 130, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    {isPlaying ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Volume2 className="w-16 h-16" />
                      </motion.div>
                    ) : (
                      <Play className="w-16 h-16 mr-2" fill="white" />
                    )}
                  </motion.button>

                  <p className="text-xl text-gray-600">
                    {isPlaying ? '🔊 استمع جيداً...' : '👆 اضغط للاستماع'}
                  </p>
                </div>
              </motion.div>

              {/* بطاقة النصائح */}
              <div className="space-y-6">
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#652b82' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl mb-4 text-center" style={{ color: '#652b82' }}>
                    💡 نصائح
                  </h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="bg-purple-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">👂</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>استمع بانتباه</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-yellow-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">🔁</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>كرر الاستماع</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-purple-50 rounded-2xl p-4 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">🗣️</div>
                      <p className="text-sm" style={{ color: '#652b82' }}>ردد الصوت</p>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-2xl border-4"
                  style={{ borderColor: '#fad656' }}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-center">
                    <Headphones className="w-16 h-16 mx-auto mb-3" style={{ color: '#652b82' }} />
                    <p className="text-base" style={{ color: '#652b82' }}>
                      استخدم السماعات للاستماع بشكل أفضل
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* شبكة الحروف */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-2xl md:text-3xl mb-6 text-center" style={{ color: '#652b82' }}>
                🔤 اختر حرفاً آخر 🔤
              </h3>
              
              <div className="bg-white rounded-3xl p-6 shadow-2xl border-4" style={{ borderColor: '#fad656' }}>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                  {arabicLetters.map((item, index) => (
                    <motion.button
                      key={item.letter}
                      onClick={() => setSelectedLetter(item.letter)}
                      className="relative aspect-square"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.15, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div 
                        className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center border-4 transition-all relative overflow-hidden ${
                          selectedLetter === item.letter 
                            ? 'shadow-2xl' 
                            : ''
                        }`}
                        style={{
                          background: selectedLetter === item.letter
                            ? 'linear-gradient(135deg, #fad656, #f5c842)'
                            : 'white',
                          borderColor: selectedLetter === item.letter ? '#652b82' : 'transparent'
                        }}
                      >
                        <span 
                          className="text-xl md:text-2xl relative z-10"
                          style={{ 
                            color: '#652b82'
                          }}
                        >
                          {item.letter}
                        </span>

                        {/* علامة الإكمال */}
                        {completedLetters.includes(item.letter) && (
                          <motion.div 
                            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg z-20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <span className="text-white text-sm">✓</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* رسالة تحفيزية */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl border-4" style={{ borderColor: '#fad656' }}>
                <p className="text-xl md:text-2xl text-gray-700">
                  ✨ استمر في الاستماع وتعلم النطق الصحيح للحروف ✨
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
              y: isPlaying ? [-5, -15, -5] : [0, -8, 0],
              rotate: isPlaying ? [0, 5, -5, 0] : [0, 3, -3, 0]
            }}
            transition={{
              duration: isPlaying ? 0.5 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* احتفال عند الإكمال */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-12 shadow-2xl border-4"
                style={{ borderColor: '#fad656' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Star className="w-24 h-24 mx-auto text-yellow-400 fill-yellow-400 mb-4" />
                  </motion.div>
                  <h2 className="text-4xl mb-2" style={{ color: '#652b82' }}>أحسنت!</h2>
                  <p className="text-2xl text-gray-600">🎉 لقد أتممت هذا الحرف 🎉</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* الفوتر */}
      {onActivityChange && (
        <ActivityFooter 
          currentActivity="sounds" 
          onActivityChange={onActivityChange}
          onHomeClick={onBack}
          currentLetter={currentLetter}
          letterName={letterName}
        />
      )}
    </div>
  );
}