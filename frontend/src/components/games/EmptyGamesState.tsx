import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../AppHeader";
import { ActivityFooter } from "../ActivityFooter";
import background from "../../assets/background-learnLetter.svg";
import emptyTigerImg from "../../assets/tiger_dashborad.svg";

interface EmptyGamesStateProps {
  letter?: string;
  letterName?: string;
  isTeacher: boolean;
  onLogout: () => void;
}

const pillBase: CSSProperties = {
  height: 58,
  padding: "0 28px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontFamily: "tajawal",
  fontWeight: 700,
  fontSize: 18,
  whiteSpace: "nowrap",
  boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
};


export function EmptyGamesState({ letter, letterName, isTeacher, onLogout }: EmptyGamesStateProps) {
  const navigate = useNavigate();
  return (
    <div data-page="empty-games-state" className="h-screen relative pb-24 overflow-hidden" dir="rtl">
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `url("${background}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="relative top-0 w-full">
        <AppHeader
          showUserInfo={false}
          onLogout={onLogout}
          onBack={() => navigate(`/letter/${letter}`)}
          title={`  ألعاب حرف ال${letterName ?? ""}`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={30}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center px-6 h-[60%]">
        <motion.div
          className="bg-white text-center w-full flex flex-col items-center"
          style={{
            maxWidth: 480,
            borderRadius: 24,
            padding: "32px 24px",
            gap: 12,
            boxShadow: "0 16px 32px rgba(40, 52, 95, 0.1)",
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <img
            src={emptyTigerImg}
            alt=""
            style={{ height: 120, width: "auto", objectFit: "contain" }}
          />

          <h2
            style={{
              margin: 0,
              color: "#28345F",
              fontFamily: "tajawal",
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            لا توجد ألعاب لهذا الحرف حالياً
          </h2>

          <p
            style={{
              margin: 0,
              color: "#7B7B7B",
              fontFamily: "tajawal",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            {isTeacher
              ? "لم يتم إضافة ألعاب لهذا الحرف بعد."
              : "ما في ألعاب لهاد الحرف حالياً، فيك ترجع لصفحة الحرف."}
          </p>

          <div
            className="flex gap-3 justify-center flex-wrap"
            style={{ marginTop: 12 }}
          >
            <button
              onClick={() => navigate(`/letter/${letter}`)}
              style={{
                ...pillBase,
                color: "#652B82",
                background: "#F3EEFA",
                boxShadow: "none",
              }}
            >
              رجوع
            </button>

            {/* الطالب بس: ما بيضل عالق، الألعاب آخر نشاط فبيكمل لصفحة الحروف */}
            {!isTeacher && (
              <button
                onClick={() => navigate("/letters")}
                style={{
                  ...pillBase,
                  color: "#ffffff",
                  background:
                    "linear-gradient(90deg, #D08FF7 0%, #652B82 100%)",
                }}
              >
                التالي
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <ActivityFooter currentLetter={letter} letterName={letterName} />
    </div>
  );
}
