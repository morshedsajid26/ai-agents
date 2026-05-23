import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const isAuthPage = [
      "/login",
      "/register",
      "/forgot-password",
      "/verify-otp",
      "/reset-password"
    ].includes(pathname);

    if (!token) {
      if (!isAuthPage) {
        router.push("/login");
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    } else {
      if (isAuthPage) {
        router.push("/");
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }
  }, [pathname, router]);

  return authorized;
}
