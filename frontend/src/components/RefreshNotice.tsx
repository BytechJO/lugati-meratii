import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function RefreshNotice() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // إخفاء الإشعار نهائياً
    setDismissed(true);
    return;
    
    // التحقق إذا كان المستخدم قد أغلق الإشعار من قبل
    const wasDismissed = localStorage.getItem('refresh_notice_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // إظهار الإشعار بعد 2 ثانية
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('refresh_notice_dismissed', 'true');
  };

  const handleRefresh = () => {
    // تحديث الصفحة بالقوة (تجاوز الـ cache)
    window.location.reload();
  };

  if (dismissed || !show) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slideDown"
      dir="rtl"
    >
      <div className="rounded-2xl shadow-2xl p-4 max-w-md border-2" style={{ background: 'linear-gradient(to right, #652b82, #652b82ee)', borderColor: '#fad656' }}>
        <div className="flex items-start gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold mb-1">💡 تحديث مهم!</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              إذا لم تظهر التبويبات الجديدة، اضغط على الزر أدناه لتحديث الصفحة
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                style={{ backgroundColor: '#fad656', color: '#652b82' }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث الصفحة</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs text-blue-100 flex items-center gap-1">
            <span>⌨️</span>
            <span>أو اضغط Ctrl+Shift+R (Windows) أو Cmd+Shift+R (Mac)</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}