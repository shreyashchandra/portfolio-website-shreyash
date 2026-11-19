"use client";

import { useEffect, useState } from "react";

function format(unixSeconds: number) {
  const s = Date.now() / 1000 - unixSeconds;
  if (s < 60) return "just now";
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}

/** Relative time computed in the browser, so cached server HTML never shows a stale "2h ago". */
export default function TimeAgo({ ts }: { ts: number }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setText(format(ts));
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [ts]);
  return <time dateTime={new Date(ts * 1000).toISOString()}>{text ?? "recently"}</time>;
}
