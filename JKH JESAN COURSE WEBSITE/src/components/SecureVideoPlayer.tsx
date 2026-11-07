"use client";

import "@/lib/polyfill";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone, LogOut, Lock, ShieldAlert,
  AlertTriangle, Sparkles, Play,
  Maximize, Minimize, ChevronDown, Check, Sliders
} from "lucide-react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

// ── Quality & Resolution Human-Friendly Mappings ─────────────────────────
const QUALITY_LABELS: Record<string, string> = {
  auto: "Auto (স্বয়ংক্রিয়)",
  highres: "4K UHD (2160p)",
  hd1440: "2K QHD (1440p)",
  hd1080: "1080p FHD",
  hd720: "720p HD",
  large: "480p SD",
  medium: "360p",
  small: "240p",
  tiny: "144p",
};

const QUALITY_SHORT_LABELS: Record<string, string> = {
  auto: "Auto",
  highres: "4K UHD",
  hd1440: "1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
};

function getQualityLabel(q: string, short = false): string {
  if (!q) return "Auto";
  if (short) return QUALITY_SHORT_LABELS[q] || q;
  return QUALITY_LABELS[q] || q;
}

// ── Enterprise DOM & Video.js Resilience Patch ──────────────────────────
if (typeof window !== "undefined") {
  // 1. Safeguard against 3rd party scripts calling removeChild on unattached nodes
  if (!(window as any).__safeRemoveChildPatched) {
    const origRemoveChild = Node.prototype.removeChild;
    (Node.prototype as any).removeChild = function (child: any) {
      if (!this.contains(child)) {
        return child;
      }
      return origRemoveChild.call(this, child);
    };
    (window as any).__safeRemoveChildPatched = true;
  }

  // 2. Register videojs-youtube and safeguard its dispose lifecycle & quality events
  try {
    require("videojs-youtube");
    const YoutubeTech = (videojs as any).getTech?.("Youtube");
    if (YoutubeTech && YoutubeTech.prototype) {
      if (!YoutubeTech.prototype._safeDisposePatched) {
        YoutubeTech.prototype.dispose = function() {
          try {
            if (this.ytPlayer) {
              try { this.ytPlayer.stopVideo?.(); } catch (_) {}
              try { this.ytPlayer.destroy?.(); } catch (_) {}
              this.ytPlayer = null;
            }
            if (this.el_ && this.el_.parentNode) {
              try {
                if (this.el_.parentNode.className) {
                  this.el_.parentNode.className = this.el_.parentNode.className
                    .replace(' vjs-youtube', '')
                    .replace(' vjs-youtube-mobile', '');
                }
              } catch (_) {}
              try {
                if (this.el_.parentNode.contains(this.el_)) {
                  this.el_.parentNode.removeChild(this.el_);
                }
              } catch (_) {}
            }
            const TechProto = (videojs as any).getTech?.('Tech')?.prototype;
            if (TechProto && TechProto.dispose) {
              TechProto.dispose.call(this);
            }
          } catch (_) {}
        };
        YoutubeTech.prototype._safeDisposePatched = true;
      }

      if (!YoutubeTech.prototype._qualityEventPatched) {
        YoutubeTech.prototype.onPlayerPlaybackQualityChange = function(e: any) {
          try {
            this.trigger('playbackqualitychange', e);
          } catch (_) {}
        };
        YoutubeTech.prototype._qualityEventPatched = true;
      }
    }
  } catch (_) {}
}

interface SecureVideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  email: string;
  lessonId?: string;
  onEnded?: () => void;
}

function extractYouTubeId(rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  return "";
}

export default function SecureVideoPlayer({
  url,
  poster,
  title,
  email,
  lessonId,
  onEnded,
}: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Client Mount Gate (guarantees zero hydration mismatch & zero removeChild crashes)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Video Type Resolution
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be") || /^[a-zA-Z0-9_-]{11}$/.test(url.trim());
  const youtubeId = isYouTube ? extractYouTubeId(url) : "";
  const resolvedYoutubeUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : url;
  const isDirectVideo = !isYouTube;
  const directVideoSrc = isDirectVideo
    ? (lessonId ? `/api/video/stream?lessonId=${encodeURIComponent(lessonId)}` : url)
    : url;

  // Player UI & Security States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isDeviceConflict, setIsDeviceConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);
  const [isScreenshotAttempt, setIsScreenshotAttempt] = useState(false);
  const screenshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quality & Resolution States - Default to 1080p Full HD
  const [selectedQuality, setSelectedQuality] = useState<string>("hd1080");
  const [actualQuality, setActualQuality] = useState<string>("hd1080");
  const [availableQualities] = useState<string[]>([
    "hd1080", "hd720", "large", "medium", "auto"
  ]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const [hudToast, setHudToast] = useState<string | null>(null);
  const hudTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore student's preferred resolution from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("evorise_preferred_quality");
      if (saved) {
        setSelectedQuality(saved);
        setActualQuality(saved);
      }
    } catch (_) {}
  }, []);

  // Top Privacy Bar Auto-Hide Controller (hides after 3s while playing, reveals on activity)
  const [showTopBar, setShowTopBar] = useState(true);
  const topBarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserInteraction = useCallback(() => {
    setShowTopBar(true);
    if (topBarTimerRef.current) clearTimeout(topBarTimerRef.current);
    if (isPlaying && !showQualityMenu) {
      topBarTimerRef.current = setTimeout(() => {
        setShowTopBar(false);
      }, 3000);
    }
  }, [isPlaying, showQualityMenu]);

  useEffect(() => {
    handleUserInteraction();
  }, [isPlaying, showQualityMenu, handleUserInteraction]);

  // Click / touch outside to close quality menu
  useEffect(() => {
    if (!showQualityMenu) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(target)) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showQualityMenu]);

  const showHud = useCallback((msg: string) => {
    setHudToast(msg);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => setHudToast(null), 2500);
  }, []);

  const handleQualitySelect = useCallback((quality: string) => {
    setSelectedQuality(quality);
    setActualQuality(quality);
    setShowQualityMenu(false);

    try {
      localStorage.setItem("evorise_preferred_quality", quality);
    } catch (_) {}

    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    try {
      const tech = (player as any).tech_;
      const yt = tech?.ytPlayer;
      if (yt) {
        const targetQuality = quality === "auto" ? "default" : quality;

        // 1. Send quality instructions to YouTube tech
        if (typeof yt.setPlaybackQuality === "function") {
          yt.setPlaybackQuality(targetQuality);
        }
        if (typeof yt.setPlaybackQualityRange === "function") {
          yt.setPlaybackQualityRange(targetQuality, targetQuality);
        }

        // 2. Re-anchor stream buffer at current position with requested quality
        if (typeof yt.loadVideoById === "function" && youtubeId) {
          const currentTime = player.currentTime() || 0;
          const wasPaused = player.paused();
          yt.loadVideoById({
            videoId: youtubeId,
            startSeconds: currentTime,
            suggestedQuality: targetQuality,
          });
          if (wasPaused) {
            setTimeout(() => {
              try { yt.pauseVideo?.(); } catch (_) {}
            }, 300);
          }
        }

        showHud(`রেজোলিউশন: ${getQualityLabel(quality, false)}`);
      } else {
        showHud(`রেজোলিউশন: ${getQualityLabel(quality, false)}`);
      }
    } catch (err) {
      console.warn("Quality selection notice:", err);
    }
  }, [youtubeId, showHud]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    try {
      const isCurrentlyFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFs) {
        if (container.requestFullscreen) {
          await container.requestFullscreen().catch(() => {});
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }

        try {
          if (typeof screen !== "undefined" && (screen.orientation as any)?.lock) {
            await (screen.orientation as any).lock("landscape").catch(() => {});
          }
        } catch (_) {}

        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }

        try {
          if (typeof screen !== "undefined" && (screen.orientation as any)?.unlock) {
            (screen.orientation as any).unlock();
          }
        } catch (_) {}

        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle notice:", err);
    }
  }, []);

  // ── VIDEO.JS INITIALIZATION & LIFECYCLE ──────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const vContainer = videoContainerRef.current;
    if (!vContainer) return;

    // Dispose previous player if any
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        playerRef.current.dispose();
      } catch (_) {}
      playerRef.current = null;
    }
    vContainer.innerHTML = "";

    // Create fresh video-js DOM node (React-safe container pattern)
    const videoElement = document.createElement("video-js");
    videoElement.className = "video-js vjs-big-play-centered vjs-luxury-gold vjs-default-skin w-full h-full";
    videoElement.setAttribute("playsinline", "true");
    if (poster) {
      videoElement.setAttribute("poster", poster);
    }
    vContainer.appendChild(videoElement);

    const sourceObj = isYouTube
      ? { type: "video/youtube", src: resolvedYoutubeUrl }
      : {
          type: directVideoSrc.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          src: directVideoSrc,
        };

    const playerOptions: any = {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      poster: poster || undefined,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      techOrder: isYouTube ? ["youtube", "html5"] : ["html5"],
      sources: [sourceObj],
      youtube: {
        enablePrivacyEnhancedMode: true,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1,
        customVars: {
          vq: "hd1080",
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
      },
      controlBar: {
        playToggle: true,
        volumePanel: { inline: false },
        currentTimeDisplay: true,
        timeDivider: true,
        durationDisplay: true,
        progressControl: true,
        playbackRateMenuButton: true,
        fullscreenToggle: true,
      },
    };

    try {
      const player = (playerRef.current = videojs(videoElement, playerOptions, function () {
        const self = this as any;
        // Hint YouTube tech for high quality if available
        if (self.tech_ && self.tech_.ytPlayer) {
          try {
            self.tech_.ytPlayer.setPlaybackQuality?.("hd1080");
          } catch (_) {}
        }
      }));

      // Route any Video.js fullscreen call to container
      (player as any).requestFullscreen = async function () {
        toggleFullscreen();
        return Promise.resolve();
      };
      (player as any).exitFullscreen = async function () {
        toggleFullscreen();
        return Promise.resolve();
      };

      const markPlaying = () => {
        setIsPlaying(true);
        setHasStarted(true);
      };

      player.on("play", markPlaying);
      player.on("playing", markPlaying);
      player.on("timeupdate", () => {
        if (!player.paused()) {
          setIsPlaying(prev => (prev ? prev : true));
          setHasStarted(true);
        }
      });

      player.on("playbackqualitychange", (e: any) => {
        if (e?.data && typeof e.data === "string" && e.data !== "unknown") {
          setActualQuality(e.data);
        }
      });

      player.on("pause", () => {
        setIsPlaying(false);
      });

      player.on("ended", () => {
        setIsPlaying(false);
        onEnded?.();
      });

      player.on("fullscreenchange", () => {
        setIsFullscreen(!!player.isFullscreen());
      });

      const handleOrientationOrResize = () => {
        setTimeout(() => {
          if (playerRef.current && !playerRef.current.isDisposed()) {
            try {
              playerRef.current.trigger("resize");
            } catch (_) {}
          }
        }, 150);
      };
      window.addEventListener("resize", handleOrientationOrResize);
      window.addEventListener("orientationchange", handleOrientationOrResize);
    } catch (err) {
      console.warn("Video.js initialization notice:", err);
    }

    return () => {
      if (topBarTimerRef.current) clearTimeout(topBarTimerRef.current);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        try {
          playerRef.current.dispose();
        } catch (_) {}
        playerRef.current = null;
      }
      if (vContainer) {
        vContainer.innerHTML = "";
      }
    };
  }, [isMounted, url, lessonId, poster, resolvedYoutubeUrl, directVideoSrc, isYouTube, onEnded, toggleFullscreen]);

  // ── FORENSIC MOVING WATERMARK CANVAS ─────────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle1 = 0.5, angle2 = 2.1, angle3 = 4.3;
    const speed = 0.35;
    let p1 = { x: 50, y: 50 };
    let p2 = { x: 150, y: 80 };
    let p3 = { x: 100, y: 150 };

    const cleanEmail = (email || "STUDENT").toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];

    const render = () => {
      if (!canvas || !ctx) return;
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      const dw = canvas.offsetWidth;
      const dh = canvas.offsetHeight;

      if (dw === 0 || dh === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== dw * dpr || canvas.height !== dh * dpr) {
        canvas.width = dw * dpr;
        canvas.height = dh * dpr;
        p1 = { x: dw * 0.15, y: dh * 0.25 };
        p2 = { x: dw * 0.7,  y: dh * 0.4  };
        p3 = { x: dw * 0.45, y: dh * 0.75 };
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, dw, dh);

      const move = (p: { x: number; y: number }, ang: number, x0: number, x1: number, y0: number, y1: number) => {
        p.x += Math.cos(ang) * speed;
        p.y += Math.sin(ang) * speed;
        if (p.x < x0 || p.x > x1) ang = Math.PI - ang;
        if (p.y < y0 || p.y > y1) ang = -ang;
        return ang;
      };

      angle1 = move(p1, angle1, 30, Math.max(dw - 180, 50), 40, Math.max(dh * 0.35, 50));
      angle2 = move(p2, angle2, 40, Math.max(dw - 180, 80), Math.max(dh * 0.35, 50), Math.max(dh * 0.65, 80));
      angle3 = move(p3, angle3, 30, Math.max(dw - 180, 60), Math.max(dh * 0.65, 80), Math.max(dh - 50, 100));

      const drawBadge = (x: number, y: number, text: string, alpha: number) => {
        ctx.save();
        ctx.font = "bold 11px monospace";
        const w = ctx.measureText(text).width + 16;
        ctx.fillStyle = `rgba(18,22,10,${alpha * 0.75})`;
        ctx.strokeStyle = `rgba(200,144,10,${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, w, 20, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillText(text, x + 8, y + 14);
        ctx.restore();
      };

      drawBadge(p1.x, p1.y, `EVORISE ID: ${cleanEmail}`, 0.22);
      drawBadge(p2.x, p2.y, `AUTH: ${dateStr} • SECURE STREAM`, 0.18);
      drawBadge(p3.x, p3.y, `DO NOT RECORD • ${cleanEmail}`, 0.20);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [email, isMounted]);

  // ── KEYBOARD SHORTCUTS & ANTI-DEVTOOLS ───────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;

    const checkDevTools = () => {
      const isMobile = typeof window !== "undefined" && (
        window.innerWidth < 1024 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
      if (isMobile) { setIsDevToolsDetected(false); return; }

      const widthDiff = window.outerWidth - window.innerWidth > 220;
      const heightDiff = window.outerHeight - window.innerHeight > 220;
      setIsDevToolsDetected(widthDiff || heightDiff);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) return;

      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        try { navigator.clipboard?.writeText("").catch(() => {}); } catch (_) {}
        setIsScreenshotAttempt(true);
        if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current);
        screenshotTimerRef.current = setTimeout(() => setIsScreenshotAttempt(false), 3500);
        return;
      }

      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && /^[IJCijc]$/.test(e.key)) ||
        (e.ctrlKey && /^[USPCAKuspck]$/.test(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("resize", checkDevTools);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", checkDevTools);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted]);

  // ── SINGLE-DEVICE LOCK & BAN CHECK (30s POLLING, ZERO CRASH) ────────────
  useEffect(() => {
    if (!isMounted) return;
    let mounted = true;

    const check = async () => {
      try {
        const res = await fetch("/api/security/heartbeat");
        if (!mounted) return;

        if (res.status === 409) {
          const data = await res.json();
          setIsDeviceConflict(true);
          setConflictMessage(data.error || "অন্য ডিভাইস থেকে লগইন সনাক্ত করা হয়েছে।");
          return;
        }

        if (res.status === 403) {
          const data = await res.json();
          setIsBanned(true);
          setBanReason(data.error || "সিকিউরিটি পলিসি লঙ্ঘনের জন্য একাউন্ট স্থগিত।");
          return;
        }
      } catch (_) {
        // Silent failsafe: never crash video during transient network blips
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [isMounted]);

  // Fullscreen change listener
  useEffect(() => {
    if (!isMounted) return;
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isMounted]);

  const handlePlayerAreaClick = useCallback(() => {
    handleUserInteraction();

    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      try {
        if (player.paused()) {
          player.play();
        } else {
          const isTouchDevice = typeof window !== "undefined" && (
            "ontouchstart" in window || navigator.maxTouchPoints > 0
          );
          if (isTouchDevice && !showTopBar) {
            setShowTopBar(true);
          } else {
            player.pause();
          }
        }
      } catch (_) {}
    }
  }, [handleUserInteraction, showTopBar]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isMounted) return;

    const handlePlayerKeyboard = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) return;

      const player = playerRef.current;
      if (!player || player.isDisposed()) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (player.paused()) player.play();
        else player.pause();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        player.currentTime(Math.max(0, (player.currentTime() || 0) - 5));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        player.currentTime(Math.min(player.duration() || 0, (player.currentTime() || 0) + 5));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        player.volume(Math.min(1, (player.volume() || 0) + 0.1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        player.volume(Math.max(0, (player.volume() || 0) - 0.1));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        player.muted(!player.muted());
      }
    };

    window.addEventListener("keydown", handlePlayerKeyboard);
    return () => window.removeEventListener("keydown", handlePlayerKeyboard);
  }, [isMounted, toggleFullscreen]);

  // ── CAPTURE-PHASE EVENT GUARDS (RIGHT-CLICK, COPY, DRAG) ──────────────────
  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    const blockSecurityEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    container.addEventListener("contextmenu", blockSecurityEvent, true);
    container.addEventListener("copy", blockSecurityEvent, true);
    container.addEventListener("cut", blockSecurityEvent, true);
    container.addEventListener("dragstart", blockSecurityEvent, true);
    container.addEventListener("selectstart", blockSecurityEvent, true);
    container.addEventListener("auxclick", blockSecurityEvent, true);

    return () => {
      container.removeEventListener("contextmenu", blockSecurityEvent, true);
      container.removeEventListener("copy", blockSecurityEvent, true);
      container.removeEventListener("cut", blockSecurityEvent, true);
      container.removeEventListener("dragstart", blockSecurityEvent, true);
      container.removeEventListener("selectstart", blockSecurityEvent, true);
      container.removeEventListener("auxclick", blockSecurityEvent, true);
    };
  }, [isMounted]);

  return (
    <div
      ref={containerRef}
      id="secure-player-container"
      key={lessonId || resolvedYoutubeUrl || "secure-player"}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); return false; }}
      onCopy={e => { e.preventDefault(); e.stopPropagation(); return false; }}
      onCut={e => { e.preventDefault(); e.stopPropagation(); return false; }}
      onDragStart={e => { e.preventDefault(); e.stopPropagation(); return false; }}
      onMouseMove={handleUserInteraction}
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onClick={handleUserInteraction}
      className="w-full h-full relative aspect-video bg-black overflow-hidden select-none rounded-xl md:rounded-2xl border border-[#2A3319] shadow-2xl"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", touchAction: "manipulation" }}
    >
      {/* ── INITIAL MOUNT OVERLAY ────────────────────────────────────── */}
      {!isMounted && (
        <div className="absolute inset-0 bg-black z-40 flex items-center justify-center select-none">
          <div className="flex flex-col items-center gap-2 text-[#C8900A]">
            <div className="w-7 h-7 rounded-full border-2 border-[#C8900A] border-t-transparent animate-spin" />
            <span className="text-[11px] font-mono text-white/50">লোড হচ্ছে...</span>
          </div>
        </div>
      )}
      {/* ── VIDEO.JS PLAYER WRAPPER ──────────────────────────────────── */}
      <div
        ref={videoContainerRef}
        data-vjs-player
        className="w-full h-full absolute inset-0 evorise-videojs-container"
      />

      {/* ── TRANSPARENT CLICK SHIELD (HANDLES PLAY/PAUSE, BLOCKS ANY YOUTUBE REDIRECTS) ── */}
      <div
        id="secure-click-shield"
        onClick={handlePlayerAreaClick}
        onDoubleClick={toggleFullscreen}
        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); return false; }}
        className="absolute top-0 left-0 right-0 bottom-12 z-20 cursor-pointer select-none"
        style={{ pointerEvents: "auto" }}
      />

      {/* ── LUXURY PAUSE OVERLAY (CONCEALS YOUTUBE ADS/RECOMMENDATIONS WHILE LEAVING CONTROLS FULLY INTERACTIVE) ── */}
      {isYouTube && hasStarted && !isPlaying && (
        <div
          onClick={handlePlayerAreaClick}
          onDoubleClick={toggleFullscreen}
          onContextMenu={e => { e.preventDefault(); e.stopPropagation(); return false; }}
          className="absolute top-0 left-0 right-0 bottom-12 z-25 bg-[#0A0D06]/80 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-[#12160A]/95 border-2 border-[#C8900A] flex items-center justify-center text-[#C8900A] shadow-[0_0_35px_rgba(200,144,10,0.6)] mb-3 hover:scale-105 active:scale-95 transition-transform">
            <Play size={28} className="fill-[#C8900A] ml-1" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#F2EDE4] drop-shadow-md">
            ভিডিওটি পজ করা হয়েছে
          </span>
          <span className="text-[11px] text-[#C8900A] font-mono mt-1 opacity-90">
            চালু করতে ক্লিক করুন
          </span>
        </div>
      )}



      {/* ── PERMANENT BOTTOM-RIGHT WATERMARK SHIELD (TOTALLY CONCEALS "WATCH ON YOUTUBE" / LOGO) ──── */}
      {isYouTube && (
        <div
          className="absolute bottom-0 right-0 h-14 w-60 z-34 pointer-events-none select-none flex items-center justify-end pr-3 bg-[#0A0D06]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#12160A] border border-[#C8900A]/50 text-[#C8900A] text-[10px] font-mono font-bold tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8900A] animate-pulse" />
            <span>EVORISE SECURE</span>
          </div>
        </div>
      )}

      {/* ── PERMANENT BOTTOM-LEFT SHIELD (CONCEALS ANY YOUTUBE HOVER / ACCESSIBILITY ARTIFACTS) ──── */}
      {isYouTube && (
        <div
          className="absolute bottom-0 left-0 h-14 w-36 z-34 pointer-events-none select-none bg-[#0A0D06]"
          aria-hidden="true"
        />
      )}

      {/* ── FORENSIC MOVING WATERMARK CANVAS ─────────────────────────── */}
      <canvas
        ref={canvasRef}
        id="secure-ghost-watermark"
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-25"
      />

      {/* ── HUD QUALITY TOAST NOTIFICATION ────────────────────────── */}
      {hudToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-[#12160A]/95 border border-[#C8900A]/80 shadow-[0_0_25px_rgba(200,144,10,0.4)] text-[#F2EDE4] text-[11px] sm:text-xs font-mono font-bold flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-[#C8900A] animate-ping shrink-0" />
          <span>{hudToast}</span>
        </div>
      )}

      {/* ── TOP PRIVACY MASK (TOTALLY MASKS YOUTUBE CHANNEL, AVATAR & SHARE) ──── */}
      {isYouTube && (
        <div
          className={`absolute top-0 left-0 right-0 h-14 bg-[#0A0D06] border-b border-[#2A3319]/50 pointer-events-auto z-25 flex items-center justify-between px-3 sm:px-5 select-none shadow-lg transition-all duration-300 ease-in-out ${
            showTopBar || !isPlaying || showQualityMenu
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Brand + Lesson Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12160A] border border-[#C8900A]/50 shadow-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#C8900A] animate-pulse" />
              <span className="text-[10px] font-black text-[#F2EDE4] uppercase tracking-wider">EVORISE PRO</span>
            </div>
            {title && (
              <span className="text-xs sm:text-sm font-bold text-white/95 truncate drop-shadow-md">
                {title}
              </span>
            )}
          </div>

          {/* Interactive Quality Selector & Fullscreen Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quality Dropdown Trigger */}
            <div className="relative" ref={qualityMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(prev => !prev);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12160A] hover:bg-[#1E2412] active:scale-95 border border-[#C8900A]/60 text-[#C8900A] text-[10px] sm:text-[11px] font-bold font-mono shadow-md transition-all cursor-pointer"
                title="ভিডিও রেজোলিউশন পরিবর্তন করুন"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>
                  {selectedQuality === "auto"
                    ? `${getQualityLabel(actualQuality, true)} (Auto)`
                    : getQualityLabel(selectedQuality, true)}
                </span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showQualityMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Quality Dropdown Menu */}
              {showQualityMenu && (
                <div
                  className="absolute top-full right-0 mt-1.5 bg-[#0D1007]/98 backdrop-blur-xl border border-[#2A3319] rounded-xl p-1.5 shadow-2xl flex flex-col gap-0.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1 text-[9px] font-mono text-white/40 uppercase tracking-widest border-b border-[#2A3319]/60 mb-1 flex items-center justify-between">
                    <span>রেজোলিউশন</span>
                    <Sliders size={10} className="text-[#C8900A]" />
                  </div>

                  {availableQualities.map((q) => {
                    const isSelected = selectedQuality === q;
                    const isCurrentActual = actualQuality === q && selectedQuality === "auto";
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleQualitySelect(q)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#C8900A] text-black font-extrabold shadow-sm"
                            : "text-white/80 hover:bg-[#1E2412] hover:text-[#C8900A]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {getQualityLabel(q, false)}
                          {isCurrentActual && <span className="text-[9px] opacity-70">(Active)</span>}
                        </span>
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#12160A] hover:bg-[#1E2412] border border-[#2A3319] text-white/80 hover:text-white transition-all shadow-md cursor-pointer"
              title="ফুলস্ক্রিন (F)"
            >
              {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </button>
          </div>
        </div>
      )}



      {/* ── SCREENSHOT LOCKOUT ────────────────────────────────────────── */}
      {isScreenshotAttempt && (
        <div className="absolute inset-0 z-50 bg-black/98 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.4)]">
            <ShieldAlert size={36} />
          </div>
          <h3 className="text-lg font-black text-white mb-2">স্ক্রিনশট বা ক্যাপচার সনাক্ত!</h3>
          <p className="text-white/70 text-xs sm:text-sm max-w-md leading-relaxed font-sans mb-2">
            এই কোর্সের প্রতিটি ফ্রেম কপিরাইট সুরক্ষিত।
          </p>
          <span className="text-[11px] font-mono text-[#C8900A]">আইডি: {email} • অ্যাকশন লগ করা হয়েছে</span>
        </div>
      )}

      {/* ── DEVTOOLS LOCKOUT ──────────────────────────────────────────── */}
      {isDevToolsDetected && (
        <div className="absolute inset-0 z-50 bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-4 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
            <AlertTriangle size={36} />
          </div>
          <h3 className="text-lg font-black text-red-500 mb-2">ডেভেলপার টুলস সনাক্ত!</h3>
          <p className="text-white/75 text-xs sm:text-sm max-w-md mb-4 leading-relaxed font-sans">
            F12 বা Inspect উইন্ডো বন্ধ করলে ভিডিও আবার চলবে।
          </p>
        </div>
      )}

      {/* ── DEVICE CONFLICT LOCKOUT ───────────────────────────────────── */}
      {isDeviceConflict && (
        <div className="absolute inset-0 z-50 bg-[#0B0E06]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
            <Smartphone size={32} />
          </div>
          <h3 className="text-lg font-black text-white mb-2">একাধিক ডিভাইস সনাক্ত!</h3>
          <p className="text-white/70 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">{conflictMessage}</p>
          <button
            onClick={() => {
              router.push("/login");
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C8900A] to-[#E5A817] text-black text-xs sm:text-sm font-black shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} /> লগআউট করুন
          </button>
        </div>
      )}

      {/* ── BANNED USER LOCKOUT ───────────────────────────────────────── */}
      {isBanned && (
        <div className="absolute inset-0 z-50 bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center mb-4 text-red-500 shadow-[0_0_35px_rgba(239,68,68,0.3)]">
            <Lock size={32} />
          </div>
          <h3 className="text-lg font-black text-red-500 mb-2">একাউন্ট সাময়িকভাবে স্থগিত</h3>
          <p className="text-white/70 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">{banReason}</p>
          <button
            onClick={() => {
              router.push("/login");
            }}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} /> বের হয়ে যান
          </button>
        </div>
      )}
    </div>
  );
}
