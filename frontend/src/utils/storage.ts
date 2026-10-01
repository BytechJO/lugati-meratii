import { User, Classroom } from '../types';

const USERS_KEY = 'arabic_learning_users';
const CLASSROOMS_KEY = 'arabic_learning_classrooms';
const CURRENT_USER_KEY = 'arabic_learning_current_user';

export const storage = {
  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  // Current User
  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Classrooms
  getClassrooms(): Classroom[] {
    const data = localStorage.getItem(CLASSROOMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveClassroom(classroom: Classroom): void {
    const classrooms = this.getClassrooms();
    classrooms.push(classroom);
    localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
  },

  updateClassroom(classroomId: string, updates: Partial<Classroom>): void {
    const classrooms = this.getClassrooms();
    const index = classrooms.findIndex(c => c.id === classroomId);
    if (index !== -1) {
      classrooms[index] = { ...classrooms[index], ...updates };
      localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
    }
  },

  getClassroomById(id: string): Classroom | undefined {
    return this.getClassrooms().find(c => c.id === id);
  },

  getClassroomByCode(code: string): Classroom | undefined {
    // تحويل الكود لأحرف كبيرة وإزالة المسافات للمقارنة
    const searchCode = code.trim().toUpperCase();
    return this.getClassrooms().find(c => c.code.toUpperCase() === searchCode);
  },

  getClassroomsByTeacher(teacherId: string): Classroom[] {
    return this.getClassrooms().filter(c => c.teacherId === teacherId);
  },

  addStudentToClassroom(classroomId: string, studentId: string): void {
    const classrooms = this.getClassrooms();
    const classroom = classrooms.find(c => c.id === classroomId);
    if (classroom && !classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
    }
  },

  generateClassCode(): string {
    // توليد كود مكون من 6 أحرف وأرقام عشوائية
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // التأكد من أن الكود غير مستخدم بالفعل
    const existingClassroom = this.getClassroomByCode(code);
    if (existingClassroom) {
      return this.generateClassCode(); // إعادة التوليد إذا كان الكود موجوداً
    }
    
    return code;
  }
};