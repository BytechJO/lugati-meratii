import { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Star,
  Volume2,
  Edit3,
  Palette,
  Users,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { Classroom, User } from "../types";
import {
  progressTracking,
  ACTIVITY_NAMES,
  getScoreColor,
  getScoreText,
} from "../utils/progressTracking";
import learn from "../assets/Learn.svg";
import write from "../assets/Write.svg";
import tashkeel from "../assets/Tashkeel.svg";
import Position from "../assets/Position.svg";
import video from "../assets/Video.svg";
import game from "../assets/Game.svg";
import api from "../API/axios";
import { getClassById } from "../API/classrooms";
import { lettersComp } from "../data/lettersComp";
import { SplashScreen } from "./SplashScreen";
import user_icon from "../assets/Users (1).svg";
import backgroundHeader from "../assets/headerBackground_Progress.svg";
import backgroundActivites from "../assets/backgroundActivites.svg";
import tiger from "../assets/tiger_login.svg";
import booksImg from "../assets/bookes2.svg";
import sparckle from "../assets/teacher_sparckle.svg";
import footerProgress from "../assets/footerProgress.svg";

interface StudentProgressViewProps {
  classroomId: number;
  studentId?: number;
  onBack?: () => void;
}

/* ===================== ثوابت الستايل ===================== */

/**
 * كل الأبعاد مأخوذة من صورة التصميم (عرض الفريم 481px)،
 * والـ SCALE بيكبّرها كلها بنفس النسبة.
 * بدك الصفحة أصغر/أكبر؟ غيّر الرقم هون بس.
 */
const SCALE = 1.8;
const s = (n: number) => Math.round(n * SCALE);
const f = (n: number) => Math.max(12, s(n)); // الخط ما بينزل عن 12px
const DESIGN_WIDTH = 481;

const PAGE_BG = "#F8F7FF";
const PURPLE = "#8A63F0";
const TEXT_DARK = "#454444";
const TEXT_GRAY = "#8A8A8A";
const CARD_SHADOW = "0 4px 18px rgba(40, 52, 95, 0.08)";

// ألوان الأنشطة (حسب التصميم)
const ACTIVITY_COLORS: Record<string, string> = {
  learn: "#10B981",
  tashkeel: "#EC4899",
  game: "#164194",
  write: "#3B82F6",
  video: "#F59E0B",
  position: "#EF4444",
};

// ✅ صور الأنشطة المجسمة (حسب التصميم). فك الكومنت وحط مسارات صورك:
//   import learnImg from "../assets/learn_activity.svg";
// وإذا ما في صورة بيستخدم أيقونة lucide بدلها.
const ACTIVITY_IMAGES: Record<string, string> = {
  // learn: learnImg,
  // tashkeel: tashkeelImg,
  // game: gameImg,
  // write: writeImg,
  // video: videoImg,
  // position: positionImg,
};

const ACTIVITY_ICONS: Record<string, JSX.Element> = {
  learn: <img src={learn} />,
  write: <img src={write} />,
  position: <img src={Position} />,
  tashkeel: <img src={tashkeel} />,
  video: <img src={video} />,
  game: <img src={game} />,
};

const getActivityColor = (type: string) => ACTIVITY_COLORS[type] ?? "#164194";

const getActivityPercentage = (activityType: string, score: number): number => {
  switch (activityType) {
    case "learn":
    case "write":
    case "video":
      return score * 100;

    case "position":
    case "tashkeel":
      return score * 25;

    case "game":
      return score;

    default:
      return 0;
  }
};

// 20/1/2026
const formatDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ===================== شريط تقدم ===================== */

function ProgressBar({
  percentage,
  color,
  height = s(6),
}: {
  percentage: number;
  color: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      dir="ltr"
      style={{ height, backgroundColor: color + "26" }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.max(0, Math.min(percentage, 100))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

/* ===================== الكومبونينت ===================== */

export function StudentProgressView({
  classroomId,
  studentId,
  onBack,
}: StudentProgressViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    studentId ?? null,
  );
  const [showSplash, setShowSplash] = useState(true);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchClassroom = async () => {
    try {
      const res = await getClassById(Number(classroomId));
      setClassroom(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
    }
  }, [classroomId]);

  // قائمة الطلاب مطلوبة بس إذا ما انحدد طالب
  useEffect(() => {
    if (studentId) return;

    const fetchStudents = async () => {
      const res = await api.get(`/class/student/${classroomId}`);
      setStudents(res.data.data);
    };

    fetchStudents();
  }, [classroomId, studentId]);

  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchStudentProgress = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/progress/students/${selectedStudentId}/progress`,
        );
        setStudentData(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProgress();
  }, [selectedStudentId]);

  /* ---------- عرض قائمة الطلاب (لما ما يكون في طالب محدد) ---------- */
  if (!selectedStudentId) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{ backgroundColor: "#164194" }}
          >
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl" style={{ color: "#164194" }}>
              تقدم الطلاب
            </h2>
            <p className="text-gray-600">اختر طالباً لعرض إنجازاته التفصيلية</p>
          </div>
        </div>

        <div className="grid gap-4">
          {students.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ECEEEF" }}
              >
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">لا يوجد طلاب في هذا الصف بعد</p>
            </div>
          ) : (
            students.map((student) => {
              const stats = progressTracking.calculateStats(student.id);
              const hasProgress = true;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(Number(student.id))}
                  className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300 text-right"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-md"
                      style={{ backgroundColor: "#164194" }}
                    >
                      {student.username.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl mb-1" style={{ color: "#164194" }}>
                        {student.username}
                      </h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>

                    {hasProgress ? (
                      <div
                        className="text-center px-6 py-3 rounded-2xl shadow-md"
                        style={{
                          backgroundColor:
                            getScoreColor(stats.averageScore) + "15",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star
                            className="w-5 h-5"
                            style={{
                              color: getScoreColor(stats.averageScore),
                              fill: getScoreColor(stats.averageScore),
                            }}
                          />
                          <span
                            className="text-2xl"
                            style={{ color: getScoreColor(stats.averageScore) }}
                          >
                            {stats.averageScore}٪
                          </span>
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: getScoreColor(stats.averageScore) }}
                        >
                          {getScoreText(stats.averageScore)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center px-6 py-3 rounded-2xl bg-gray-100">
                        <Award className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                        <span className="text-sm text-gray-500">لم يبدأ</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  /* ---------- بيانات الطالب ---------- */
  const student = studentData?.student ?? {};
  const stats = studentData?.stats ?? {};
  const recentActivities: any[] = studentData?.recentActivities || [];
  const completedLetters: string[] = stats.completedLetters || [];
  const activityEntries = Object.entries(stats.activityScores || {}) as [
    string,
    number,
  ][];

  if (loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!studentData) {
    return <div>لا توجد بيانات لهذا الطالب</div>;
  }

  const averageScore = isNaN(stats.averageScore) ? 0 : stats.averageScore || 0;

  const statTiles = [
    { value: `${averageScore}%`, label: "المعدل العام", bg: "#F5F2FF" },
    { value: stats.totalActivities || 0, label: "الأنشطة", bg: "#EDF8F4" },
    {
      value: Math.floor((stats.totalTimeSpent || 0) / 60),
      label: "دقيقة",
      bg: "#FFF0F6",
    },
    { value: completedLetters.length, label: "حروف", bg: "#EEF4FD" },
  ];

  const alphabet: string[] = lettersComp.map((l: any) => l.arabic);

  return (
    <div
      className="w-full min-h-screen"
      dir="rtl"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="mx-auto w-full" style={{ paddingBottom: s(24) }}>
        {/* ================= الهيدر: اسم الصف + اسم الطالب ================= */}
        <div
          className="relative overflow-hidden"
          style={{
       backgroundImage: `url("${backgroundHeader}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                aspectRatio: "902 / 160", // عدّلها حسب أبعاد صورة الهيدر الأصلية
                minHeight: 180,
          }}
        >
          {/* زر الرجوع (اختياري) */}
          {onBack && (
            <button
              onClick={onBack}
              aria-label="رجوع"
              className="absolute flex items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{
                top: s(4),
                right: s(8),
                width: "50px",
                height: "50px",
                backgroundColor: "#FCFCFC",
                boxShadow: "0 2px 6px rgba(138, 99, 240, 0.25)",
              }}
            >
              <ArrowRight
                style={{ width: "35px", height: "35px", color: "#652b82" }}
              />
            </button>
          )}

          {/* اسم الصف (يمين) */}
          <div
            className="absolute flex items-center"
            style={{ right: "6%", top: s(30), gap: s(5) }}
          >
            <span
              className="rounded-full shrink-0"
              style={{
                width: s(6),
                height: s(6),
                backgroundColor: "#FECB27",
              }}
            />
            <h2
              className="font-bold whitespace-nowrap"
              style={{
                fontFamily: "tajawal",
                color: "#3B2F4F",
                fontSize: "40px",
              }}
            >
              {classroom?.name}
            </h2>
            <img
              src={sparckle}
              alt=""
              className="absolute"
              style={{ top: -s(14), left: -s(10), height: s(14) }}
            />
          </div>

          {/* كبسولة اسم الطالب */}
          <div
            className="absolute flex items-center rounded-full"
            style={{
              // left: s(14),
              right: "1%",
              bottom: "10%",
              fontSize: "30px",
              height: s(24),
              paddingInline: s(12),
              gap: s(6),
            }}
          >
            <img
              src={user_icon}
              style={{ width: "50px", height: "50px", color: PURPLE }}
            />
            <span
              style={{
                fontFamily: "tajawal",
                fontWeight: 400,
                color: TEXT_DARK,
              }}
            >
              {student.username}
            </span>
          </div>
        </div>

        <div
          className="flex flex-col"
          style={{ paddingInline: "100px", marginTop: s(10), gap: s(13) }}
        >
          {/* ================= كرت الإحصائيات + الأداء حسب النشاط ================= */}
          <div
            className="flex items-stretch"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: s(22),
              padding: s(14),
              gap: s(14),
              boxShadow: CARD_SHADOW,
            }}
          >
            {/* مربعات الإحصائيات (يمين) */}
            <div
              className="flex flex-col shrink-0"
              style={{ width: s(111), gap: "70px" }}
            >
              {statTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="relative"
                  style={{
                    backgroundColor: tile.bg,
                    borderRadius: s(10),
                    height: s(43),
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    className="absolute"
                    dir="ltr"
                    style={{
                      top: s(7),
                      left: s(11),
                      fontFamily: "tajawal",
                      fontWeight: 700,
                      fontSize: f(11),
                      color: "#4E4E4E",
                    }}
                  >
                    {tile.value}
                  </span>
                  <span
                    className="absolute"
                    style={{
                      bottom: s(6),
                      right: s(7),
                      fontFamily: "tajawal",
                      fontWeight: 400,
                      fontSize: f(12),
                      color: TEXT_GRAY,
                      letterSpacing: 0.3,
                    }}
                  >
                    {tile.label}
                  </span>
                </div>
              ))}
            </div>

            {/* الأداء حسب النشاط (يسار) */}
            <div
              className="flex-1 flex flex-col justify-between"
              dir="ltr"
              style={{ minWidth: 0, gap: "25px" }}
            >
              {activityEntries.length > 0 ? (
                activityEntries.map(([activityType, score]) => {
                  const percentage = getActivityPercentage(activityType, score);
                  const color = getActivityColor(activityType);

                  return (
                    <div
                      key={activityType}
                      className="flex items-center"
                      style={{ gap: s(14) }}
                    >
                      {/* الأيقونة */}
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={
                          ACTIVITY_IMAGES[activityType]
                            ? { width: s(30), height: s(30) }
                            : {
                                width: "80px",
                                height: "65px",
                                // borderRadius: s(9),
                                // backgroundColor: color + "1F",
                                color,
                              }
                        }
                      >
                        {ACTIVITY_IMAGES[activityType] ? (
                          <img
                            src={ACTIVITY_IMAGES[activityType]}
                            alt={activityType}
                            style={{
                              width: s(30),
                              height: s(30),
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          (ACTIVITY_ICONS[activityType] ?? (
                            <BookOpen style={{ width: s(16), height: s(16) }} />
                          ))
                        )}
                      </div>

                      {/* الاسم + النسبة + الشريط */}
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div
                          className="flex items-center justify-between"
                          style={{ marginBottom: s(4) }}
                        >
                          <span
                            style={{
                              fontFamily: "tajawal",
                              fontWeight: 400,
                              fontSize: f(11),
                              letterSpacing: 0.6,
                              color: "#626262",
                            }}
                          >
                            {capitalize(activityType)}
                          </span>
                          <span
                            style={{
                              fontFamily: "tajawal",
                              fontWeight: 500,
                              fontSize: f(12),
                              color,
                            }}
                          >
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <ProgressBar percentage={percentage} color={color} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className="text-center rounded-xl w-full flex flex-col justify-center items-center"
                  style={{ backgroundColor: "#F3F2F8", minHeight: s(160) }}
                  dir="rtl"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">لا توجد أنشطة بعد</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= النشاطات الأخيرة ================= */}
          <div
            className="overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: `${s(6)}px ${s(6)}px ${s(24)}px ${s(24)}px`,
              boxShadow: CARD_SHADOW,
            }}
          >
            {/* الشريط العلوي */}
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                height: "100px",
                backgroundImage: `url("${backgroundActivites}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h3
                style={{
                  fontFamily: "tajawal",
                  fontWeight: 500,
                  fontSize: f(12),
                  color: TEXT_DARK,
                }}
              >
                النشاطات الأخيرة
              </h3>
            </div>

            <div
              className="flex flex-col"
              style={{
                paddingInline: s(38),
                paddingTop: s(11),
                paddingBottom: s(15),
                gap: s(8),
              }}
            >
              {recentActivities.length === 0 ? (
                <div
                  className="text-center py-8 rounded-xl"
                  style={{ backgroundColor: "#F3F2F8" }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">لا توجد نشاطات بعد</p>
                </div>
              ) : (
                recentActivities.map((activity: any, index: number) => {
                  const percentage = getActivityPercentage(
                    activity.lessonName,
                    activity.score,
                  );
                  const color = getScoreColor(percentage);

                  return (
                    <div
                      key={index}
                      className="flex items-center"
                      style={{
                        height: s(35),
                        paddingInline: s(12),
                        gap: s(10),
                        border: "1px solid #E6E3EE",
                        borderRadius: s(10),
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {/* معلومات النشاط (يمين) */}
                      <div className="shrink-0" style={{ minWidth: s(75) }}>
                        <p
                          style={{
                            fontFamily: "tajawal",
                            fontWeight: 500,
                            fontSize: f(10),
                            color: "#272626",
                          }}
                        >
                          {
                            ACTIVITY_NAMES[
                              activity.lessonName as keyof typeof ACTIVITY_NAMES
                            ]
                          }{" "}
                          {activity.activityType} {activity.letter}
                        </p>
                        <div
                          className="flex items-center"
                          style={{
                            gap: s(4),
                            marginTop: s(2),
                            fontFamily: "tajawal",
                            fontSize: f(8.5),
                            color: TEXT_GRAY,
                          }}
                        >
                          <span>{formatDate(activity.completedAt)}</span>
                          <span
                            className="flex items-center"
                            style={{ gap: 2 }}
                          >
                            <Clock style={{ width: s(6), height: s(6) }} />
                            {Math.ceil(activity.timeSpent / 60)} دقيقة
                          </span>
                        </div>
                      </div>

                      {/* النسبة + الشريط (يسار) */}
                      <div
                        className="flex-1 flex items-center"
                        dir="ltr"
                        style={{ gap: s(6), minWidth: 0 }}
                      >
                        <span
                          className="shrink-0"
                          style={{
                            width: s(30),
                            fontFamily: "tajawal",
                            fontWeight: 500,
                            fontSize: f(11),
                            color,
                          }}
                        >
                          {Math.round(percentage)}%
                        </span>
                        <ProgressBar
                          percentage={percentage}
                          color={color}
                          height={s(5)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= الحروف المدروسة ================= */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: s(18),
              border: "1.5px solid #C9B6F5",
              backgroundImage: `url("${footerProgress}")`,
              // backgroundSize: "cover",
              backgroundPosition: "center",
              padding: `${s(10)}px ${s(10)}px`,
              minHeight: s(80),
            }}
          >
            {/* الصورة (يسار) */}
            <img
              src={booksImg}
              alt=""
              className="absolute"
              style={{
                left: s(6),
                bottom: 0,
                height: s(62),
                objectFit: "contain",
              }}
            />

            {/* المحتوى (يمين) */}
            <div style={{ width: "37%", maxWidth: "62%" }}>
              <h3
                style={{
                  marginBottom: s(6),
                  fontFamily: "tajawal",
                  fontWeight: 700,
                  fontSize: f(13),
                  color: "#272626",
                }}
              >
                الحروف المدروسة {completedLetters.length}{" "}
                {completedLetters.length >= 3 && completedLetters.length <= 10
                  ? "احرف"
                  : "حرف"}
              </h3>

              <div className="flex flex-wrap" style={{ gap: s(2) }}>
                {alphabet.map((letter) => {
                  const done = completedLetters.includes(letter);
                  return (
                    <div
                      key={letter}
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: s(18),
                        height: s(18),
                        backgroundColor: done ? "#ACDAA9" : "#FFFFFF",
                        color: "#272626",
                        fontFamily: "tajawal",
                        fontSize: f(12.5),
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
