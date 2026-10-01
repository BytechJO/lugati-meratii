import { Routes, Route, Navigate } from "react-router-dom";
import { ChooseAccountType } from "../components/ChooseAccountType";
import { LoginPage } from "../components/LoginPage";
import { HomePage } from "../components/HomePage";
import { TeacherHomePage } from "../components/TeacherHomePage";
import { User } from "../types";
import { useAppSelector } from "../redux/hooks";
import { LettersDashboard } from "../components/LettersDashboard";
import { JoinClassroom } from "../components/JoinClassroom";
import { useNavigate } from "react-router-dom";
import { LetterDetails } from "../components/LetterDetails";
import { LearnLetters } from "../components/LearnLetters";
import { LearnLetters2 } from "../components/LearnLetters2";
import { LetterPosition } from "../components/LetterPosition";
import { LetterTashkeel } from "../components/LetterTashkeel";
import { VideosSection } from "../components/VideosSection";
import { GamesSection } from "../components/GamesSection";
import { BalloonPopGame } from "../components/games/BalloonPopGame";
import { MemoryMatchGame } from "../components/games/MemoryMatchGame";
import { SortingGame } from "../components/games/SortingGame";
import { WordCatchGame } from "../components/games/WordCatchGame";
import { TeacherResources } from "../components/TeacherResources";
import { StudentsManagement } from "../components/StudentsManagement";
import { ClassroomStudent } from "../components/ClassroomStudent";
import { SuccessJoin } from "../components/SuccessJoin";
import { LetterWelcomePage } from "../components/LetterWelcomePage";
import { SplashScreen } from "../components/SplashScreen";

interface AppRouterProps {
  onChooseType: (type: "student" | "teacher") => void;
  selectedUserType: "student" | "teacher" | null;
  currentUser: User | null;
  onLogout: () => void;
  // onNavigate: (section: string) => void;
}
export function AppRouter({
  onChooseType,
  selectedUserType,
  onLogout,
}: AppRouterProps) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* الجذر */}
      <Route
        path="/"
        element={
          user ? (
            user.type === "student" ? (
              <Navigate to="/student/home" />
            ) : (
              <Navigate to="/teacher/home" />
            )
          ) : (
            <ChooseAccountType onChoose={onChooseType} />
          )
        }
      />

      {/* تسجيل الدخول */}
      <Route
        path="/login/:type"
        element={
          selectedUserType ? (
            <LoginPage
              userType={selectedUserType}
              onBack={() => navigate("/")}
              onLogout={onLogout}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* طالب */}
      <Route
        path="/student/home"
        element={<HomePage user={user} onLogout={onLogout} />}
      />

      {/* معلم */}
      <Route
        path="/teacher/home"
        element={
          user?.type === "teacher" ? <TeacherHomePage /> : <Navigate to="/" />
        }
      />
      <Route path="/teacher/resources" element={<TeacherResources />} />
      <Route
        path="/teacher/letters"
        element={<LettersDashboard onLogout={onLogout} />}
      />
      <Route path="/teacher/students" element={<StudentsManagement />} />
      <Route
        path="/teacher/students/:classroomId"
        element={<ClassroomStudent />}
      />
      <Route path="/welcome-page" element={<LetterWelcomePage />} />
      <Route
        path="/letters"
        element={<LettersDashboard onLogout={onLogout} />}
      />

      <Route
        path="/my-classroom"
        element={<JoinClassroom onClose={() => navigate("/student/home")} />}
      />
      <Route
        path="/my-classroom/:id"
        element={<SuccessJoin onLogout={onLogout} />}
      />

      <Route
        path="/letter/:letter"
        element={<LetterDetails onLogout={onLogout} />}
      />
      <Route
        path="/SplashScreen"
        element={
          <SplashScreen
            onComplete={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        }
      />
      <Route
        path="/letter/:letter/learn"
        element={<LearnLetters onLogout={onLogout} />}
      />
      <Route
        path="/letter/:letter/write"
        element={<LearnLetters2 onLogout={onLogout} />}
      />
      <Route
        path="/letter/:symbol/position"
        element={<LetterPosition onLogout={onLogout} />}
      />
      <Route
        path="/letter/:letter/tashkeel"
        element={<LetterTashkeel onLogout={onLogout} />}
      />
      <Route
        path="/letter/:letter/videos"
        element={<VideosSection onLogout={onLogout} />}
      />
      <Route
        path="/letter/:letter/games"
        element={<GamesSection onLogout={onLogout} />}
      />

      <Route
        path="/letter/:letter/games/balloon_pop"
        element={<BalloonPopGame />}
      />
      <Route
        path="/letter/:letter/games/memory_match"
        element={<MemoryMatchGame />}
      />
      <Route path="/letter/:letter/games/sorting" element={<SortingGame />} />
      <Route
        path="/letter/:letter/games/word_catch"
        element={<WordCatchGame />}
      />

      {/* أي مسار غلط */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
