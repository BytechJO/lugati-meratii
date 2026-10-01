import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getMyClassApi } from "../API/classes";
import { SplashScreen } from "./SplashScreen";

export function HomePage({ user }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const checkClass = async () => {
      if (user?.type !== "student") return;

      try {
        const myClass = await getMyClassApi(user.token);

        if (myClass) {
          navigate(`/my-classroom/${myClass.code}`, { replace: true });
        } else {
          navigate("/my-classroom", { replace: true });
        }
      } catch (error) {
        console.error(error);
        navigate("/my-classroom", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkClass();
  }, [user]);

  if (!user) return <Navigate to="/" />;

  if (loading) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  return null;
}
