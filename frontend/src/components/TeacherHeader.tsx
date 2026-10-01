import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import { AppDispatch } from "../redux/store";
import { logout } from "../redux/reducers/auth";
import { clearMyClass } from "../redux/reducers/classSlice";

import homeIcon from "../assets/home_02.svg";
import logOutIcon from "../assets/Log out.svg";
import userIcon from "../assets/userIcon.svg";
import backIcon from "../assets/back_icon.svg";

interface TeacherHeaderProps {
  title?: string;
  fontSize?: number;
  showBackButton?: boolean;
  onBack?: () => void;
  showHome?: boolean;
  showUserInfo?: boolean;
  showLogout?: boolean;
  /** لون النص (اسم المستخدم والعنوان) */
  color?: string;
  /** لو true بيصير الهيدر فوق صورة الخلفية بدون خلفية خاصة فيه */
  transparent?: boolean;
  /** مكان لإضافة عناصر جديدة خاصة بالمعلم (بتظهر بجانب زر الهوم) */
  extraActions?: React.ReactNode;
}

export function TeacherHeader({
  title,
  fontSize = 45,
  showBackButton = false,
  onBack,
  showHome = true,
  showUserInfo = true,
  showLogout = true,
  color = "#652b82",
  transparent = true,
  extraActions,
}: TeacherHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.username || "المستخدم";

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearMyClass());
    navigate("/");
  };

  if (!user && showUserInfo) return null;

  return (
    <header
      className="sticky top-0 w-full z-50"
      style={{ backgroundColor: transparent ? "transparent" : "white" }}
    >
      <div className="px-4 md:px-6 py-2 md:py-2.5" style={{ marginTop: 5 }}>
        {/* 3 أعمدة: [1fr] [العنوان auto] [1fr] ← العنوان دايماً بالنص */}
        <div
          className="grid items-center"
          dir="rtl"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* ===== اليمين (RTL): معلومات المستخدم + تسجيل الخروج ===== */}
          <div className="flex items-center justify-start gap-2">
            {showUserInfo && user && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {showLogout && (
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    aria-label="تسجيل الخروج"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <img src={logOutIcon} alt="" />
                  </motion.button>
                )}

                <p
                  className="flex items-center gap-2.5"
                  style={{
                
                    fontFamily: "poppins",
                    fontWeight: 400,
                    color: "#652B82",
                    fontSize: 20,
                    gap: 5,
                  }}
                >
                  {userName}
                  <img
                    src={userIcon}
                    alt=""
                    style={{ width: 45, height: 45 }}
                  />
                </p>
              </motion.div>
            )}
          </div>

          {/* ===== الوسط: العنوان ===== */}
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {title && (
              <div
                className="text-center flex justify-center items-center gap-2"
                style={{ color }}
              >
                <div
                  style={{
                    height: 20,
                    width: 20,
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                />
                <span
                  className="text-center"
                  style={{
                    fontFamily: "tajawal",
                    fontWeight: 700,
                    fontSize: `${fontSize}px`,
                  }}
                >
                  {title}
                </span>
                <div
                  style={{
                    height: 20,
                    width: 20,
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                />
              </div>
            )}
          </motion.div>

          {/* ===== اليسار (RTL): رجوع + هوم + أي إضافات للمعلم ===== */}
          {/* direction: ltr عشان زر الرجوع يبقى دايماً بأقصى الشمال */}
          <div
            className="flex items-center justify-start gap-2"
            style={{ direction: "ltr" }}
          >
            {showBackButton && onBack && (
              <motion.button
                type="button"
                onClick={onBack}
                aria-label="رجوع"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 rounded-xl"
              >
                <img src={backIcon} alt="" style={{ height: 62 }} />
              </motion.button>
            )}

            {showHome && (
              <motion.button
                type="button"
                onClick={() => navigate("/teacher/home")}
                aria-label="الرئيسية"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center"
                style={{ width: 55, height: 55 }}
              >
                <img src={homeIcon} alt="" />
              </motion.button>
            )}

            {extraActions}
          </div>
        </div>
      </div>
    </header>
  );
}
