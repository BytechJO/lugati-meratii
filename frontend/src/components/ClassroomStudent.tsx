import { Users, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { TeacherHeader } from "./TeacherHeader";
import { StudentProgressView } from "./StudentProgressView";
import { copyToClipboard } from "../utils/clipboard";
import { getStudentsByClassId, getClassById } from "../API/classrooms";
import { Classroom, ClassStudent } from "../types";
import headerBackground from "../assets/Backgroun_teacher.svg";
import sparckle from "../assets/teacher_sparckle.svg";

/* أعمدة الجدول (من اليمين لليسار): أيقونة | اسم الطالب | الإيميل | العدد/فاضي */
const GRID_COLUMNS = "140px 150px 1fr 200px";

export function ClassroomStudent() {
  const navigate = useNavigate();
  const { classroomId } = useParams<{ classroomId: string }>();

  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(
    null,
  );
  const [loadingStudents, setLoadingStudents] = useState(true);

  const handleCopyCode = (code: string) => {
    copyToClipboard(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchClassroom = async () => {
    try {
      const res = await getClassById(Number(classroomId));
      setClassroom(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectClassroom = async (classId: number) => {
    setLoadingStudents(true);
    setSelectedClassroomId(classId);
    try {
      const res = await getStudentsByClassId(classId);
      setStudents(res.data.data);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
      handleSelectClassroom(Number(classroomId));
    }
  }, [classroomId]);

  /* ===================== عرض تفاصيل طالب محدد ===================== */
  // الهيدر (اسم الصف + النمر + كبسولة الطالب + زر الرجوع) صار كله جوّا StudentProgressView
  if (selectedStudentId && selectedClassroomId) {
    return (
      <StudentProgressView
        classroomId={selectedClassroomId}
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  /* ===================== قائمة الطلاب ===================== */
  return (
    <div
      className="min-h-screen w-full bg-white flex flex-col items-center"
      dir="rtl"
    >
      {/* ================= الهيدر (صورة الخلفية + النافبار) ================= */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: `url("${headerBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          aspectRatio: "900 / 222",
          minHeight: 180,
        }}
      >
        <div className="absolute top-0 left-0 w-full">
          <TeacherHeader
            showHome={false}
            showBackButton
            onBack={() => navigate("/teacher/students")}
            color="#FFFFFF"
          />
        </div>

        {/* العنوان بنص الهيدر */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "44%" }}
        >
          <div className="relative flex items-center gap-3">
            <span
              className="rounded-full shrink-0"
              style={{ width: 14, height: 14, backgroundColor: "#FECB27" }}
            />
            <h1
              className="font-bold whitespace-nowrap"
              style={{
                fontFamily: "tajawal",
                color: "#3B2F4F",
                fontSize: "clamp(18px, 3.1vw, 40px)",
              }}
            >
              الصفوف
            </h1>
            <span
              className="rounded-full shrink-0"
              style={{ width: 14, height: 14, backgroundColor: "#FECB27" }}
            />
            <img
              src={sparckle}
              alt=""
              className="absolute"
              style={{ top: -33, left: "12%", height: 35 }}
            />
          </div>
        </div>
      </div>

      {/* ================= المحتوى ================= */}
      <main className="w-full max-w-5xl px-4 md:px-6 py-6 bg-white">
        {loadingStudents ? (
          <p
            className="text-center py-10"
            style={{ fontFamily: "tajawal", color: "#7B7B7B" }}
          >
            جاري تحميل الطلاب...
          </p>
        ) : students.length === 0 ? (
          /* ---------- ما في طلاب ---------- */
          <div
            className="text-center py-14 rounded-3xl flex flex-col items-center"
            style={{ backgroundColor: "#F7F5FC", gap: 12, padding: 20 }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#EAE6FA" }}
            >
              <Users className="w-10 h-10" style={{ color: "#652b82" }} />
            </div>
            <p
              className="text-lg md:text-xl"
              style={{ fontFamily: "tajawal", color: "#3E3E3E" }}
            >
              لا يوجد طلاب في هذا الصف
            </p>
            <p
              className="text-sm md:text-base"
              style={{ fontFamily: "tajawal", color: "#7B7B7B" }}
            >
              شارك الكود مع الطلاب للانضمام
            </p>

            {classroom?.code && (
              <div className="flex items-center gap-2 mt-2">
                <code
                  className="tracking-wider"
                  style={{
                    backgroundColor: "#EAE6FA",
                    borderRadius: 8,
                    padding: "8px 18px",
                    fontFamily: "tajawal",
                    fontWeight: 500,
                    fontSize: 16,
                    color: "#3E3E3E",
                  }}
                >
                  {classroom.code}
                </code>
                <button
                  onClick={() => handleCopyCode(classroom.code)}
                  aria-label="نسخ الكود"
                  className="p-2 rounded-lg hover:bg-white transition-all"
                >
                  {copiedCode === classroom.code ? (
                    <Check className="w-5 h-5" style={{ color: "#10b981" }} />
                  ) : (
                    <Copy className="w-5 h-5" style={{ color: "#652b82" }} />
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ---------- جدول الطلاب ---------- */
          <div>
            {/* رأس الجدول */}
            <div
              className="grid items-center text-center"
              style={{
                gridTemplateColumns: GRID_COLUMNS,
                backgroundColor: "#EBE6FB",
                borderRadius: "28px 28px 0 0",
                height: 56,
                fontFamily: "tajawal",
                color: "#3E3E3E",
              }}
            >
              <div />
              <div style={{ fontSize: "clamp(12px, 1.4vw, 20px)" }}>
                إسم الطالب
              </div>
              <div style={{ fontSize: "clamp(13px, 1.5vw, 20px)" }}>
                ايميل الطالب
              </div>
              <div
                className="justify-self-end"
                style={{
                  fontSize: "clamp(14px, 1.7vw, 20px)",
                  paddingInlineEnd: 20,
                }}
              >
                {students.length} طالب
              </div>
            </div>

            {/* الصفوف */}
            {students.map((student, index) => (
              <motion.div
                key={student.id}
                role="button"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedStudentId(student.id)}
                className="grid items-center text-center"
                style={{
                  gridTemplateColumns: GRID_COLUMNS,
                  backgroundColor: "#F7F5FC",
                  borderRadius: 12,
                  height: 70,
                  marginTop: index === 0 ? 2 : 14,
                  cursor: "pointer",
                  fontFamily: "tajawal",
                }}
              >
                {/* أيقونة الطالب (أقصى اليمين) */}
                <div className="flex justify-center">
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      backgroundColor: "#9B4FDB",
                    }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </span>
                </div>

                {/* اسم الطالب */}
                <div
                  style={{
                    color: "#7B7B7B",
                    fontWeight: 400,
                    fontSize: "clamp(14px, 1.6vw, 22px)",
                  }}
                >
                  {student.username}
                </div>

                {/* الإيميل */}
                <div className="flex justify-center">
                  <span
                    dir="ltr"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 8,
                      padding: "10px 18px",
                      color: "#3E3E3E",
                      fontSize: "clamp(11px, 1.4vw, 22px)",
                      letterSpacing: 0.5,
                      width:"220px",
                    }}
                  >
                    {student.email}
                  </span>
                </div>

                <div />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}