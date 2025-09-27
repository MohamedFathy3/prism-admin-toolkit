// src/components/TokenCheck.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const TokenCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token"); // قراءة التوكن من الكوكيز
    if (!token) {
      navigate("/login", { replace: true }); // لو مفيش توكن → تحويل للـ login
    }
  }, [navigate]);

  return null; // مفيش حاجة تتعرض، بس بيعمل redirect لو مش موجود
};
  