import { useNavigate } from "react-router-dom";
import { TeacherHeader } from "../components/TeacherHeader";

import laptop from "../assets/labtop_teacherDashborad.svg";
import booksImg from "../assets/bookes2.svg";
import alphabet_teacher from "../assets/alphabet teacherDashboard.svg";
import headerBackground from "../assets/Backgroun_teacher.svg";
import sparckle from "../assets/teacher_sparckle.svg";
const sections = [
  {
    id: "resources",
    title: "موارد المعلم",
    icon: booksImg,
    description: "نصائح ومصادر تعليمية",
    bg: "#F0F6FD",
    tab: "#C9E3FA",
  },
  {
    id: "students",
    title: "الصفوف",
    icon: laptop,
    description: "إدارة الصفوف والطلاب",
    bg: "#F8F0FF",
    tab: "#E4CCF8",
  },
  {
    id: "letters",
    title: "الحروف",
    icon: alphabet_teacher,
    description: "تعليم الحروف العربية",
    bg: "#FFF8EE",
    tab: "#F9D46B",
  },
];

export function TeacherHomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      {/* ================= الهيدر (صورة الخلفية + النافبار) ================= */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: `url("${headerBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          aspectRatio: "900 / 222", // عدّلها حسب أبعاد صورة الهيدر الأصلية
          minHeight: 180,
        }}
      >
        {/* النافبار الخاص بالمعلم (فوق الصورة) */}
        <div className="absolute top-0 left-0 w-full">
          <TeacherHeader showHome={false} color="#FFFFFF" />
        </div>

        {/* النص بنص الهيدر */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
          style={{ top: "44%" }}
          dir="rtl"
        >
          <span
            className="rounded-full"
            style={{ width: 14, height: 14, backgroundColor: "#FECB27" }}
          />
          <h1
            className="font-bold whitespace-nowrap"
            style={{
              fontFamily: "tajawal",
              color: "#3B2F4F",
              fontSize: "clamp(14px, 2.2vw, 25px)",
            }}
          >
            رحلة تعليم اللغة العربية تبدأ هنا
          </h1>
          <span
            className="relative rounded-full"
            style={{ width: 14, height: 14, backgroundColor: "#FECB27" }}
          >
          </span>
        <img src={sparckle} className="absolute" style={{top:"-50px" ,left:"80px",height:"35px"}}/>
        </div>

        {/* تبويب "اختر القسم" */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-8 md:px-12 pt-4 pb-3 text-center"
          style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
        >
          <p
            style={{
              fontSize: 16,
              fontFamily: "tajawal",
              fontWeight: 500,
              color: "#6E5F3B",
            }}
          >
            اختر القسم الذي تريد الانتقال إليه
          </p>
        </div>
      </div>

      {/* ================= الكروت ================= */}
      <main
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4 py-8 bg-white"
        dir="rtl"
      >
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/teacher/${s.id}`)}
            className="relative pt-14 pb-8 px-6 transition hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: s.bg, borderRadius: 20 }}
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 py-1.5 whitespace-nowrap"
              style={{
                backgroundColor: s.tab,
                fontFamily: "tajawal",
                fontSize: 18,
                fontWeight: 500,
                width: 190,
                borderRadius: "0 0 40px 40px",
                color: "#4E4E4E",
              }}
            >
              {s.title}
            </span>

            <img
              src={s.icon}
              alt={s.title}
              className="mx-auto h-36 object-contain"
              style={{ marginTop: 55 }}
            />

            <p
              className="mt-6"
              style={{
                fontSize: 20,
                fontFamily: "tajawal",
                fontWeight: 500,
                color: "#4E4E4E",
              }}
            >
              {s.description}
            </p>
          </button>
        ))}
      </main>
    </div>
  );
}
