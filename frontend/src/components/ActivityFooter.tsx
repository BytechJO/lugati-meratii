import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setMenuOpen(false); }, [routerLocation.pathname]);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 1200px)");
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const buttons = drawerRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [menuOpen]);

  const selectActivity = (id: string) => {
    setMenuOpen(false);
    navigate(`/letter/${currentLetter}/${id}`);
  };

  return (
    <>
    <button
      ref={triggerRef}
      type="button"
      dir="rtl"
      className="activity-menu-trigger"
      aria-label="فتح قائمة الأنشطة"
      aria-expanded={menuOpen}
      aria-controls={menuOpen ? menuId : undefined}
      aria-haspopup="dialog"
      onClick={() => setMenuOpen(true)}
    >
      <Menu size={23} aria-hidden="true" />
      <span>الأنشطة</span>
    </button>
    {menuOpen && createPortal(
      <div className="activity-drawer-overlay" onClick={() => setMenuOpen(false)}>
        <div
          id={menuId}
          ref={drawerRef}
          className="activity-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={`أنشطة حرف ${letterName ?? currentLetter ?? ""}`}
          dir="rtl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="activity-drawer-heading">
            <h2>أنشطة حرف {letterName ?? currentLetter}</h2>
            <button type="button" aria-label="إغلاق قائمة الأنشطة" onClick={() => setMenuOpen(false)}>
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="أنشطة الحرف" className="activity-drawer-links">
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                aria-current={currentActivity === activity.id ? "page" : undefined}
                onClick={() => selectActivity(activity.id)}
              >
                <img src={activity.icon} alt="" />
                <span>{activity.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>, document.body,
    )}
    <footer
      dir="rtl"
      className="activity-desktop-footer fixed left-0 right-0 bottom-0 z-50"
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
                    zIndex: -9,
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
    </>
  );
}
