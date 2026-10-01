import { motion } from "motion/react";

import tigerImg from "../assets/tiger.svg";
import { useNavigate } from "react-router-dom";
import teacher from "../assets/teacher ChooseAccountType.png";
import student from "../assets/student ChooseAccountType.png";
import pageBackground from "../assets/choose_account_type.svg";
import "./ChooseAccountType.css";
import ArrowRight from "../assets/ArrowRight.svg"
import ArrowLeft from "../assets/ArrowLeft.svg"

interface ChooseAccountTypeProps {
  onChoose: (type: "teacher" | "student") => void;
}

/* ===================== زر الاختيار (نفس ستايل زر "إنضم إلى الصف") ===================== */

interface AccountButtonProps {
  title: string;
  subtitle: string;
  // الطالب: الدائرة أول عنصر (يمين) + سهم يمين | المعلم: النص أول عنصر + سهم شمال
  arrowFirst: boolean;
  arrowDirection: "right" | "left";
  onClick: () => void;
}

function AccountButton({
  title,
  subtitle,
  arrowFirst,
  arrowDirection,
  onClick,
}: AccountButtonProps) {
  const Arrow = arrowDirection === "right" ? ArrowLeft : ArrowRight;

  const arrowCircle = (
    <span
      className="flex items-center justify-center shrink-0"
      style={{
        width: "66px",
        height: "55px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.45)",
      }}
    >
      <motion.span
        className="flex items-center justify-center"
        animate={{ x: arrowDirection === "left" ? [-3, 3, -3] : [3, -3, 3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <img src={Arrow} color="#4B1A7A" />
      </motion.span>
    </span>
  );

  const texts = (
    <div className="title-text-choose-page text-center">
      <h2
        style={{
          color: "#4B1A7A",
          fontFamily: "tajawal",
          fontWeight: 800,
          fontSize: "24px",
        }}
      >
       إنضم إلى الصف
      </h2>
   
    </div>
  );

  return (
    <div
      onClick={onClick}
      className="z-10 w-full flex items-center justify-between gap-4 px-6 py-4"
      style={{
        background: "linear-gradient(180deg, #FFD84F 0%, #FFC72C 100%)",
        borderRadius: "40px",
        boxShadow: "0 12px 28px rgba(140, 100, 210, 0.28)",
        position: "absolute",
        top: "-50px",
        height:"90px",
        cursor: "pointer",
        flexDirection:"row-reverse"
      }}
    >
      {arrowFirst ? (
        <>
          {arrowCircle}
          {texts}
        </>
      ) : (
        <>
          {texts}
          {arrowCircle}
        </>
      )}
    </div>
  );
}

/* ===================== الصفحة ===================== */

export function ChooseAccountType({ onChoose }: ChooseAccountTypeProps) {
  const navigate = useNavigate();
  const handleChoose = (type: "student" | "teacher") => {
    onChoose(type);
    navigate(`/login/${type}`);
  };
  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* خلفية الصفحة كصورة */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `url("${pageBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        {/* الشعار والعنوان */}
        <motion.div
          className="text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div className="flex items-center">
            <div
              style={{
                height: "25px",
                width: "25px",
                backgroundColor: "#FDC333",
                borderRadius: "50%",
              }}
            ></div>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl mb-3"
              style={{
                color: "#4A1B73",
                fontFamily: "tajawal",
                fontWeight: "700",
                fontSize: "50px",
              }}
            >
              مرآتي لغتي
            </h1>{" "}
            <div
              style={{
                height: "25px",
                width: "25px",
                backgroundColor: "#FDC333",
                borderRadius: "50%",
              }}
            ></div>
          </div>
          <p
            className="text-sm md:text-base text-gray-600"
            style={{
              color: "#9F72E1",
              fontFamily: "tajawal",
              fontWeight: "500",
              fontSize: "30px",
            }}
          >
            رحلة تعلم اللغة العربية تبدأ هنا!
          </p>
        </motion.div>

        {/* بطاقات اختيار نوع المستخدم */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl w-full">
          {/* بطاقة المعلم */}
          <motion.div
            className="relative"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          >
            <div style={{ height: "88%" ,
       
        }}>
              <img
                src={teacher}
                alt="معلم"
                className="w-full h-full object-contain z-10 scale-110 group-hover:scale-115 transition-transform duration-300"
              />
            </div>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.0, duration: 0.6, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative bottom-10 w-full max-w-[300px] aspect-[3/4] flex flex-col justify-end group cursor-pointer"
            >
              <AccountButton
                title="معلم"
                subtitle="ساعد طلابك على التعلم"
                arrowFirst={false}
                arrowDirection="left"
                onClick={() => handleChoose("teacher")}
              />
            </motion.div>
          </motion.div>

          {/* بطاقة الطالب */}
          <motion.div
            className="relative"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          >
            <div style={{ height: "88%" }}>
              <img
                src={student}
                alt="طالب"
                className="w-full h-full object-contain z-10 scale-110 group-hover:scale-115 transition-transform duration-300"
              />
            </div>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.0, duration: 0.6, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative bottom-10 w-full max-w-[300px] aspect-[3/4] flex flex-col justify-end group cursor-pointer"
            >
              <AccountButton
                title="طالب"
                subtitle="إبدأ رحلة التعلم الممتعة"
                arrowFirst={true}
                arrowDirection="right"
                onClick={() => handleChoose("student")}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* صورة النمر */}
      <motion.div
        className="tiger-choose-page absolute z-20"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1, rotate: "5deg" }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.5,
        }}
        style={{ top: "48%", left: "3%" }}
      >
        <img src={tigerImg} height={250} width={250} />
      </motion.div>
    </div>
  );
}