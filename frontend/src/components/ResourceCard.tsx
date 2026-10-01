import { Download } from "lucide-react";
import { motion } from "motion/react";

import pdfBadge from "../assets/girl-2.svg";

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  pages: string;
  size: string;
  icon: string;
  url?: string;
}

interface ResourceCardProps {
  resource: Resource;
  index?: number;
  onDownload?: (resource: Resource) => void;
}

export function ResourceCard({
  resource,
  index = 0,
  onDownload,
}: ResourceCardProps) {
  return (
    <motion.div
      className="relative flex flex-col overflow-hidden"
      dir="rtl"
      style={{
        backgroundColor: "#FAFAFA",
        borderRadius: 20,
        boxShadow: "0 6px 18px rgba(40, 52, 95, 0.08)",
      }}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {/* ===== الشريط الأصفر + PDF ===== */}
      <div className="relative w-full">
        <img src={pdfBadge} alt="" className="block w-full" />
        <span
          className="absolute"
          style={{
            top: "50%",
            left: 24,
            transform: "translateY(-55%)",
            fontFamily: "tajawal",
            fontWeight: 800,
            fontSize: 26,
            color: "#4E4E4E",
            letterSpacing: 1,
          }}
        >
          {resource.type}
        </span>
        <span
          className="absolute"
          style={{
            top: "68%",
            right: 7,
            transform: "translateY(-55%)",
            fontFamily: "tajawal",
            fontWeight: 500,
            fontSize: 18,
            color: "#4E4E4E",
            letterSpacing: 1,
          }}
        >
          {resource.title}
        </span>
      </div>

      {/* ===== العنوان (على اليمين) ===== */}
      {/* <h3
        className="px-5 mt-1 text-start"
        style={{
          fontFamily: "tajawal",
          fontWeight: 500,
          fontSize: 18,
          color: "#4E4E4E",
        }}
      >
        {resource.title}
      </h3> */}

      {/* ===== الصورة ===== */}
      <img
        src={resource.icon}
        alt={resource.title}
        className="mx-auto object-contain"
        style={{ height: 170, marginTop: 14, marginBottom: 14 }}
      />

      {/* ===== الوصف ===== */}
      <p
        className="text-center px-4"
        style={{
          fontFamily: "tajawal",
          fontWeight: 500,
          fontSize: 18,
          color: "#4E4E4E",
        }}
      >
        {resource.description}
      </p>

      {/* ===== الفوتر: عدد الصفحات يمين | الحجم + زر التحميل يسار ===== */}
      <div
        className="flex items-center justify-between mt-3"
        style={{ height: 42 }}
      >
        <span
          className="pr-5"
          style={{ fontFamily: "tajawal", fontSize: 13, color: "#8A8A8A" }}
        >
          {resource.pages}
        </span>

        {/* بـ RTL: الحجم أول (يمين) وبعده الزر (أقصى الشمال) */}
        <div className="flex items-center h-full gap-3">
          <span
            dir="ltr"
            style={{ fontFamily: "tajawal", fontSize: 13, color: "#8A8A8A" }}
          >
            {resource.size}
          </span>
          <motion.button
            type="button"
            aria-label="تحميل المورد"
            onClick={() => onDownload?.(resource)}
            className="h-full flex items-center justify-center"
            style={{
              width: 52,
              backgroundColor: "#652B82",
              borderTopRightRadius: 14,
            }}
            whileHover={{ backgroundColor: "#7A3A9A" }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
