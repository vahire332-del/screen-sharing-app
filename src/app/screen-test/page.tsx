"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  IoArrowBack, 
  IoInformationCircle, 
  IoWarning, 
  IoCheckmark, 
  IoDesktop, 
  IoSync,
  IoStopCircle,
  IoChevronForward,
  IoExpand,
  IoContract,
  IoSettings,
  IoVolumeHigh,
  IoCameraOutline,
  IoRecordingOutline,
  IoResize,
  IoShareSocial,
  IoAnalytics,
  IoTrendingUp,
  IoDesktopOutline,
  IoSpeedometer,
  IoGlobe,
  IoCloudUpload,
  IoWifi,
  IoOpenOutline,
  IoDownload,
  IoWifiOutline
} from "react-icons/io5";
import { useScreenShare, ScreenShareStatus } from "@/hooks/useScreenShare";
import Button from "@/components/Button";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

/* ─── Loader Component ───────────────────────────────────────────────────── */
function NetworkLoader({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-2xl">
        <div className="relative">
          <IoSync className="h-12 w-12 animate-spin text-blue-500" />
          <div className="absolute -bottom-1 -right-1">
            <IoWifiOutline className="h-6 w-6 text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Slow Internet Detected</p>
          <p className="text-sm text-gray-600 mt-1">Optimizing stream quality...</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Quality Calculation ─────────────────────────────────────────────────── */
function calculateQuality(metadata: ReturnType<typeof useScreenShare>["metadata"]) {
  if (!metadata || !metadata.width || !metadata.height) {
    return { label: "Unknown", level: "Auto" };
  }

  const pixels = metadata.width * metadata.height;
  const frameRate = metadata.frameRate || 30;

  // Quality tiers based on resolution and frame rate
  if (pixels >= 3840 * 2160 && frameRate >= 30) {
    return { label: "4K Ultra HD", level: "Ultra" };
  } else if (pixels >= 2560 * 1440 && frameRate >= 30) {
    return { label: "2K QHD", level: "High" };
  } else if (pixels >= 1920 * 1080 && frameRate >= 25) {
    return { label: "1080p Full HD", level: "High" };
  } else if (pixels >= 1280 * 720 && frameRate >= 25) {
    return { label: "720p HD", level: "Medium" };
  } else if (pixels >= 854 * 480) {
    return { label: "480p SD", level: "Medium" };
  } else {
    return { label: "360p SD", level: "Low" };
  }
}

/* ─── ActiveDashboard ────────────────────────────────────────────────────── */
function ActiveDashboard({
  stream,
  metadata,
  onStop,
}: {
  stream: MediaStream;
  metadata: ReturnType<typeof useScreenShare>["metadata"];
  onStop: () => void;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const quality = calculateQuality(metadata);
  const [internetQuality, setInternetQuality] = useState({
    level: 'Perfect Signal',
    description: 'Stream broadcasting at optimal quality.',
    quality: 'perfect'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());

  // Monitor internet quality
  useEffect(() => {
    if (!stream) return;

    const monitorConnection = () => {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      // Get WebRTC stats if available
      const checkQuality = async () => {
        try {
          // Check if we can get stats (requires WebRTC connection)
          if ('getStats' in videoTrack) {
            const stats = await (videoTrack as any).getStats();
            let packetsLost = 0;
            let packetsReceived = 0;
            let roundTripTime = 0;

            stats.forEach((report: any) => {
              if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                packetsLost = report.packetsLost || 0;
                packetsReceived = report.packetsReceived || 0;
              }
              if (report.type === 'remote-candidate') {
                roundTripTime = report.roundTripTime || 0;
              }
            });

            const totalPackets = packetsLost + packetsReceived;
            const lossRate = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0;

            // Determine quality based on metrics
            if (lossRate < 1 && roundTripTime < 100) {
              setInternetQuality({
                level: 'Perfect Signal',
                description: 'Stream broadcasting at optimal quality.',
                quality: 'perfect'
              });
            } else if (lossRate < 3 && roundTripTime < 200) {
              setInternetQuality({
                level: 'Good Signal',
                description: 'Stream quality is good with minor degradation.',
                quality: 'good'
              });
            } else if (lossRate < 5) {
              setInternetQuality({
                level: 'Fair Signal',
                description: 'Stream quality is acceptable with some packet loss.',
                quality: 'fair'
              });
            } else {
              setInternetQuality({
                level: 'Poor Signal',
                description: 'Stream quality is degraded due to network issues.',
                quality: 'poor'
              });
            }
          } else {
            // Fallback: Use navigator.connection if available
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
            if (connection) {
              const downlink = connection.downlink || 0;
              const rtt = connection.rtt || 0;
              
              if (downlink > 5 && rtt < 100) {
                setInternetQuality({
                  level: 'Perfect Signal',
                  description: 'Stream broadcasting at optimal quality.',
                  quality: 'perfect'
                });
              } else if (downlink > 2 && rtt < 200) {
                setInternetQuality({
                  level: 'Good Signal',
                  description: 'Stream quality is good with minor degradation.',
                  quality: 'good'
                });
              } else if (downlink > 1) {
                setInternetQuality({
                  level: 'Fair Signal',
                  description: 'Stream quality is acceptable with some packet loss.',
                  quality: 'fair'
                });
              } else {
                setInternetQuality({
                  level: 'Poor Signal',
                  description: 'Stream quality is degraded due to network issues.',
                  quality: 'poor'
                });
              }
            }
          }
        } catch (error) {
          // Fallback to basic online status
          if (navigator.onLine) {
            setInternetQuality({
              level: 'Connected',
              description: 'Network connection is active.',
              quality: 'good'
            });
          } else {
            setInternetQuality({
              level: 'No Connection',
              description: 'Network connection is lost.',
              quality: 'poor'
            });
          }
        }
      };

      checkQuality();
      const interval = setInterval(checkQuality, 1000); // Check every 1 second for more responsive feedback

      return () => clearInterval(interval);
    };

    monitorConnection();
  }, [stream]);

  // Fullscreen toggle functions
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      try {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error attempting to enable fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error attempting to exit fullscreen:', error);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Listen for immediate network status changes
  useEffect(() => {
    const handleOnline = () => {
      setInternetQuality({
        level: 'Connected',
        description: 'Network connection restored.',
        quality: 'good'
      });
    };

    const handleOffline = () => {
      setInternetQuality({
        level: 'No Connection',
        description: 'Network connection lost.',
        quality: 'poor'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save session data when sharing stops
  const saveSessionData = useCallback(() => {
    const sessionDuration = Date.now() - sessionStartTime;
    const resolution = metadata?.width && metadata?.height ? `${metadata.width} × ${metadata.height}` : "Unknown";
    
    // Capture current frame
    const video = videoRef.current;
    let capturedFrame = null;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedFrame = canvas.toDataURL('image/png');
      }
    }
    
    // Save to localStorage
    localStorage.setItem('screenSessionDuration', sessionDuration.toString());
    localStorage.setItem('screenSessionResolution', resolution);
    if (capturedFrame) {
      localStorage.setItem('screenCapturedFrame', capturedFrame);
    }
  }, [sessionStartTime, metadata, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);

  return (
    <>
      <NetworkLoader show={internetQuality.quality === 'poor' || internetQuality.quality === 'fair'} />
      <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen flex flex-col">

      <NavBar
        title="Active Screen Test"
        style={{ background: "var(--bg)" }}
        className="px-4 sm:px-6 py-3"
        right={
          <>
            <button
              type="button"
              onClick={() => {
                saveSessionData();
                onStop();
                router.push("/screen-result");
              }}
              className="btn-danger flex items-center gap-2 px-4 py-2 text-sm"
            >
              <IoStopCircle className="text-[18px]" />
              Stop Sharing
            </button>
          </>
        }
      />

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium" style={{ color: "var(--text-faint)" }}>
          <a className="link-line" href="/">Home</a>
          <IoChevronForward className="text-sm" />
          <a className="link-line" href="/screen-test">Screen-test</a>
          <IoChevronForward className="text-sm" />
          <span style={{ color: "var(--text)" }}>Screen Share</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Left: Video + actions */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div
              ref={videoContainerRef}
              className="relative overflow-hidden rounded-xl"
              style={{ background: "#000", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
            >
              {/* Live badge */}
              <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Live</span>
              </div>

              {/* Expand/Contract button */}
              <button
                onClick={toggleFullscreen}
                className="absolute right-3 md:right-4 top-3 md:top-4 z-10 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/60 backdrop-blur-md text-white cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <IoContract className="text-lg" /> : <IoExpand className="text-lg" />}
              </button>

              {/* Snapshot button */}
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  
                  // Create download link
                  canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `screen-snapshot-${new Date().getTime()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }, 'image/png');
                }}
                className="absolute right-14 md:right-16 top-3 md:top-4 z-10 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/60 backdrop-blur-md text-white cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
                title="Take Snapshot"
              >
                <IoCameraOutline className="text-lg" />
              </button>

              <div className="aspect-video w-full bg-black relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                  aria-label="Live screen preview"
                />
              </div>

              <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-white/10 bg-black/80 backdrop-blur-sm">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Quality</p>
                    <p className="text-sm font-semibold text-white">{quality.level} ({quality.label})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <h3 className="text-sm font-bold">Technical Metadata</h3>
                <IoAnalytics style={{ color: "var(--text-faint)" }} />
              </div>

              <div className="flex flex-col gap-5">
                {[
                  { icon: "tv_options_edit_channels", label: "Source Type",        value: metadata?.displaySurface ?? "Unknown", extra: null, Icon: IoDesktopOutline },
                  { icon: "straighten",               label: "Native Resolution",  value: metadata?.width && metadata?.height ? `${metadata.width} × ${metadata.height}` : "—", extra: null, Icon: IoSpeedometer },
                  { icon: "speed",                    label: "Frame Rate",         value: metadata?.frameRate ? `${metadata.frameRate} FPS` : "—",
                    extra: (
                      <div className="flex items-center gap-0.5 text-emerald-500">
                        <IoTrendingUp className="text-sm" />
                        <span className="text-[10px] font-bold">STABLE</span>
                      </div>
                    ),
                    Icon: IoSpeedometer,
                  },
                  { icon: "dns",          label: "Protocol / Codec", value: "WebRTC / —",          extra: null, Icon: IoGlobe },
                  { icon: "cloud_upload", label: "Track Label",      value: metadata?.label ?? "—", extra: null, Icon: IoCloudUpload },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}
                      >
                        <row.Icon className="text-[18px]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
                          {row.label}
                        </p>
                        <p className="text-sm font-bold font-mono">{row.value}</p>
                      </div>
                    </div>
                    {row.extra}
                  </div>
                ))}
              </div>
            </Card>

            {/* Signal */}
            <Card 
              className="p-5" 
              style={{ 
                background: internetQuality.quality === 'perfect' ? '#f0fdf4' : 
                            internetQuality.quality === 'good' ? '#f0f9ff' :
                            internetQuality.quality === 'fair' ? '#fffbeb' : '#fef2f2',
                border: internetQuality.quality === 'perfect' ? '1px solid #bbf7d0' : 
                        internetQuality.quality === 'good' ? '1px solid #bfdbfe' :
                        internetQuality.quality === 'fair' ? '1px solid #fcd34d' : '1px solid #fca5a5'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{
                    background: internetQuality.quality === 'perfect' ? '#22c55e' : 
                                internetQuality.quality === 'good' ? '#3b82f6' :
                                internetQuality.quality === 'fair' ? '#f59e0b' : '#ef4444'
                  }}
                >
                  <IoWifi />
                </div>
                <div>
                  <p 
                    className="text-sm font-bold leading-snug"
                    style={{
                      color: internetQuality.quality === 'perfect' ? '#166534' : 
                            internetQuality.quality === 'good' ? '#1e3a8a' :
                            internetQuality.quality === 'fair' ? '#92400e' : '#991b1b'
                    }}
                  >
                    {internetQuality.level}
                  </p>
                  <p 
                    className="text-xs leading-snug"
                    style={{
                      color: internetQuality.quality === 'perfect' ? '#15803d' : 
                            internetQuality.quality === 'good' ? '#1e40af' :
                            internetQuality.quality === 'fair' ? '#b45309' : '#b91c1c'
                    }}
                  >
                    {internetQuality.description}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

/* ─── StatusBadge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: ScreenShareStatus }) {
  const cfg: Record<ScreenShareStatus, { label: string; dotColor: string }> = {
    idle:        { label: "Ready",                  dotColor: "var(--text-faint)" },
    requesting:  { label: "Requesting permission…", dotColor: "#fbbf24"           },
    active:      { label: "Stream active",          dotColor: "#22c55e"           },
    stopped:     { label: "Stopped",                dotColor: "var(--text-faint)" },
    cancelled:   { label: "Picker cancelled",       dotColor: "#fbbf24"           },
    denied:      { label: "Permission denied",      dotColor: "#ef4444"           },
    unsupported: { label: "Unsupported browser",    dotColor: "#ef4444"           },
    error:       { label: "Error",                  dotColor: "#ef4444"           },
  };
  const { label, dotColor } = cfg[status];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
      {label}
    </span>
  );
}

/* ─── MetadataCard ────────────────────────────────────────────────────────── */
function MetadataCard({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-lg px-4 py-3"
      style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold">{value ?? "—"}</span>
    </div>
  );
}

/* ─── Banner ──────────────────────────────────────────────────────────────── */
function Banner({ type, message }: { type: "error" | "warning" | "info"; message: string }) {
  const s = {
    error:   { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
    warning: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e" },
    info:    { bg: "var(--bg-subtle)", border: "var(--border)", text: "var(--text-muted)" },
  }[type];

  return (
    <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      {type === "info" ? (
        <IoInformationCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.text }} />
      ) : (
        <IoWarning className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.text }} />
      )}
      <p className="text-sm leading-relaxed" style={{ color: s.text }}>{message}</p>
    </div>
  );
}

/* ─── LivePreview ─────────────────────────────────────────────────────────── */
function LivePreview({
  stream,
  metadata,
  onStop,
}: {
  stream: MediaStream;
  metadata: ReturnType<typeof useScreenShare>["metadata"];
  onStop: () => void;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sessionStartTime] = useState<number>(Date.now());

  const saveSessionData = useCallback(() => {
    const sessionDuration = Date.now() - sessionStartTime;
    const resolution = metadata?.width && metadata?.height ? `${metadata.width} × ${metadata.height}` : "Unknown";
    
    // Capture current frame
    const video = videoRef.current;
    let capturedFrame = null;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedFrame = canvas.toDataURL('image/png');
      }
    }
    
    // Save to localStorage
    localStorage.setItem('screenSessionDuration', sessionDuration.toString());
    localStorage.setItem('screenSessionResolution', resolution);
    if (capturedFrame) {
      localStorage.setItem('screenCapturedFrame', capturedFrame);
    }
  }, [sessionStartTime, metadata, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl"
        style={{ background: "#000", border: "1px solid var(--border)" }}
      >
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" aria-label="Live screen preview" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {metadata && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetadataCard label="Display Type" value={metadata.displaySurface ?? "Unknown"} />
          <MetadataCard label="Resolution"   value={metadata.width && metadata.height ? `${metadata.width} × ${metadata.height}` : null} />
          <MetadataCard label="Frame Rate"   value={metadata.frameRate ? `${metadata.frameRate} fps` : null} />
          <MetadataCard label="Track Label"  value={metadata.label} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="danger" size="md" onClick={() => {
          saveSessionData();
          onStop();
          router.push("/screen-result");
        }}>Stop Sharing</Button>
      </div>
    </div>
  );
}

/* ─── StepDot ─────────────────────────────────────────────────────────────── */
function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: done    ? "var(--accent)"    : active ? "var(--bg-muted)"   : "var(--bg-subtle)",
          color:      done    ? "var(--accent-fg)"  : active ? "var(--text)"       : "var(--text-faint)",
          border:     active  ? "1px solid var(--border-strong)" : "1px solid var(--border)",
          transform:  active  ? "scale(1.15)" : "scale(1)",
          transition: "transform 180ms ease",
        }}
      >
        {done ? (
          <IoCheckmark className="h-3 w-3" />
        ) : n}
      </div>
      <span className="text-[10px] font-medium" style={{ color: active ? "var(--text)" : "var(--text-faint)" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── ScreenTestPage ──────────────────────────────────────────────────────── */
export default function ScreenTestPage() {
  const router = useRouter();
  const { status, errorMessage, metadata, stream, startScreenShare, stopScreenShare, reset } = useScreenShare();
  const suppressStoppedRedirectRef = useRef(false);

  useEffect(() => {
    if (status === "stopped") {
      if (suppressStoppedRedirectRef.current) return;
      router.push("/screen-result");
    }
  }, [router, status]);

  function handleHome() {
    suppressStoppedRedirectRef.current = true;
    stopScreenShare();
    router.push("/");
  }

  const isRequesting = status === "requesting";
  const isActive     = status === "active";
  const isStopped    = status === "stopped";
  const isTerminal   = ["cancelled", "denied", "unsupported", "error"].includes(status);

  if (isActive && stream) {
    return <ActiveDashboard stream={stream} metadata={metadata} onStop={stopScreenShare} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-subtle)" }}>
      <NavBar
        title="Screen Share Test App"
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleHome}
            className="flex items-center gap-1.5 text-sm font-medium hover:-translate-x-0.5 transition-transform duration-200 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            aria-label="Back to home"
          >
            <IoArrowBack className="h-4 w-4" />
            Home
          </button>
          <h1 className="text-base font-bold">Screen Test</h1>
          <StatusBadge status={status} />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-6"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          {/* Idle */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl hover:scale-105 transition-transform duration-200"
                style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
              >
                <IoDesktop className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ready to share your screen</h2>
                <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                  Click the button below to open the browser screen picker. Choose a tab, window, or entire screen. Your screen is previewed locally — nothing is recorded or sent.
                </p>
              </div>
              <Banner type="info" message="A browser dialog will open asking which screen, window, or tab you want to share. Select a source and click 'Share' to continue." />
              <Button variant="primary" size="lg" onClick={startScreenShare} loading={isRequesting} disabled={isRequesting}>
                Share My Screen
              </Button>
            </div>
          )}

          {/* Requesting */}
          {isRequesting && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute h-16 w-16 animate-ping rounded-full opacity-20" style={{ background: "var(--accent)" }} />
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
                >
                  <IoSync className="h-6 w-6 animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Waiting for permission…</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  The screen picker should be open in your browser. Select a source or press Cancel to abort.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
            </div>
          )}

          {/* Active */}
          {isActive && stream && <LivePreview stream={stream} metadata={metadata} onStop={stopScreenShare} />}

          {/* Stopped */}
          {isStopped && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--bg-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Opening results…</p>
              <Button variant="ghost" size="sm" onClick={() => router.push("/screen-result")}>Open Results</Button>
            </div>
          )}

          {/* Terminal */}
          {isTerminal && (
            <div className="flex flex-col gap-5 py-2">
              {errorMessage && <Banner type={status === "cancelled" ? "warning" : "error"} message={errorMessage} />}

              {(status === "cancelled" || status === "denied" || status === "error") && (
                <div className="flex flex-col gap-3 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {status === "cancelled" && "No source was selected. You can try again or return home."}
                    {status === "denied"    && "Screen sharing was blocked. Check your browser or OS permission settings."}
                    {status === "error"     && "An unexpected error occurred. Try again or check the console for details."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="primary"   size="md" onClick={startScreenShare}>Try Again</Button>
                    <Button variant="secondary" size="md" onClick={handleHome}>Back to Home</Button>
                  </div>
                </div>
              )}

              {status === "unsupported" && (
                <div className="flex flex-col gap-3 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Please switch to Chrome 72+ or Edge 79+ on a desktop device.
                  </p>
                  <Button variant="secondary" size="md" onClick={handleHome} className="self-center">Back to Home</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          <StepDot n={1} label="Request" active={status === "idle" || isRequesting} done={["active","stopped","cancelled","denied","error","unsupported"].includes(status)} />
          <div className="h-px w-8" style={{ background: "var(--border)" }} />
          <StepDot n={2} label="Preview" active={isActive}  done={isStopped} />
          <div className="h-px w-8" style={{ background: "var(--border)" }} />
          <StepDot n={3} label="Done"    active={isStopped} done={false} />
        </div>

        <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
          No recording · No upload · Local preview only
        </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
