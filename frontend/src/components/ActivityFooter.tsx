import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import * as React from "react";

import learn from "../assets/learn_alphabet.svg";
import write from "../assets/write_alphabet.svg";
import tashkeel from "../assets/tashkeel_alphabet (2).svg";
import location from "../assets/location_alphabet.svg";
import videos from "../assets/videos_alphabet.svg";
import games from "../assets/games_alphabet.svg";

interface ActivityFooterProps {
  currentLetter?: string;
  letterName?: string;
}

const activities = [
  { id: "learn", label: "تعلم الحروف", icon: learn },
  { id: "write", label: "اكتب الحروف", icon: write },
  { id: "position", label: "مكان الحروف", icon: location },
  { id: "tashkeel", label: "تشكيل الحروف", icon: tashkeel },
  { id: "videos", label: "فيديوهات", icon: videos },
  { id: "games", label: "العاب", icon: games },
];

const CARD_SIZE = 130;

export function ActivityFooter({
  currentLetter,
  letterName,
}: ActivityFooterProps) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const currentActivity = routerLocation.pathname.split("/").pop();

  return (
    <footer
      dir="rtl"
      className="fixed left-0 right-0 bottom-0 z-50"
      style={{ padding: "10px 12px 18px" }}
    >
      <nav
        className="flex items-start justify-center overflow-x-auto"
        style={{ padding: "4px" }}
      >
        {activities.map((activity, index) => {
          const isActive = currentActivity === activity.id;

          return (
            <React.Fragment key={activity.id}>
              <div
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: `${CARD_SIZE + 8}px` }}
              >
                <motion.button
                  onClick={() =>
                    navigate(`/letter/${currentLetter}/${activity.id}`)
                  }
                  aria-label={activity.label}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    position: "relative",
                    width: `${CARD_SIZE}px`,
                    height: `${CARD_SIZE}px`,
                    borderRadius: "27px",
                    overflow: "hidden",
                    cursor: "pointer",
                       boxShadow: isActive ?"0 12px 12px rgba(0, 0, 0, 0.25)":""
             
                  }}
                >
              
               
                    <img
                      src={activity.icon}
                      alt=""
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
           
                </motion.button>

              </div>

              {/* الرابط بين كل كرت والتاني */}
              {index < activities.length - 1 && (
                <div
                  aria-hidden
                  className="flex-shrink-0"
                  style={{
                    width: "45px",
                    height: `${CARD_SIZE}px`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: `${CARD_SIZE * 0.46}px`,
                      right: 0,
                      left: 0,
                      borderTop: "2px dashed #070602",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: `${CARD_SIZE * 0.46}px`,
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#FDC333",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </footer>
  );
}