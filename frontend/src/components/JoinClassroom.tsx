import { useState, useEffect } from "react";
import { Users, LogIn, ArrowRight, GraduationCap, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { storage } from "../utils/storage";
import { User } from "../types";
import { AppHeader } from "./AppHeader";
import { useNavigate } from "react-router-dom";
import { joinClassroomByCode } from "../API/classrooms";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllClasses, fetchMyClass } from "../redux/reducers/classSlice";
import { RootState, AppDispatch } from "../redux/store";
import tiger from "../assets/my-class-tiger.svg";
import notification from "../assets/notifications_icon.svg";
import homeIcon from "../assets/Home.svg";
import { logout } from "../redux/reducers/auth";
import { clearMyClass } from "../redux/reducers/classSlice";
import { SuccessJoin } from "./SuccessJoin";
import "./JoinClassroom.css"

interface JoinClassroomProps {
  // student: User;
  onClose: () => void;
  // onJoined: () => void;
}

export function JoinClassroom({
  // student,
  onClose,
}: // onJoined,
JoinClassroomProps) {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("JOIN CLASS COMPONENT MOUNTED");

    dispatch(fetchMyClass());
    dispatch(fetchAllClasses());
  }, [dispatch]);

  const handleJoin = async () => {
    try {
      await joinClassroomByCode(classCode);
      // 🔥 رجّعي الصف من الباك إند
      dispatch(fetchMyClass());
      navigate(`/my-classroom/${classCode}`);

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ");
    }
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    // dispatch(clearMyClass());
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" dir="rtl">
        {/* خلفية متدرجة */}
        <div
          className="fixed inset-0"
          style={{
            background: "linear-gradient(120deg, #A68BB7 75%, #FFFBE8 100%)",
          }}
        ></div>

        {/* عناصر زخرفية متحركة */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-56 h-56 md:w-64 md:h-64 rounded-full opacity-10"
            style={{ backgroundColor: "#fad656" }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-64 h-64 md:w-80 md:h-80 rounded-full opacity-10"
            style={{ backgroundColor: "#652b82" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>
        <motion.button
          onClick={() => {
           handleLogout()
          }}
          className="fixed top-8 left-16 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <motion.button
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: `
      inset 10px 10px 18px rgba(0, 0, 0, 0.15),
      inset -10px -10px 18px rgba(255, 255, 255, 0)
    `,
              }}
              whileTap={{
                scale: 0.97,
                boxShadow: `
      inset 10px 10px 18px rgba(0, 0, 0, 0.15),
      inset -10px -10px 18px rgba(255, 255, 255, 0)
    `,
              }}
              type="button"
              onClick={() => handleLogout}
              style={{
                width: "40px",
                height: "40px",

                borderRadius: "8px",

                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `
        inset 6px 6px 12px rgba(0, 0, 0, 0.07),
        inset -6px -6px 12px rgba(255, 255, 255, 0.01)`,
              }}
            >
              <img src={homeIcon} style={{ width: "30px", height: "30px" }} />
            </motion.button>
          </div>
        </motion.button>
        <div className="flex">
          {/*النمر الموجود بالهيدر */}
          <motion.div
            className="tiger-join-success flex"
            style={{ justifyContent: "flex-end" ,width:"50%" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src={tiger}
              alt="نمر"
              className="w-64 md:w-96 lg:w-20 object-contain drop-shadow-2xl"
              // style={{ width: "65%" }}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
          {/* المحتوى الرئيسي */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-8">
            {/* البطاقة الرئيسية */}
            <motion.div
              className="rounded-3xl p-6 md:p-8 max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <>
                  {success ? (
                    <motion.div>
                      <SuccessJoin onLogout={logout} />
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex flex-col mb-6 gap-4">
                        <h1
                          style={{
                            fontFamily: "tajawal",
                            fontSize: "25px",
                            fontWeight: "700",
                            color: "#F4F4F4",
                          }}
                        >
                          إستعد لمغامرة تعليمية رائعة
                        </h1>
                        <label
                          className="block text-sm md:text-base text-start"
                          style={{
                            fontFamily: "tajawal",
                            fontSize: "18px",
                            fontWeight: "500",
                            color: "#F4F4F4",
                          }}
                        >
                          أدخل كود الصف الذي قدمه لك المعلم
                        </label>
                        <input
                          type="text"
                          value={classCode}
                          onChange={(e) =>
                            setClassCode(e.target.value.toUpperCase())
                          }
                          placeholder="مثال: ABC123"
                          className="w-full px-4 py-3 outline-none text-start text-xl md:text-2xl font-bold tracking-wider transition-all"
                          style={{
                            backgroundColor: "#FFFFFF6B",
                            color: "#ffffffff",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#652b82")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e5e7eb")
                          }
                          maxLength={6}
                        />
                      </div>

                      <button
                        onClick={handleJoin}
                        className="w-full text-white py-3 md:py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                        style={{
                          backgroundColor: "#FDC333",
                          color: "#652B82",
                          fontFamily: "poppins",
                          fontSize: "18px",
                          fontWeight: "700",
                        }}
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="text-base md:text-lg">تسجيل</span>
                      </button>
                      {error && (
                        <motion.div
                          className="rounded-2xl p-4"
                          initial={{ x: -10 }}
                          animate={{ x: 0 }}
                        >
                          <p
                            className="text-center"
                            style={{
                              color: "#FF0000",
                              fontFamily: "poppins",
                              fontSize: "18px",
                              fontWeight: "500",
                            }}
                          >
                            الكود الذي ادخلته غير صحيح
                          </p>
                        </motion.div>
                      )}

                      <div className="rounded-2xl p-4">
                        <p
                          className="text-xs text-center flex items-center justify-center gap-2"
                          style={{
                            color: "#FFFFFF",
                            fontFamily: "poppins",
                            fontSize: "15px",
                            fontWeight: "500",
                            display: "flex",
                          }}
                        >
                          <span
                            style={{
                              color: "#FFFFFF",
                              fontSize: "20px",
                              display: "flex",
                            }}
                          >
                            <img src={notification} height={20} width={20} />{" "}
                            ملاحظة:
                          </span>{" "}
                          اطلب من معلمك كود الصف للانضمام إلى صفه الدراسي
                        </p>
                      </div>

                      {/* قسم مساعدة للاختبار - يعرض الصفوف المتاحة */}
                      {/* {allClasses.length > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={handleToggleClasses}
                            className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center"
                          >
                            {showDebug ? "إخفاء" : "عرض"} الصفوف المتاحة
                            للاختبار
                          </button>
                          {showDebug && (
                            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs">
                              <p className="text-gray-600 mb-2">
                                الصفوف المتاحة:
                              </p>
                              <div className="space-y-1">
                                {allClasses.map((classroom) => (
                                  <div
                                    key={classroom.id}
                                    className="flex items-center justify-between bg-white px-2 py-1 rounded"
                                  >
                                    <span className="text-gray-700">
                                      {classroom.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setClassCode(classroom.code)
                                      }
                                      className="font-mono font-bold"
                                      style={{ color: "#652b82" }}
                                    >
                                      {classroom.code}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )} */}
                    </>
                  )}
                </>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
