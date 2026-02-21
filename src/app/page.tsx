"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  IoShieldCheckmark, 
  IoPlayCircle, 
  IoDesktop 
} from "react-icons/io5";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

function isGetDisplayMediaSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function"
  );
}

export default function HomePage() {
  const router = useRouter();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setSupported(isGetDisplayMediaSupported());
  }, []);

  function handleStartTest() {
    if (!supported) return;
    setNavigating(true);
    router.push("/screen-test");
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen flex flex-col">

      <NavBar
        title="Screen Share Test App"
        className="px-4 sm:px-6 md:px-20"
        right={
          <></>
        }
      />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="px-4 sm:px-6 py-14 sm:py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            {/* Pill badge */}
            <span className="badge">
              <IoShieldCheckmark className="text-[14px]" />
              Browser Pre-Flight Check
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              Screen Share Test App
            </h1>

            <p className="text-base sm:text-lg max-w-xl" style={{ color: "var(--text-muted)" }}>
              Verify your screen sharing capabilities and troubleshoot permissions before
              your next big meeting. No software to install.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
              <button
                className="btn-accent w-full sm:w-auto px-8 py-4 text-lg flex items-center justify-center gap-2"
                type="button"
                onClick={handleStartTest}
                disabled={!supported || navigating}
              >
                <IoPlayCircle />
                {navigating ? "Loading…" : "Start Screen Test"}
              </button>
            </div>

            {supported === false && (
              <Card 
              className="w-full max-w-xl p-4 text-left"
              style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" }}
              hover={false}
            >
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Browser unsupported</p>
                <p className="text-sm leading-relaxed">
                  Your browser does not support screen sharing via <span className="font-mono">navigator.mediaDevices.getDisplayMedia</span>.
                  Please use a recent desktop version of Chrome or Edge.
                </p>
              </Card>
            )}

          </div>
        </section>

       

        {/* ── How-to section ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            {/* Preview mock */}
            <div
              className="aspect-video rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
            >
              <div
                className="p-6 rounded-full"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
              >
                <IoDesktop className="text-5xl" style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                Test preview will appear here
              </p>
            </div>

            {/* Steps */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-8">How to test your setup</h2>
              <div className="flex flex-col gap-8">
                {[
                  { n: 1, title: "Initiate the Test", desc: "Click the 'Start Screen Test' button. Your browser will prompt for permission to access your screen." },
                  { n: 2, title: "Select Window or Screen", desc: "Choose between sharing your entire screen, a specific application window, or a single browser tab." },
                  { n: 3, title: "Verify Output & Metrics", desc: "Review the preview for clarity and check the connection stats for resolution and frame rate stability." },
                ].map((step) => (
                  <div key={step.n} className="flex gap-5 group">
                    <div
                      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                        transition: "transform 180ms ease",
                      }}
                    >
                      {step.n}
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-1">{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer/>
    </div>
  );
}
