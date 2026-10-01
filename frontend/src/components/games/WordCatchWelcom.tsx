/* ===================== Loading ===================== */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import background_catchWord from "../../assets/background_catchLoader 2.png";
import background_wordMatch from "../../assets/background_wordMatch.png";
import background_sorting from "../../assets/background_sorting.png";
import background_balloon from "../../assets/background_balloon.png";

export function GameLoadingScreen({ game_name }: any) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const backgrounds: any = {
    catchWord: background_catchWord,
    wordMatch: background_wordMatch,
    sorting: background_sorting,
    balloon: background_balloon,
  };

  const backgroundimg = backgrounds[game_name] || background_catchWord;

  return (
    <div
      className="h-screen w-full flex items-end justify-center pb-24 fixed inset-0"
      dir="rtl"
      style={{
        backgroundImage: `url("${backgroundimg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <p
        className="text-lg md:text-2xl"
        style={{
          color: "#374151",
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        جاري تحميل اللعبة{dots}
      </p>

      {/* شريط التحميل — مثبت دايماً بأسفل الشاشة، بدون ما يأثر على مكان النص */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "260px",
          maxWidth: "70vw",
          height: "10px",
          borderRadius: "999px",
          backgroundColor: "rgba(255,255,255,0.65)",
          overflow: "hidden",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.15)",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "100%", "0%"] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}