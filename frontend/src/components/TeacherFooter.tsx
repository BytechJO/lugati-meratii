import { Home, School, BookOpen } from 'lucide-react';

interface TeacherFooterProps {
  onHomeClick: () => void;
  onClassroomClick: () => void;
  onResourcesClick: () => void;
  activeSection?: 'home' | 'classroom' | 'resources';
}

export function TeacherFooter({ 
  onHomeClick, 
  onClassroomClick, 
  onResourcesClick,
  activeSection
}: TeacherFooterProps) {
  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 shadow-2xl z-50 border-t-2" 
      style={{ backgroundColor: '#164194', borderColor: '#0d2f6b' }}
      dir="rtl"
    >
      <div className="container mx-auto px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onHomeClick}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
              activeSection === 'home' 
                ? 'bg-white shadow-md' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <Home 
              className="w-4 h-4 md:w-5 md:h-5" 
              style={{ color: activeSection === 'home' ? '#164194' : '#FFFFFF' }}
            />
            <span 
              className="text-xs"
              style={{ color: activeSection === 'home' ? '#164194' : '#FFFFFF' }}
            >
              الرئيسية
            </span>
          </button>

          <button
            onClick={onClassroomClick}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
              activeSection === 'classroom' 
                ? 'bg-white shadow-md' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <School 
              className="w-4 h-4 md:w-5 md:h-5" 
              style={{ color: activeSection === 'classroom' ? '#164194' : '#FFFFFF' }}
            />
            <span 
              className="text-xs"
              style={{ color: activeSection === 'classroom' ? '#164194' : '#FFFFFF' }}
            >
              إدارة الصفوف
            </span>
          </button>

          <button
            onClick={onResourcesClick}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
              activeSection === 'resources' 
                ? 'bg-white shadow-md' 
                : 'hover:bg-white hover:bg-opacity-10'
            }`}
          >
            <BookOpen 
              className="w-4 h-4 md:w-5 md:h-5" 
              style={{ color: activeSection === 'resources' ? '#164194' : '#FFFFFF' }}
            />
            <span 
              className="text-xs"
              style={{ color: activeSection === 'resources' ? '#164194' : '#FFFFFF' }}
            >
              موارد المعلم
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}