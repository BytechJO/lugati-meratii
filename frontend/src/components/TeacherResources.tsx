import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TeacherHeader } from "./TeacherHeader";
import { ResourceCard, type Resource } from "./ResourceCard";
import headerBackground from "../assets/Backgroun_teacher.svg";
import bookLaibrary from "../assets/books_laibrarey.svg";
import bookLaibrary2 from "../assets/books_laibrarey 2.svg";
import alphabet_Card from "../assets/alphabet Card.svg";
import cheatsheet from "../assets/cheatsheet.svg";
import activeties from "../assets/activeties.svg";
import evaluation from "../assets/evaluation.svg";
import wordCard from "../assets/Word_card.svg";
import planImg from "../assets/Plan_img.svg";
import sparckle from "../assets/teacher_sparckle.svg";

type LibraryId = "rawad" | "miraty";

const HOME_TITLE = "موارد المعلم";
const HOME_SUBTITLE = "رحلة تعليم اللغة العربية تبدأ هنا";

const libraries = [
  {
    id: "rawad" as LibraryId,
    title: "مكتبة الرواد",
    description: "مواد تعليمية متنوعة ومميزة",
    icon: bookLaibrary,
    bg: "#F8F0FF",
    tab: "#E4CCF8",
    blob: "#E4CCF8",
    // ✅ النص اللي بيظهر بالهيدر (العنوان الغامق) لما تفتح هالمكتبة
    headerTitle: "رحلة تعليم اللغة العربية تبدأ هنا",
  },
  {
    id: "miraty" as LibraryId,
    title: "مكتبة مرآتي لغتي",
    description: "محتوى خاص بمنهج مرآتي لغتي",
    icon: bookLaibrary2,
    bg: "#FFF8EE",
    tab: "#F9D46B",
    blob: "#FFE2B0",
    headerTitle: "موارد المعلم",
  },
];

const resourcesByLibrary: Record<LibraryId, Resource[]> = {
  rawad: [
    {
      id: 1,
      title: "بطاقات الحروف العربية",
      description: "بطاقات ملونة لجميع الحروف",
      type: "PDF",
      pages: "28 صفحة",
      size: "2.5 MB",
      icon: cheatsheet,
    },
    {
      id: 2,
      title: "أوراق عمل تتبع الحروف",
      description: "تدريبات لرسم الحروف",
      type: "PDF",
      pages: "35 صفحة",
      size: "3.2 MB",
      icon: alphabet_Card,
    },
    {
      id: 3,
      title: "أنشطة الأرقام العربية",
      description: "تعليم الأرقام بطريقة ممتعة",
      type: "PDF",
      pages: "15 صفحة",
      size: "1.8 MB",
      icon: activeties,
    },
  ],
  miraty: [
    {
      id: 1,
      title: "خطة الدرس: الأسبوع 1-4",
      description: "خطة شاملة للأسابيع الأولى",
      type: "PDF",
      pages: "20 صفحة",
      size: "2.1 MB",
      icon: planImg,
    },
    {
      id: 2,
      title: "بطاقات الكلمات المصورة",
      description: "كلمات مع صور توضيحية",
      type: "PDF",
      pages: "50 صفحة",
      size: "4.5 MB",
      icon: wordCard,
    },
    {
      id: 3,
      title: "قوالب التقييم",
      description: "نماذج لتقييم الطلاب",
      type: "PDF",
      pages: "20 صفحة",
      size: "1.5 MB",
      icon: evaluation,
    },
  ],
};

export function TeacherResources() {
  const navigate = useNavigate();
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryId | null>(
    null,
  );

  const currentLibrary = libraries.find((l) => l.id === selectedLibrary);
  const currentResources = selectedLibrary
    ? resourcesByLibrary[selectedLibrary]
    : [];

  // ✅ نص الهيدر حسب الصفحة:
  //   - صفحة المكتبات:  "موارد المعلم" + "رحلة تعليم اللغة العربية تبدأ هنا"
  //   - داخل مكتبة:     عنوان المكتبة (headerTitle) + اسم المكتبة
  const headerTitle = currentLibrary ? currentLibrary.headerTitle : HOME_TITLE;
  const headerSubtitle = currentLibrary ? currentLibrary.title : HOME_SUBTITLE;

  const handleBack = () => {
    if (selectedLibrary) setSelectedLibrary(null);
    else navigate("/teacher/home");
  };

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
          aspectRatio: "900 / 222", // نفس أبعاد صفحة المعلم الرئيسية
          minHeight: 180,
        }}
      >
        <div className="absolute top-0 left-0 w-full">
          <TeacherHeader
            showHome={false}
            showBackButton
            onBack={handleBack}
            color="#FFFFFF"
          />
        </div>

        {/* النص بنص الهيدر: عنوان غامق بين نقطتين + سطر ثاني خفيف */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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
                fontSize: "clamp(14px, 2.2vw, 25px)",
              }}
            >
              {headerTitle}
            </h1>
            <span
              className="rounded-full shrink-0"
              style={{ width: 14, height: 14, backgroundColor: "#FECB27" }}
            />

            {/* الشرطات الصفراء: ملتصقة بطرف العنوان مهما كان طوله */}
            <img
              src={sparckle}
              alt=""
              className="absolute"
              style={{ top: -33, left: "18%", height: 35 }}
            />
          </div>

          <p
            className="whitespace-nowrap"
            style={{
              fontFamily: "tajawal",
              fontWeight: 400,
              color: "#4E4E4E",
              fontSize: "clamp(12px, 1.6vw, 18px)",
            }}
          >
            {headerSubtitle}
          </p>
        </div>

        {/* التبويب السفلي */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-8 md:px-12 pt-4 pb-3 text-center"
          style={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            maxWidth: "90%",
          }}
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

      {/* ================= المحتوى ================= */}
      <main className="w-full max-w-5xl px-4 py-8 bg-white">
        {!selectedLibrary ? (
          // ---------- المكتبات ----------
          <div
            className="flex md:flex-row justify-center items-stretch gap-5 mx-auto"
            dir="rtl"
          >
            {libraries.map((lib, i) => (
              <motion.button
                key={lib.id}
                onClick={() => setSelectedLibrary(lib.id)}
                className="relative pt-14 pb-8 px-6 transition hover:shadow-xl w-full md:w-96"
                style={{ backgroundColor: lib.bg, borderRadius: 40 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 py-2 whitespace-nowrap"
                  style={{
                    backgroundColor: lib.tab,
                    fontFamily: "tajawal",
                    fontSize: 22,
                    fontWeight: 500,
                    width: 190,
                    borderRadius: "0 0 40px 40px",
                    color: "#4E4E4E",
                  }}
                >
                  {lib.title}
                </span>

                {/* الأيقونة مع الشكل الملون خلفها */}
                <div
                  className="relative flex items-center justify-center mx-auto"
                  style={{ height: 190, marginTop: 20 }}
                >
                  <span
                    className="absolute"
                    style={{
                      width: 230,
                      height: 180,
                      marginTop: 50,
                      // backgroundColor: lib.blob,
                      borderRadius: "60% 40% 55% 45% / 55% 50% 50% 45%",
                    }}
                  />
                  <img
                    src={lib.icon}
                    alt={lib.title}
                    className="relative z-10 object-contain"
                    style={{ height: 170, marginTop: 100 }}
                  />
                </div>

                <p
                  className="mt-12"
                  style={{
                    fontSize: 20,
                    fontFamily: "tajawal",
                    fontWeight: 500,
                    color: "#4E4E4E",
                    marginTop: 50,
                  }}
                >
                  {lib.description}
                </p>
              </motion.button>
            ))}
          </div>
        ) : (
          // ---------- موارد المكتبة المختارة ----------
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentResources.map((resource, i) => (
              <ResourceCard key={resource.id} resource={resource} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}