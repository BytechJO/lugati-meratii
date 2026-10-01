import React from "react";
import { motion } from "motion/react";
import vectorEnd from "../../assets/vector_end.svg";
import badegEnd from "../../assets/badeg_end.svg";
import restart from "../../assets/Repeat.svg";

interface FinishModalProps {
  /** عنوان المودال (مثلاً: ممتاز! / انتهت اللعبه) */
  title?: string;
  /** النقاط (رقم أو نص مثل "60 - 4") */
  score: number | string;
  /** عدد الأخطاء (اختياري، إذا ما انبعت ما بيظهر السطر) */
  mistakes?: number | string;

  /** الزر الأساسي (البنفسجي) */
  primaryLabel: string;
  onPrimary: () => void;
  /** إظهار أيقونة الإعادة على الزر الأساسي */
  primaryShowRestartIcon?: boolean;

  /** الزر الثانوي (الأصفر) - اختياري */
  secondaryLabel?: string;
  onSecondary?: () => void;

  /** إغلاق عند الضغط على الخلفية (اختياري) */
  onClose?: () => void;
}

const TEXT_DARK = "#28345F";

const lineStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: TEXT_DARK,
  fontFamily: "tajawal",
  fontSize: 20,
  fontWeight: 500,
};

const pillBase: React.CSSProperties = {
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

export function FinishModal({
  title = "ممتاز!",
  score,
  mistakes,
  primaryLabel,
  onPrimary,
  primaryShowRestartIcon = false,
  secondaryLabel,
  onSecondary,
  onClose,
}: FinishModalProps) {
  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        dir="rtl"
        style={{
          position: "relative",
          overflow: "hidden",
          width: "min(420px, calc(100% - 32px))",
          boxSizing: "border-box",
          padding: "24px 32px 36px",
          borderRadius: 20,
          backgroundColor: "#ffffff",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        initial={{ scale: 0.7, y: 80 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 80 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* الزخرفة الصفراء (أعلى اليسار) */}
        <img
          src={vectorEnd}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        />

        {/* الوسام */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <img
            src={badegEnd}
            alt=""
            style={{ width: 105, height: "auto", display: "block" }}
          />
        </div>

        {/* العنوان */}
        <h2
          style={{
            position: "relative",
            zIndex: 1,
            margin: "0 0 14px",
            color: TEXT_DARK,
            fontFamily: "tajawal",
            fontSize: 30,
            fontWeight: 500,
          }}
        >
          {title}
        </h2>

        {/* التفاصيل */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={lineStyle}>نقاطك: {score}</p>
          {mistakes !== undefined && (
            <p style={lineStyle}>عدد الأخطاء: {mistakes}</p>
          )}
        </div>

        {/* الأزرار */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 24,
          }}
        >
          <button
            onClick={onPrimary}
            style={{
              ...pillBase,
              color: "#ffffff",
              background: "linear-gradient(90deg, #D08FF7 0%, #652B82 100%)",
            }}
          >
            {primaryShowRestartIcon && (
              <img src={restart} alt="" style={{ width: 22, height: 22 }} />
            )}
            <span>{primaryLabel}</span>
          </button>

          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              style={{
                ...pillBase,
                color: TEXT_DARK,
                background: "linear-gradient(90deg, #FFD93D 0%, #FDB913 100%)",
              }}
            >
              <span>{secondaryLabel}</span>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}