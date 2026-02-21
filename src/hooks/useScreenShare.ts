"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type ScreenShareStatus =
  | "idle"
  | "requesting"
  | "active"
  | "stopped"
  | "cancelled"
  | "denied"
  | "unsupported"
  | "error";

export interface StreamMetadata {
  displaySurface: string | null;
  width: number | null;
  height: number | null;
  frameRate: number | null;
  label: string;
}

export interface ScreenShareState {
  status: ScreenShareStatus;
  errorMessage: string | null;
  metadata: StreamMetadata | null;
  stream: MediaStream | null;
}

export interface UseScreenShareReturn extends ScreenShareState {
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  reset: () => void;
}

const INITIAL_STATE: ScreenShareState = {
  status: "idle",
  errorMessage: null,
  metadata: null,
  stream: null,
};

function extractMetadata(stream: MediaStream): StreamMetadata {
  const track = stream.getVideoTracks()[0];
  if (!track) {
    return {
      displaySurface: null,
      width: null,
      height: null,
      frameRate: null,
      label: "Unknown",
    };
  }

  const settings = track.getSettings();
  // displaySurface is part of the spec but not in base TS types
  const extSettings = settings as MediaTrackSettings & {
    displaySurface?: string;
  };

  const raw = extSettings.displaySurface ?? null;
  let displaySurface: string | null = null;
  if (raw === "monitor") displaySurface = "Entire Screen";
  else if (raw === "window") displaySurface = "Window";
  else if (raw === "browser") displaySurface = "Tab";
  else if (raw) displaySurface = raw;

  return {
    displaySurface,
    width: settings.width ?? null,
    height: settings.height ?? null,
    frameRate: settings.frameRate ? Math.round(settings.frameRate) : null,
    label: track.label || "Screen",
  };
}

export function useScreenShare(): UseScreenShareReturn {
  const [state, setState] = useState<ScreenShareState>(INITIAL_STATE);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const statsIntervalRef = useRef<number | null>(null);

  // Cleanup helper – stops all tracks and clears refs
  const cleanup = useCallback(() => {
    if (statsIntervalRef.current) {
      window.clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const persistSessionDuration = useCallback(() => {
    if (!sessionStartTimeRef.current) return;
    try {
      localStorage.setItem(
        "screenSessionDuration",
        String(Date.now() - sessionStartTimeRef.current)
      );
    } catch {
      // ignore
    }
  }, []);

  const persistLastFrame = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    // Best-effort: ImageCapture is available in Chromium-based browsers.
    // If not available, we simply skip storing frames.
    const AnyWindow = window as unknown as {
      ImageCapture?: new (t: MediaStreamTrack) => {
        grabFrame: () => Promise<ImageBitmap>;
      };
    };

    if (!AnyWindow.ImageCapture) return;

    try {
      const imageCapture = new AnyWindow.ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      localStorage.setItem("screenCapturedFrame", dataUrl);
    } catch {
      // ignore
    }
  }, []);

  const startRealtimePersistence = useCallback(() => {
    if (statsIntervalRef.current) return;
    // Update duration often; update frame less often to reduce overhead.
    let tick = 0;
    statsIntervalRef.current = window.setInterval(() => {
      persistSessionDuration();
      tick += 1;
      if (tick % 3 === 0) {
        void persistLastFrame();
      }
    }, 1000);
  }, [persistLastFrame, persistSessionDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const stopScreenShare = useCallback(() => {
    persistSessionDuration();
    cleanup();
    setState((prev) => ({
      ...prev,
      status: "stopped",
      stream: null,
      metadata: null,
    }));
  }, [cleanup, persistSessionDuration]);

  const startScreenShare = useCallback(async () => {
    // Guard: check API support
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getDisplayMedia !== "function"
    ) {
      setState({
        status: "unsupported",
        errorMessage:
          "Your browser does not support screen sharing (getDisplayMedia).",
        metadata: null,
        stream: null,
      });
      return;
    }

    // Clean up any lingering stream first
    cleanup();

    setState({
      status: "requesting",
      errorMessage: null,
      metadata: null,
      stream: null,
    });

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: false,
      });

      const meta = extractMetadata(mediaStream);
      streamRef.current = mediaStream;
      sessionStartTimeRef.current = Date.now();

      try {
        localStorage.setItem("screenSessionStartTime", String(sessionStartTimeRef.current));
        localStorage.setItem(
          "screenSessionResolution",
          meta.width && meta.height ? `${meta.width} × ${meta.height}` : "Unknown"
        );
      } catch {
        // ignore
      }

      // Attach track.onended to detect user stopping from browser UI
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          // Only transition to stopped if we are currently active
          setState((prev) => {
            if (prev.status === "active") {
              persistSessionDuration();
              cleanup();
              return {
                ...prev,
                status: "stopped",
                stream: null,
                metadata: null,
              };
            }
            return prev;
          });
        };
      }

      // Start real-time persistence after we have a stream.
      startRealtimePersistence();

      setState({
        status: "active",
        errorMessage: null,
        metadata: meta,
        stream: mediaStream,
      });
    } catch (err: unknown) {
      cleanup();

      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          // Distinguish between user cancellation and explicit denial.
          // Chrome sets message to "Permission denied by system" for OS-level
          // denial; cancelling the picker also triggers NotAllowedError.
          // Heuristic: if no message detail, treat as cancelled.
          const lowerMsg = (err.message || "").toLowerCase();
          const isCancelled =
            lowerMsg.includes("cancel") ||
            lowerMsg === "" ||
            lowerMsg === "permission denied";

          setState({
            status: isCancelled ? "cancelled" : "denied",
            errorMessage: isCancelled
              ? "You closed the screen picker without selecting a source."
              : "Screen sharing permission was denied. Please allow access and try again.",
            metadata: null,
            stream: null,
          });
          return;
        }

        if (err.name === "AbortError") {
          setState({
            status: "cancelled",
            errorMessage: "Screen sharing was aborted.",
            metadata: null,
            stream: null,
          });
          return;
        }

        if (err.name === "NotFoundError") {
          setState({
            status: "error",
            errorMessage: "No suitable screen source was found.",
            metadata: null,
            stream: null,
          });
          return;
        }
      }

      // Fallback
      setState({
        status: "error",
        errorMessage:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while requesting screen access.",
        metadata: null,
        stream: null,
      });
    }
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState(INITIAL_STATE);
  }, [cleanup]);

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    reset,
  };
}
