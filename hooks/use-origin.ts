import { useEffect, useState } from "react";

export const UseOrigin = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // This will the current window URL & if window not undefined and There is url then return that url
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  if (!mounted) {
    return "";
  }

  return origin;
};
