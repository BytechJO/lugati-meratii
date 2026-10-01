import { motion } from "motion/react";

import { useAppSelector } from "../redux/hooks";
import homeIcon from "../assets/home_02.svg";
import logOut from "../assets/Log out.svg";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/reducers/auth";
import { clearMyClass } from "../redux/reducers/classSlice";
import userIcon from "../assets/userIcon.svg";
import back_icon from "../assets/back_icon.svg";
interface AppHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  showUserInfo?: boolean;
  showHome?: boolean;
  // user?: UserType;
  onLogout?: () => void;
  currentLetter?: string;
  showLetter?: boolean;
  title: string;
  showLogout: boolean;
  fontTtile: Number;
}

export function AppHeader({
  showBackButton,
  onBack,
  showUserInfo = true,
  showHome = true,
  // user,
  onLogout,
  showLogout,
  title,
  fontTtile = 45,
}: AppHeaderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const userType = user?.type || "student";
  const userName = user?.username || "المستخدم";
  // console.log(userName);
  const navigate = useNavigate();
  if (!user && showUserInfo) {
    return null;
  }
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearMyClass());
    navigate("/");
  };
  return (
    <header className="sticky top-0 w-full">
      <div className="px-4 md:px-6 py-2 md:py-2.5" style={{ marginTop: "5px" }}>
        {/* ✅ 3 أعمدة: [بداية 1fr] [العنوان auto] [نهاية 1fr]
            العمودين الجانبيين دايماً موجودين (حتى لو فاضيين)
            فبيضل العنوان بالنص بغض النظر عن الكبسات */}
        <div
          className="grid items-center"
          dir="rtl"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* ===== العمود الأول (اليمين بـ RTL): معلومات المستخدم وتسجيل الخروج ===== */}
          <div className="flex items-center justify-start gap-2">
            {showUserInfo && user && (
              <motion.div
                className="flex items-center gap-3 md:gap-4"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* معلومات الحساب */}
                <div className="flex items-center gap-2">
                  {/* اسم الحساب ونوعه */}
                  <div className="text-right flex justify-center items-center">
                    {onLogout && (
                      <motion.button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-white px-3 md:px-4 py-2 rounded-xl transition-all"
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
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            type="button"
                            onClick={() => handleLogout}
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "8px",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            {" "}
                            <img
                              src={logOut}
                              // style={{ width: "30px", height: "30px" }}
                            />
                          </motion.button>
                        </div>
                      </motion.button>
                    )}
                    <p
                      className="text-base md:text-lg lg:text-3xl"
                      style={{
                        color: "#652b82",
                        fontFamily: "poppins",
                        fontWeight: "400",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {userName}
                      <img
                        src={userIcon}
                        style={{ width: "45px", height: "45px" }}
                      />{" "}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {showLogout && onLogout && (
              <motion.button
                onClick={onLogout}
                className="flex items-center gap-2 text-white px-3 md:px-4 py-2 rounded-xl transition-all"
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
                      width: "35px",
                      height: "35px",
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
                    {" "}
                    <img
                      src={logOut}
                      style={{ width: "30px", height: "30px" }}
                    />
                  </motion.button>
                </div>
              </motion.button>
            )}
          </div>

          {/* ===== العمود الأوسط: العنوان (دايماً بالنص) ===== */}
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {title && (
              <div
                className="text-center flex justify-center items-center gap-2"
                style={{ color: "#652b82" }}
              >
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                />
                <span
                  className="text-base md:text-2xl lg:text-3xl text-center"
                  style={{
                    fontFamily: "tajawal",
                    fontWeight: "700",
                    textAlign: "center",
                    fontSize: `${fontTtile}px`,
                  }}
                >
                  {title}
                </span>
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                />
              </div>
            )}{" "}
          </motion.div>
          {/* ===== العمود الأخير (الشمال بـ RTL): زر الرجوع + زر الهوم ===== */}
          <div
            className="flex items-center justify-end gap-2"
            style={{ justifyContent: "flex-end" }}
          >
            {showBackButton && onBack && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <img src={back_icon} style={{ height: "60px" }} />
                </motion.button>
              </motion.div>
            )}
            {showHome && (
              <motion.button
                onClick={() => {
                  navigate("/");
                }}
                className="flex items-center gap-2 text-white px-3 md:px-4 py-2 rounded-xl transition-all"
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
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="button"
                    onClick={() => handleLogout}
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius: "8px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={homeIcon}
                      // style={{ width: "30px", height: "30px" }}
                    />
                  </motion.button>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
