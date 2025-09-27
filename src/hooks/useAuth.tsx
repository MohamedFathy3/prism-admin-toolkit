// src/hooks/useAuth.tsx
import { useEffect, useState } from "react";
import { checkAuth } from "@/api/api";
import { User } from "@/type/type";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await checkAuth();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAuth();
  }, []);

  return { user, loading };
}
