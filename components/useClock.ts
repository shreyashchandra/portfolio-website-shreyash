"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/site";

/** Local time in the profile's time zone. Renders "--:--" on the server to avoid hydration mismatch. */
export function useClock(withSeconds = false) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: withSeconds ? "2-digit" : undefined,
      hour12: false,
      timeZone: profile.timeZone,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [withSeconds]);

  return time;
}
