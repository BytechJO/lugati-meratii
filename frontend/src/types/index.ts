export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  type: 'teacher' | 'student';
  classroomId?: string;
}

export interface Classroom {
  students: any;
  id: number;
  name: string;
  code: string;
  status: string;
  created_at: string;
  students_count: number;
}
export interface ClassroomSingle {
  students: any;
  id: number;
  name: string;
  code: string;
  status: string;
  created_at: string;
  students_count: number;
}
export interface ClassStudent {
  id: number;
  username: string;
  email: string;
  jouind_at: string;
}

// نظام التتبع
export interface ActivityProgress {
  activityType: 'letter-sounds' | 'draw-letters' | 'letter-position' | 'color-letters';
  letter?: string;
  score: number; // من 0 إلى 100
  completedAt: number; // timestamp
  timeSpent?: number; // بالثواني
}

export interface StudentProgress {
  studentId: string;
  activities: ActivityProgress[];
  totalScore: number;
  completedLessons: number;
  lastActivityDate?: number;
}

export interface StudentStats {
  studentId: string;
  studentName: string;
  totalActivities: number;
  averageScore: number;
  completedLetters: Set<string>;
  lastActive?: Date;
  activitiesByType: {
    'letter-sounds': number;
    'draw-letters': number;
    'letter-position': number;
    'color-letters': number;
  };
}