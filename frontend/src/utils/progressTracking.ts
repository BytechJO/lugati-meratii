import { StudentProgress, ActivityProgress } from '../types';

const PROGRESS_STORAGE_KEY = 'student_progress';

export const progressTracking = {
  // حفظ تقدم الطالب
  saveProgress(studentId: string, activity: ActivityProgress): void {
    const allProgress = this.getAllProgress();
    let studentProgress = allProgress.find(p => p.studentId === studentId);
    
    if (!studentProgress) {
      studentProgress = {
        studentId,
        activities: [],
        totalScore: 0,
        completedLessons: 0,
        lastActivityDate: Date.now()
      };
      allProgress.push(studentProgress);
    }
    
    // إضافة النشاط الجديد
    studentProgress.activities.push(activity);
    studentProgress.completedLessons = studentProgress.activities.length;
    studentProgress.lastActivityDate = Date.now();
    
    // حساب المجموع الكلي
    const totalScore = studentProgress.activities.reduce((sum, act) => sum + act.score, 0);
    studentProgress.totalScore = Math.round(totalScore / studentProgress.activities.length);
    
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    
    console.log('✅ تم حفظ التقدم:', {
      studentId,
      activity: activity.activityType,
      score: activity.score,
      totalLessons: studentProgress.completedLessons
    });
  },
  
  // الحصول على تقدم طالب معين
  getStudentProgress(studentId: string): StudentProgress | null {
    const allProgress = this.getAllProgress();
    return allProgress.find(p => p.studentId === studentId) || null;
  },
  
  // الحصول على جميع التقدمات
  getAllProgress(): StudentProgress[] {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  // الحصول على تقدم طلاب صف معين
  getClassroomProgress(studentIds: string[]): StudentProgress[] {
    const allProgress = this.getAllProgress();
    return allProgress.filter(p => studentIds.includes(p.studentId));
  },
  
  // حساب الإحصائيات
  calculateStats(studentId: string): {
    totalActivities: number;
    averageScore: number;
    completedLetters: string[];
    activitiesByType: Record<string, number>;
    lastActive?: Date;
  } {
    const progress = this.getStudentProgress(studentId);
    
    if (!progress) {
      return {
        totalActivities: 0,
        averageScore: 0,
        completedLetters: [],
        activitiesByType: {
          'letter-sounds': 0,
          'draw-letters': 0,
          'letter-position': 0,
          'color-letters': 0
        }
      };
    }
    
    const completedLetters = new Set<string>();
    const activitiesByType: Record<string, number> = {
      'letter-sounds': 0,
      'draw-letters': 0,
      'letter-position': 0,
      'color-letters': 0
    };
    
    progress.activities.forEach(activity => {
      if (activity.letter) {
        completedLetters.add(activity.letter);
      }
      activitiesByType[activity.activityType]++;
    });
    
    return {
      totalActivities: progress.activities.length,
      averageScore: progress.totalScore,
      completedLetters: Array.from(completedLetters),
      activitiesByType,
      lastActive: progress.lastActivityDate ? new Date(progress.lastActivityDate) : undefined
    };
  },
  
  // الحصول على أفضل 5 نتائج
  getTopScores(studentId: string, limit: number = 5): ActivityProgress[] {
    const progress = this.getStudentProgress(studentId);
    if (!progress) return [];
    
    return [...progress.activities]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
  
  // الحصول على النشاطات الأخيرة
  getRecentActivities(studentId: string, limit: number = 10): ActivityProgress[] {
    const progress = this.getStudentProgress(studentId);
    if (!progress) return [];
    
    return [...progress.activities]
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);
  },
  
  // حذف تقدم طالب
  deleteStudentProgress(studentId: string): void {
    const allProgress = this.getAllProgress();
    const filtered = allProgress.filter(p => p.studentId !== studentId);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(filtered));
  },
  
  // مسح كل التقدم
  clearAllProgress(): void {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  }
};

// أسماء الأنشطة بالعربية
export const ACTIVITY_NAMES: Record<string, string> = {
  'letter-sounds': 'تعلم صوت الحروف',
  'draw-letters': 'رسم الحروف',
  'letter-position': 'تحديد مكان الحروف',
  'color-letters': 'تلوين الحروف'
};

// الحصول على لون حسب العلامة
export function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // أخضر
  if (score >= 75) return '#3b82f6'; // أزرق
  if (score >= 60) return '#f59e0b'; // برتقالي
  return '#ef4444'; // أحمر
}

// الحصول على نص التقييم
export function getScoreText(score: number): string {
  if (score >= 90) return 'ممتاز';
  if (score >= 75) return 'جيد جداً';
  if (score >= 60) return 'جيد';
  return 'يحتاج تحسين';
}