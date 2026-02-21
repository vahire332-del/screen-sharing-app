"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ScreenResultPage() {
  const router = useRouter();
  const [duration, setDuration] = useState<string>("00:00:00");
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [resolution, setResolution] = useState<string>("Unknown");

  useEffect(() => {
    const syncFromStorage = () => {
      const storedDuration = localStorage.getItem("screenSessionDuration");
      const storedFrame = localStorage.getItem("screenCapturedFrame");
      const storedResolution = localStorage.getItem("screenSessionResolution");
      const storedStartTime = localStorage.getItem("screenSessionStartTime");

      if (storedResolution) setResolution(storedResolution);

      if (storedFrame) setCapturedFrame(storedFrame);

      if (storedDuration) {
        const ms = Number(storedDuration);
        if (!Number.isNaN(ms)) setDuration(formatDuration(ms));
      } else if (storedStartTime) {
        const startedAt = Number(storedStartTime);
        if (!Number.isNaN(startedAt)) setDuration(formatDuration(Date.now() - startedAt));
      }
    };

    syncFromStorage();
    const interval = window.setInterval(syncFromStorage, 500);

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (
        e.key === "screenSessionDuration" ||
        e.key === "screenCapturedFrame" ||
        e.key === "screenSessionResolution" ||
        e.key === "screenSessionStartTime"
      ) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function handleRetry() { router.push("/screen-test"); }
  function handleHome()  { router.push("/"); }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen flex flex-col">

      <NavBar
        title="Screen Share Test App"
        sticky={false}
        style={{ background: "var(--bg)" }}
        right={
          <>
          </>
        }
      />

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8" style={{ background: "var(--bg-subtle)" }}>
        <Card 
          className="w-full max-w-140 overflow-hidden"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
          hover={false}
        >
          {/* Status */}
          <div className="p-6 md:p-8 text-center flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2">Screen shared successfully</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Your screen sharing session completed without issues.
            </p>
          </div>

          {/* Session summary */}
          <div className="px-4 md:px-8 pb-6 md:pb-8">
            <Card className="overflow-hidden" inner>
              <div className="px-6 py-4" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <h3 className="font-bold text-sm">Session Summary</h3>
              </div>
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats */}
                <div className="flex flex-col gap-5">
                  {[
                    { label: "Duration",         value: duration },
                    { label: "Final Resolution", value: resolution },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-faint)" }}>
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-faint)" }}>
                      Connection
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">Stable</p>
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="relative group">
                  <div className="w-full min-h-35 rounded-lg overflow-hidden relative" style={{ border: "1px solid var(--border)" }}>
                    {capturedFrame ? (
                      <img
                        src={capturedFrame}
                        alt="Last captured frame"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-center bg-cover"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPsWmuPycWKZOi1lyH4xvQBAyx_icZneHBGmdMleg91GiDZnbUTlDqbgaAlDaROrfURhp1xmqr-Np_0z528NkAWYDzfBG4ufK5TjFYW7yvodLip5OmdpgpkxMNKUd_5G6YEy6QjTlaRsT5jcPLrx0UOO_0_nabdZ6nyppM9qpvXvth4duoODa80CuswEm2YkFMwSvqlwkSRP2GiVzFoa0AzBrDJqxSX7TGErYJX7GTDm5wODiBgzGkdIowjlQyEin-y9Y-A26WUHE')" }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "rgba(0,0,0,.45)" }}>
                      <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-center mt-2 italic" style={{ color: "var(--text-faint)" }}>
                    Last captured frame
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="px-4 md:px-8 pb-6 md:pb-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="btn-accent w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              <span className="material-symbols-outlined">refresh</span>
              Retry Screen Test
            </button>
            <button
              type="button"
              onClick={handleHome}
              className="btn-outline w-full py-3 text-base"
            >
              Back to Home
            </button>
          </div>
        </Card>
      </main>

      <Footer>
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          © 2024 Screen Share Test App. All technical reports are stored for 24 hours.
        </p>
      </Footer>
    </div>
  );
}