import { useState, useEffect } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Classroom } from "../types";
import {
  getTeacherClasses,
  createClass,
  deleteClassById,
} from "../API/classrooms";

import writeIconNavey from "../assets/write icon nave.svg";
import vectorEnd from "../assets/vector_end.svg";

/* أعمدة الجدول (من اليمين لليسار): أيقونة | اسم الصف | الكود | عدد الطلاب | حذف */
const GRID_COLUMNS = "100px 1fr 1fr 1fr 100px";

interface ClassroomManagementProps {
  /** مودال إنشاء صف: الـ state عند الصفحة الأم، لأنه الزر موجود بالهيدر تبعها */
  showCreateModal: boolean;
  onCloseCreateModal: () => void;
}

export function ClassroomManagement({
  showCreateModal,
  onCloseCreateModal,
}: ClassroomManagementProps) {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Classroom | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await getTeacherClasses();
      setClassrooms(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectClassroom = (classId: number) => {
    navigate(`/teacher/students/${classId}`);
  };

  const closeCreateModal = () => {
    onCloseCreateModal();
    setNewClassName("");
  };

  const handleCreateClassroom = async () => {
    if (!newClassName.trim()) return;

    try {
      await createClass(newClassName);
      await fetchClassrooms();
      closeCreateModal();
    } catch (error: any) {
      console.log(error);

      if (error.response?.status === 409) {
        alert("كود الصف موجود مسبقًا، حاول مرة ثانية");
      } else {
        alert("فشل إنشاء الصف");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      await deleteClassById(classToDelete.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classToDelete.id));
      handleCancelDelete();
    } catch (error) {
      console.error(error);
      alert("فشل حذف الصف");
    }
  };

  return (
    <div dir="rtl">
      {/* ================= المحتوى ================= */}
      <div>
        {classrooms.length === 0 ? (
          /* ---------- ما في صفوف ---------- */
          <div
            className="text-center py-16 rounded-3xl flex flex-col justify-center items-center"
            style={{ gap: 20, backgroundColor: "#F7F5FC" }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#EAE6FA" }}
            >
              <img src={writeIconNavey} className="w-10 md:w-14" />
            </div>
            <p
              className="text-lg md:text-xl lg:text-2xl"
              style={{
                color: "#3E3E3E",
                fontFamily: "tajawal",
                fontWeight: 400,
              }}
            >
              لا توجد صفوف بعد، اضغط على "إنشاء صف جديد" للبدء
            </p>
          </div>
        ) : (
          /* ---------- جدول الصفوف ---------- */
          <div>
            {/* رأس الجدول */}
            <div
              className="grid items-center text-center"
              style={{
                gridTemplateColumns: GRID_COLUMNS,
                backgroundColor: "#EBE6FB",
                borderRadius: "28px 28px 0 0",
                height: 46,
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: "clamp(12px, 1.4vw, 16px)",
                color: "#3E3E3E",
              }}
            >
              <div />
              <div>إسم الصف</div>
              <div>كود الصف</div>
              <div>عدد الطلاب</div>
              <div />
            </div>

            {/* الصفوف */}
            {classrooms.map((classroom, index) => (
              <motion.div
                key={classroom.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => handleSelectClassroom(classroom.id)}
                className="grid items-center text-center"
                style={{
                  gridTemplateColumns: GRID_COLUMNS,
                  backgroundColor: "#F7F5FC",
                  borderRadius: 12,
                  height: 58,
                  marginTop: index === 0 ? 2 : 12,
                  cursor: "pointer",
                  fontFamily: "tajawal",
                  color: "#3E3E3E",
                }}
              >
                {/* أيقونة التعديل / الدخول للصف (أقصى اليمين) */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    aria-label="فتح الصف"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClassroom(classroom.id);
                    }}
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#9B4FDB",
                    }}
                  >
                    <SquarePen className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* اسم الصف */}
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(12px, 1.7vw, 20px)",
                  }}
                >
                  {classroom.name}
                </div>

                {/* كود الصف */}
                <div className="flex justify-center">
                  <span
                    className="tracking-wider"
                    style={{
                      backgroundColor: "#EAE6FA",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontWeight: 500,
                      fontSize: "clamp(12px, 1.4vw, 16px)",
                    }}
                  >
                    {classroom.code}
                  </span>
                </div>

                {/* عدد الطلاب */}
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(12px, 1.4vw, 16px)",
                  }}
                >
                  {classroom.students_count} طالب
                </div>

                {/* حذف (أقصى اليسار) */}
                <div className="flex justify-center">
                  <motion.button
                    type="button"
                    aria-label="حذف الصف"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClassToDelete(classroom);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: "#E9E7EE",
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-5 h-5" style={{ color: "#3E3E3E" }} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ================= مودال إنشاء صف ================= */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCreateModal}
          >
            <motion.div
              className="w-full max-w-lg mx-4 overflow-hidden flex justify-center"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="bg-gray-100 py-10 text-center flex flex-col gap-10"
                style={{ width: "55%", minWidth: 300 }}
              >
                {/* Header */}
                <div
                  className="shadow-md flex items-center text-lg md:text-xl lg:text-2xl"
                  style={{
                    backgroundColor: "#652B82",
                    borderRadius: "0px 0px 25px 25px",
                    fontFamily: "tajawal",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    paddingRight: 20,
                    height: 73,
                  }}
                >
                  إنشاء صف جديد
                </div>

                <div
                  className="flex flex-col justify-center items-start"
                  style={{ marginRight: 40 }}
                >
                  <p
                    className="mb-6 text-lg md:text-xl lg:text-2xl"
                    style={{
                      fontFamily: "tajawal",
                      fontWeight: 700,
                      color: "#3E3E3E",
                    }}
                  >
                    إسم الصف
                  </p>

                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="صف اللغة العربية - 563"
                    className="bg-gray-200 px-4 py-4 text-right outline-none focus:ring-2 focus:ring-[#FDC333] transition"
                    style={{ width: "90%" }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-6 mb-8">
                  <button
                    onClick={handleCreateClassroom}
                    className="px-10 py-2 shadow-md hover:scale-105 transition text-lg md:text-xl lg:text-2xl"
                    style={{
                      backgroundColor: "#FDC333",
                      borderRadius: 10,
                      fontFamily: "tajawal",
                      color: "#2D2D2D",
                      fontWeight: 500,
                    }}
                  >
                    إضافة
                  </button>
                  <button
                    onClick={closeCreateModal}
                    className="px-10 py-2 shadow-md hover:scale-105 transition text-lg md:text-xl lg:text-2xl"
                    style={{
                      backgroundColor: "#FDC333",
                      borderRadius: 10,
                      fontFamily: "tajawal",
                      color: "#2D2D2D",
                      fontWeight: 500,
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= مودال تأكيد الحذف ================= */}
      <AnimatePresence>
        {showDeleteModal && classToDelete && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelDelete}
          >
            <motion.div
              className="bg-white rounded-[28px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center max-w-md w-full mx-4 relative overflow-hidden"
              initial={{ scale: 0.7, y: 80 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 80 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ borderRadius: 20 }}
              dir="rtl"
            >
              {/* الزخرفة الصفراء */}
              <img className="absolute top-0 left-0" src={vectorEnd} />

              {/* أيقونة التحذير */}
              <div className="relative z-10 flex justify-center mb-4">
                <motion.div
                  className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full flex items-center justify-center z-10 relative"
                  style={{ backgroundColor: "#fee2e2" }}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <span className="text-3xl md:text-4xl">⚠️</span>
                </motion.div>
              </div>

              <motion.h2
                className="text-base md:text-xl lg:text-2xl mb-2"
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontWeight: 500,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                تأكيد الحذف
              </motion.h2>

              <motion.p
                className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontWeight: 500,
                }}
              >
                هل أنت متأكد من حذف الصف
                <br />
                <span
                  className="font-semibold text-base md:text-xl lg:text-2xl"
                  style={{ color: "#28345F", fontFamily: "amiriQuran" }}
                >
                  {classToDelete.name}
                </span>
                ؟
                <br />
                لا يمكن التراجع عن هذا الإجراء.
              </motion.p>

              <div
                className="flex gap-4 justify-center"
                style={{ marginTop: 20 }}
              >
                <motion.button
                  onClick={handleCancelDelete}
                  style={{ backgroundColor: "#FDC333" }}
                  className="px-6 py-2.5 rounded-xl text-white font-medium shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  إلغاء
                </motion.button>

                <motion.button
                  onClick={handleConfirmDelete}
                  style={{ backgroundColor: "#f32525", color: "#ffffff" }}
                  className="px-6 py-2.5 rounded-xl font-medium shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  حذف
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}