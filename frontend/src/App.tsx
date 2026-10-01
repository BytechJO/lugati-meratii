import { SplashScreen } from "./components/SplashScreen";
import { BalloonPopGame } from "./components/games/BalloonPopGame";
import { ChooseAccountType } from "./components/ChooseAccountType";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { TeacherHomePage } from "./components/TeacherHomePage";
import { VideosSection } from "./components/VideosSection";
import { TeacherResources } from "./components/TeacherResources";
import { LearnLetters } from "./components/LearnLetters";
import { LearnLetters2 } from "./components/LearnLetters2";
import { GamesSection } from "./components/GamesSection";
import { JoinClassroom } from "./components/JoinClassroom";
import { LetterSounds } from "./components/LetterSounds";
import { LetterPosition } from "./components/LetterPosition";
import { LetterTashkeel } from "./components/LetterTashkeel";
import { StudentsManagement } from "./components/StudentsManagement";
import { LetterDetails } from "./components/LetterDetails";
import { LettersDashboard } from "./components/LettersDashboard";
import { ClassroomManagement } from "./components/ClassroomManagement";
import { WordCatchGame } from "./components/games/WordCatchGame";
import { MemoryMatchGame } from "./components/games/MemoryMatchGame";
import { SortingGame } from "./components/games/SortingGame";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppRouter } from "./app/router";
import { motion } from "motion/react";
import {
  Home,
  Video,
  BookOpen,
  Gamepad2,
  Users,
  LogOut,
  Volume2,
  Target,
  Palette,
  Edit3,
  GraduationCap,
} from "lucide-react";
import { RefreshNotice } from "./components/RefreshNotice";
import { storage } from "./utils/storage";
import { initializeDemoData } from "./utils/seedData";
import { User, Classroom } from "./types";
import logoImg from "figma:asset/6520b1b60d37f88a4b683be1071a82232534fb7f.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./redux/reducers/auth";
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<
    "teacher" | "student" | null
  >(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [showClassroomManagement, setShowClassroomManagement] = useState(false);
  const [showJoinClassroom, setShowJoinClassroom] = useState(false);
  const dispatch = useDispatch<any>();
  const [selectedLetter, setSelectedLetter] = useState<{
    letter: string;
    name: string;
  } | null>(null);
  const [selectedLetterSection, setSelectedLetterSection] = useState<
    string | null
  >(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const navigate = useNavigate();
  // useEffect(() => {
  //   // تهيئة البيانات التجريبية عند أول تشغيل
  //   initializeDemoData();

  //   // طباعة معلومات الحسابات التجريبية في console
  //   console.log(
  //     "%c🎓 مرحباً بك في مدرستي لغتي!",
  //     "font-size: 20px; font-weight: bold; color: #652b82;"
  //   );
  //   console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #652b82;");
  //   console.log("%c👨‍🏫 حساب المعلم:", "font-weight: bold; color: #059669;");
  //   console.log("   البريد: teacher@test.com");
  //   console.log("   الباسورد: 123456");
  //   console.log("   كود التفعيل: TEACH2024");
  //   console.log("   كود الصف: ABC123");
  //   console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #652b82;");
  //   console.log("%c🎒 حساب الطالب:", "font-weight: bold; color: #2563eb;");
  //   console.log("   البريد: student@test.com");
  //   console.log("   الباسورد: 123456");
  //   console.log("   كود التفعيل: STUDY2024");
  //   console.log("   للانضمام: ABC123");
  //   console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #652b82;");
  //   console.log(
  //     '%c💡 نصيحة: سجل دخول كمعلم واضغط "إدارة الصفوف" لرؤية تقييم الطلاب!',
  //     "color: #059669; font-weight: bold; font-size: 14px;"
  //   );
  //   console.log(
  //     '%c⭐ إذا لم تظهر التقييمات، اضغط زر "إنشاء بيانات تجريبية"',
  //     "color: #f59e0b; font-weight: bold;"
  //   );

  //   // Check if user is already logged in
  //   const user = storage.getCurrentUser();
  //   if (user) {
  //     setCurrentUser(user);

  //     // إنشاء صف تلقائي للمعلم إذا لم يكن لديه أي صفوف
  //     if (user.type === "teacher") {
  //       const teacherClassrooms = storage.getClassroomsByTeacher(user.id);
  //       if (teacherClassrooms.length === 0) {
  //         const demoClassroom = {
  //           id: `demo-${user.id}-${Date.now()}`,
  //           name: "صفي التجريبي",
  //           teacherId: user.id,
  //           code: storage.generateClassCode(),
  //           students: [],
  //         };
  //         storage.saveClassroom(demoClassroom);
  //       }
  //     }
  //   }
  // }, []);

  // const handleLogin = (user: User) => {
  //   setCurrentUser(user);

  //   // إنشاء صف تلقائي للمعلم إذا لم يكن لديه أي صفوف
  //   if (user.type === "teacher") {
  //     const teacherClassrooms = storage.getClassroomsByTeacher(user.id);
  //     if (teacherClassrooms.length === 0) {
  //       const demoClassroom = {
  //         id: `demo-${user.id}-${Date.now()}`,
  //         name: "صفي التجريبي",
  //         teacherId: user.id,
  //         code: storage.generateClassCode(),
  //         students: [],
  //       };
  //       storage.saveClassroom(demoClassroom);
  //     }
  //   }
  // };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");

    window.location.reload();
  };

  const handleBackToLetterDetails = () => {
    // العودة من قسم معين إلى صفحة تفاصيل الحرف
    setSelectedLetterSection(null);
  };

  const handleLetterSectionClick = (section: string) => {
    setSelectedLetterSection(section);
    // Map section to activeSection
    const sectionMap: { [key: string]: string } = {
      videos: "videos",
      learn: "letters",
      learn2: "letters2",
      sound: "letter-sounds",
      position: "letter-position",
      tashkeel: "letter-tashkeel",
      games: "games",
    };
    if (sectionMap[section]) {
      setActiveSection(sectionMap[section]);
    }
  };

  const handleNavigate = (section: string) => {
    // إذا كان المستخدم يذهب للرئيسية، نعيد تعيين الحرف المختار ونعرض LettersDashboard
    if (section === "home") {
      setSelectedLetter(null);
      setSelectedLetterSection(null);
      setActiveSection("home");
    } else {
      // باقي الأقسام تتنقل بين أقسام الحرف المختار
      // نبقي selectedLetter كما هو ونغير فقط القسم
      setActiveSection(section);
    }
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  if (!currentUser) {
    return (
      <AppRouter
        onChooseType={setSelectedUserType}
        selectedUserType={selectedUserType}
        currentUser={currentUser}
        onLogout={handleLogout}
  
      />
    );
  }

  const renderSection = () => {
    // Pass selected letter to all sections when a letter is selected
    const letterProp = selectedLetter
      ? {
          currentLetter: selectedLetter.letter,
          letterName: selectedLetter.name,
        }
      : {};

    switch (activeSection) {
      case "home":
        return <HomePage onLogout={handleLogout} />;
      case "videos":
        return <VideosSection />;
      case "teachers":
        return <TeacherResources />;
      case "letters2":
        return <LearnLetters2 />;
      case "games":
        return <GamesSection />;
      case "my-classroom":
        return <JoinClassroom onClose={() => {}} />;
      case "letter-sounds":
        return (
          <LetterSounds
            {...letterProp}
            onBack={handleBackToLetterDetails}
            user={currentUser}
            onLogout={handleLogout}
          />
        );
      case "letter-position":
        return <LetterPosition />;
      case "letter-tashkeel":
        return <LetterTashkeel />;
      default:
        return <HomePage onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* خلفية متدرجة ملونة */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-yellow-50 to-purple-50 -z-10"></div>

      {/* دوائر ملونة في الخلفية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: "#fad656" }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#652b82" }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Navigation Header - مخفي في صفحة تفاصيل الحرف وصفحة الحروف */}
      {!selectedLetter &&
        activeSection !== "letters" &&
        activeSection !== "students" &&
        activeSection !== "teachers" &&
        activeSection !== "my-classroom" && (
          <nav
            className="bg-white shadow-lg sticky top-0 z-50 relative"
            style={{ borderBottom: "4px solid #652b82" }}
          >
            <div className="py-4 px-6">
              <div className="flex items-center justify-between w-full">
                {/* Logo على أقصى اليمين */}
                <div className="flex items-center gap-4 mr-auto">
                  <img
                    src={logoImg}
                    alt="مدرستي لغتي"
                    className="h-12 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                {/* User Info & Action Buttons على أقصى اليسار */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md text-lg"
                      style={{ backgroundColor: "#652b82" }}
                    >
                      {currentUser.type === "student" ? "🎒" : "👨‍🏫"}
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "#652b82" }}>
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.type === "student" ? "طالب" : "معلم"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser.type === "teacher" && (
                      <button
                        onClick={() => setActiveSection("students")}
                        className="text-white px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        style={{ backgroundColor: "#652b82" }}
                      >
                        <Users className="w-4 h-4" />
                        <span>إدارة الصفوف</span>
                      </button>
                    )}
                    {currentUser.type === "student" && (
                      <button
                        onClick={() => setActiveSection("my-classroom")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-80 transition-all text-white"
                        style={{ backgroundColor: "#652b82" }}
                      >
                        <span>صفي</span>
                        <Users className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-80 transition-all"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                      }}
                    >
                      <span>تسجيل الخروج</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        )}

      {/* Main Content */}
      {selectedGame ? (
        // عرض اللعبة المختارة
        selectedGame === "sounds" ? (
          <WordCatchGame />
        ) : selectedGame === "draw" ? (
          <MemoryMatchGame />
        ) : selectedGame === "position" ? (
          <SortingGame />
        ) : selectedGame === "color" ? (
          <BalloonPopGame />
        ) : null
      ) : selectedLetter && !selectedLetterSection ? (
        <LetterDetails />
      ) : selectedLetterSection && activeSection === "letters" ? (
        // عرض LearnLetters بدون container عشان ياخد الشاشة كاملة
        <LearnLetters />
      ) : selectedLetterSection && activeSection === "letters2" ? (
        // عرض LearnLetters2 بدون container عشان ياخد الشاشة كاملة
        <LearnLetters2 />
      ) : activeSection === "letters" &&
        !selectedLetter &&
        !selectedLetterSection ? (
        // عرض LettersDashboard بدون container عشان ياخد الشاشة كاملة
        <LettersDashboard
          onLogout={handleLogout}
          onBack={() => setActiveSection("home")}
        />
      ) : activeSection === "students" ? (
        // عرض StudentsManagement بدون container عشان ياخد الشاشة كاملة
        <StudentsManagement />
      ) : activeSection === "teachers" ? (
        // عرض TeacherResources بدون container عشان ياخد الشاشة كاملة
        <TeacherResources />
      ) : activeSection === "my-classroom" ? (
        // عرض JoinClassroom بدون container عشان ياخد الشاشة كاملة
        renderSection()
      ) : (
        <main className="container mx-auto px-4 py-8 pb-24 relative z-10">
          {renderSection()}
        </main>
      )}

      {/* Modals */}
      {showClassroomManagement && currentUser.type === "teacher" && (
        <ClassroomManagement />
      )}

      {showJoinClassroom && currentUser.type === "student" && (
        <JoinClassroom onClose={() => setShowJoinClassroom(false)} />
      )}

      {/* Bottom Navigation */}
      {false &&
        selectedLetter &&
        selectedLetterSection &&
        activeSection !== "learn" && (
          <nav
            className="fixed bottom-0 left-0 right-0 shadow-2xl z-50 border-t-4"
            style={{
              backgroundColor: "#652b82",
              borderColor: "#4a1f5e",
            }}
          >
            <div className="container mx-auto px-2">
              <div className="grid grid-cols-4 gap-2 py-3 md:grid-cols-8">
                <NavButton
                  icon={<Video className="w-5 h-5" />}
                  label="فيديوهات"
                  active={activeSection === "videos"}
                  onClick={() => handleLetterSectionClick("videos")}
                />
                <NavButton
                  icon={<BookOpen className="w-5 h-5" />}
                  label="تعلم الحرف"
                  active={activeSection === "letters"}
                  onClick={() => handleLetterSectionClick("learn")}
                />
                <NavButton
                  icon={<Volume2 className="w-5 h-5" />}
                  label="صوت الحرف"
                  active={activeSection === "letter-sounds"}
                  onClick={() => handleLetterSectionClick("sound")}
                />
                <NavButton
                  icon={<Edit3 className="w-5 h-5" />}
                  label="رسم الحرف"
                  active={activeSection === "draw-letters"}
                  onClick={() => handleLetterSectionClick("draw")}
                />
                <NavButton
                  icon={<Target className="w-5 h-5" />}
                  label="مكان الحرف"
                  active={activeSection === "letter-position"}
                  onClick={() => handleLetterSectionClick("position")}
                />
                <NavButton
                  icon={<Palette className="w-5 h-5" />}
                  label="تلوين الحرف"
                  active={activeSection === "color-letters"}
                  onClick={() => handleLetterSectionClick("coloring")}
                />
                <NavButton
                  icon={<Gamepad2 className="w-5 h-5" />}
                  label="الألعاب"
                  active={activeSection === "games"}
                  onClick={() => handleLetterSectionClick("games")}
                />
                <NavButton
                  icon={<Home className="w-5 h-5" />}
                  label="الحروف"
                  active={false}
                  onClick={() => handleNavigate("home")}
                />
              </div>
            </div>
          </nav>
        )}

      <RefreshNotice />
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl transition-all ${
        active ? "shadow-lg scale-105" : "hover:scale-105"
      }`}
      style={
        active
          ? { backgroundColor: "#fad656", color: "#652b82" }
          : {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
            }
      }
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-[0.65rem] leading-tight text-center whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// export default function App() {
//   const [showSplash, setShowSplash] = useState(true);
//   const [selectedUserType, setSelectedUserType] = useState<
//     "teacher" | "student" | null
//   >(null);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [activeSection, setActiveSection] = useState("home");

//   const dispatch = useDispatch<any>();

//   const navigate = useNavigate();

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");

//     window.location.reload();
//   };

//   if (showSplash) {
//     return <SplashScreen onComplete={() => setShowSplash(false)} />;
//   }

//   return (
//     <div className="min-h-screen" dir="rtl">
//       <AppRouter
//         onChooseType={setSelectedUserType}
//         selectedUserType={selectedUserType}
//         currentUser={currentUser}
//         onLogout={handleLogout}
//         // onNavigate={setActiveSection}
//       />
//     </div>
//   );
// }
