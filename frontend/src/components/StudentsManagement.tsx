import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClassroomManagement } from "./ClassroomManagement";
import { TeacherHeader } from "./TeacherHeader";
import headerBackground from "../assets/Backgroun_teacher.svg";
import sparckle from "../assets/teacher_sparckle.svg";

/**
 * الصفحة الأم (اللاياوت الأساسي):
 *  - الهيدر (صورة الخلفية + النافبار + العنوان + زر إنشاء صف جديد)
 *  - منطقة المحتوى اللي بيتعرض جواها ClassroomManagement
 */
export function StudentsManagement() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        {/* النافبار: اسم المستخدم + الخروج + زر الرجوع (شمال) */}
        <div className="absolute top-0 left-0 w-full">
          <TeacherHeader
            showHome={false}
            showBackButton
            onBack={() => navigate("/teacher/home")}
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

        {/* زر إنشاء صف جديد (أسفل يمين الهيدر) */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="absolute flex items-center gap-2 rounded-full px-6 py-2.5"
          style={{
            right: 16,
            bottom: 12,
            background: "linear-gradient(180deg, #FFE066 0%, #FDB913 100%)",
            color: "#3E3E3E",
            fontFamily: "tajawal",
            fontWeight: 600,
            fontSize: "clamp(14px, 1.8vw, 20px)",
            boxShadow: "0 8px 16px rgba(253, 185, 19, 0.45)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء صف جديد</span>
        </motion.button>
      </div>

      {/* ================= المحتوى: هون بيتعرض ClassroomManagement ================= */}
      <main className="w-full max-w-5xl px-4 md:px-6 py-6 bg-white">
        <ClassroomManagement
          showCreateModal={showCreateModal}
          onCloseCreateModal={() => setShowCreateModal(false)}
        />
      </main>
    </div>
  );
}