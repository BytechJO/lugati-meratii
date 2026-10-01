import { storage } from './storage';
import { User, Classroom } from '../types';
import { progressTracking } from './progressTracking';
import { ActivityProgress } from '../types';

// أكواد التفعيل
export const ACTIVATION_CODES = {
  teacher: ['TCH123', 'TCH456', 'TCH789', 'TEACH2024'],
  student: ['STD123', 'STD456', 'STD789', 'STUDY2024']
};

// الحسابات التجريبية
export const DEMO_ACCOUNTS = {
  teacher: {
    email: 'teacher@test.com',
    password: '123456',
    name: 'المعلم أحمد',
    activationCode: ACTIVATION_CODES.teacher
  },
  student: {
    email: 'student@test.com',
    password: '123456',
    name: 'الطالب محمد',
    activationCode: ACTIVATION_CODES.student
  }
};

export function initializeDemoData() {
  console.log('🔄 جاري تهيئة البيانات التجريبية...');
  
  // التحقق من وجود الحسابات التجريبية
  const teacherExists = storage.getUserByEmail(DEMO_ACCOUNTS.teacher.email);
  const studentExists = storage.getUserByEmail(DEMO_ACCOUNTS.student.email);
  
  // إذا كانت الحسابات موجودة، لا نفعل شيء
  if (teacherExists && studentExists) {
    console.log('✅ الحسابات التجريبية موجودة بالفعل');
    
    // التحقق من وجود بيانات التقدم
    const studentProgress = progressTracking.getStudentProgress(studentExists.id);
    if (!studentProgress || studentProgress.activities.length === 0) {
      console.log('🎨 إنشاء بيانات التقدم للطالب التجريبي...');
      createDemoProgressForStudent(studentExists.id);
    }
    
    return;
  }
  
  console.log('✅ بدء إنشاء البيانات التجريبية...');
  
  // إنشاء حساب المعلم إذا لم يكن موجوداً
  let teacherId = teacherExists?.id || `teacher-${Date.now()}`;
  if (!teacherExists) {
    const teacherUser: User = {
      id: teacherId,
      name: DEMO_ACCOUNTS.teacher.name,
      email: DEMO_ACCOUNTS.teacher.email,
      password: DEMO_ACCOUNTS.teacher.password,
      type: 'teacher'
    };
    storage.saveUser(teacherUser);
    console.log('✅ تم إنشاء حساب المعلم:', teacherUser.email);
  }
  
  // إنشاء حساب الطالب إذا لم يكن موجوداً
  if (!studentExists) {
    const studentId = `student-${Date.now()}`;
    const studentUser: User = {
      id: studentId,
      name: DEMO_ACCOUNTS.student.name,
      email: DEMO_ACCOUNTS.student.email,
      password: DEMO_ACCOUNTS.student.password,
      type: 'student'
    };
    storage.saveUser(studentUser);
    console.log('✅ تم إنشاء حساب الطالب:', studentUser.email);
  }
  
  // التحقق من وجود الصف التجريبي
  const allClassrooms = storage.getClassrooms();
  const demoClassExists = allClassrooms.find(c => c.code === 'ABC123');
  
  if (!demoClassExists) {
    // الحصول على معرف الطالب
    const student = storage.getUserByEmail(DEMO_ACCOUNTS.student.email);
    const studentId = student?.id || `student-${Date.now()}`;
    
    // إنشاء صف للمعلم
    const classCode = 'ABC123'; // كود ثابت للتجربة
    const classroom: Classroom = {
      id: `classroom-${Date.now()}`,
      name: 'الصف الأول',
      teacherId: teacherId,
      code: classCode,
      students: student ? [studentId] : [] // إضافة الطالب مباشرة
    };
    storage.saveClassroom(classroom);
    
    // تحديث الطالب ليشير إلى الصف
    if (student) {
      storage.updateUser(studentId, { classroomId: classroom.id });
    }
    
    console.log('✅ تم إنشاء الصف:', classroom.name, 'بالكود:', classCode);
    if (student) {
      console.log('✅ تم إضافة الطالب للصف تلقائياً');
    }
  }
  
  console.log('\n📋 معلومات الحسابات التجريبية:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍🏫 حساب المعلم:');
  console.log('   البريد: teacher@test.com');
  console.log('   الباسورد: 123456');
  console.log('   كود التفعيل: TEACH2024');
  console.log('   كود الصف: ABC123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎒 حساب الطالب:');
  console.log('   البريد: student@test.com');
  console.log('   الباسورد: 123456');
  console.log('   كود التفعيل: STUDY2024');
  console.log('   للانضمام استخدم كود: ABC123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

export function clearAllData() {
  console.log('🗑️ جاري حذف جميع البيانات...');
  localStorage.clear();
  console.log('✅ تم حذف جميع البيانات بنجاح');
}

export function resetToDemo() {
  clearAllData();
  initializeDemoData();
  
  // إنشاء بيانات التقدم تلقائياً
  createDemoProgress();
  
  console.log('✅ تم إعادة تعيين البيانات إلى الوضع التجريبي');
  console.log('💡 تم إنشاء بيانات التقدم تلقائياً!');
}

// إنشاء بيانات تقدم تجريبية للطالب
export function createDemoProgress() {
  const student = storage.getUserByEmail(DEMO_ACCOUNTS.student.email);
  if (!student) {
    console.log('❌ لا يوجد حساب طالب لإضافة التقدم له');
    return;
  }

  const studentId = student.id;
  const letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س'];
  const activityTypes: Array<'letter-sounds' | 'draw-letters' | 'letter-position' | 'color-letters'> = [
    'letter-sounds',
    'draw-letters', 
    'letter-position',
    'color-letters'
  ];

  console.log('🎨 جاري إنشاء بيانات تقدم تجريبية...');

  // إنشاء 25-30 نشاط عشوائي
  const totalActivities = 25 + Math.floor(Math.random() * 6);
  const now = Date.now();

  for (let i = 0; i < totalActivities; i++) {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomActivityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    // درجات متنوعة (أكثرها جيدة لتحفيز الطالب)
    let score: number;
    const rand = Math.random();
    if (rand < 0.5) {
      // 50% ممتاز (85-100)
      score = 85 + Math.floor(Math.random() * 16);
    } else if (rand < 0.8) {
      // 30% جيد جداً (70-84)
      score = 70 + Math.floor(Math.random() * 15);
    } else {
      // 20% جيد (60-69)
      score = 60 + Math.floor(Math.random() * 10);
    }

    // توزيع الأنشطة على مدار آخر 7 أيام
    const daysAgo = Math.floor(Math.random() * 7);
    const completedAt = now - (daysAgo * 24 * 60 * 60 * 1000) - Math.floor(Math.random() * 24 * 60 * 60 * 1000);

    const activity: ActivityProgress = {
      activityType: randomActivityType,
      letter: randomLetter,
      score: score,
      completedAt: completedAt,
      timeSpent: 60 + Math.floor(Math.random() * 240) // 1-5 دقائق
    };

    progressTracking.saveProgress(studentId, activity);
  }

  const stats = progressTracking.calculateStats(studentId);
  console.log('✅ تم إنشاء بيانات التقدم التجريبية:');
  console.log(`   📚 عدد الأنشطة: ${totalActivities}`);
  console.log(`   ⭐ المعدل: ${stats.averageScore}%`);
  console.log(`   📝 الحروف المكتملة: ${stats.completedLetters.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// إنشاء بيانات تقدم تجريبية للطالب مع معرف محدد
export function createDemoProgressForStudent(studentId: string) {
  const letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س'];
  const activityTypes: Array<'letter-sounds' | 'draw-letters' | 'letter-position' | 'color-letters'> = [
    'letter-sounds',
    'draw-letters', 
    'letter-position',
    'color-letters'
  ];

  console.log('🎨 جاري إنشاء بيانات تقدم تجريبية...');

  // إنشاء 25-30 نشاط عشوائي
  const totalActivities = 25 + Math.floor(Math.random() * 6);
  const now = Date.now();

  for (let i = 0; i < totalActivities; i++) {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomActivityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    // درجات متنوعة (أكثرها جيدة لتحفيز الطالب)
    let score: number;
    const rand = Math.random();
    if (rand < 0.5) {
      // 50% ممتاز (85-100)
      score = 85 + Math.floor(Math.random() * 16);
    } else if (rand < 0.8) {
      // 30% جيد جداً (70-84)
      score = 70 + Math.floor(Math.random() * 15);
    } else {
      // 20% جيد (60-69)
      score = 60 + Math.floor(Math.random() * 10);
    }

    // توزيع الأنشطة على مدار آخر 7 أيام
    const daysAgo = Math.floor(Math.random() * 7);
    const completedAt = now - (daysAgo * 24 * 60 * 60 * 1000) - Math.floor(Math.random() * 24 * 60 * 60 * 1000);

    const activity: ActivityProgress = {
      activityType: randomActivityType,
      letter: randomLetter,
      score: score,
      completedAt: completedAt,
      timeSpent: 60 + Math.floor(Math.random() * 240) // 1-5 دقائق
    };

    progressTracking.saveProgress(studentId, activity);
  }

  const stats = progressTracking.calculateStats(studentId);
  console.log('✅ تم إنشاء بيانات التقدم التجريبية:');
  console.log(`   📚 عدد الأنشطة: ${totalActivities}`);
  console.log(`   ⭐ المعدل: ${stats.averageScore}%`);
  console.log(`   📝 الحروف المكتملة: ${stats.completedLetters.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}