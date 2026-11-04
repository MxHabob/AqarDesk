"use client";

import { Button } from "@aqardesk/ui/button";
import { Icons } from "@aqardesk/ui/icons";
import {
  Building2,
  ClipboardList,
  DraftingCompass,
  FileText,
  Hammer,
  Handshake,
  House,
  KeyRound,
  Megaphone,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScopedI18n } from "@/locales/client";



// Dynamic imports for below-the-fold sections (still SSR for SEO)
const FeaturesGridSection = dynamic(() =>
  import("./sections/features-grid-section").then((m) => m.FeaturesGridSection),
);
const TimeSavingsSection = dynamic(() =>
  import("./sections/time-savings-section").then((m) => m.TimeSavingsSection),
);
const TestimonialsSection = dynamic(
  () =>
    import("./sections/testimonials-section").then(
      (m) => m.TestimonialsSection,
    ),
  { ssr: false }, // MorphingDialog generates dynamic IDs that cause hydration mismatch
);
const videos = [
  {
    id: "overview",
    title: "Overview",
    subtitle: "See how AqarDesk helps you run your business without the admin.",
    url: "https://cdn.midday.ai/videos/login-video.mp4",
  },
  {
    id: "transactions",
    title: "Transactions",
    subtitle:
      "Every payment is automatically collected, categorized, and kept in one place so nothing gets lost.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
  {
    id: "inbox",
    title: "Inbox",
    subtitle:
      "Receipts and invoices are pulled from email and payments, then matched to transactions automatically.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
  {
    id: "time-tracking",
    title: "Time tracking",
    subtitle:
      "Track time across projects and customers, then turn hours into accurate invoices so nothing is missed.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
  {
    id: "invoicing",
    title: "Invoicing",
    subtitle:
      "Create invoices, send to customers, and track payments in one place.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
  {
    id: "customers",
    title: "Customers",
    subtitle:
      "See revenue, profitability, and activity per customer in one place without switching between tools.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
  {
    id: "files",
    title: "Files",
    subtitle:
      "Smart storage that automatically organizes and connects files to transactions, invoices, and customers.",
    url: "https://cdn.midday.ai/videos/login-video.mp4", // Replace with actual video URL
  },
];

export function StartPage() {
  const t = useScopedI18n("site");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPosterLoaded, setIsPosterLoaded] = useState(false);
  const [isDashboardLightLoaded, setIsDashboardLightLoaded] = useState(false);
  const [isDashboardDarkLoaded, setIsDashboardDarkLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("overview");
  const [videoProgress, setVideoProgress] = useState(0);

  const videoContainerRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const videoTagsScrollRef = useRef<HTMLDivElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  // Handle video load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => setIsVideoLoaded(true);

    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    video.addEventListener("canplay", handleLoad);
    video.addEventListener("loadeddata", handleLoad);

    return () => {
      video.removeEventListener("canplay", handleLoad);
      video.removeEventListener("loadeddata", handleLoad);
    };
  }, []);

  // Handle modal video switching
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video || !isVideoModalOpen) return;

    const activeVideo = videos.find((v) => v.id === activeVideoId);
    if (activeVideo) {
      if (video.src !== activeVideo.url) {
        video.src = activeVideo.url;
        video.load();
        setVideoProgress(0);
      }
      // Try to play when video is ready
      const handleCanPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay may fail, user can click play
          });
        }
      };
      video.addEventListener("canplay", handleCanPlay);
      // If already loaded, play immediately
      if (video.readyState >= 3) {
        handleCanPlay();
      }
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [activeVideoId, isVideoModalOpen]);

  // Track video progress
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video || !isVideoModalOpen) return;

    const updateProgress = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress);
      }
    };

    const handleTimeUpdate = () => updateProgress();
    const handleLoadedMetadata = () => {
      setVideoProgress(0);
      updateProgress();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [activeVideoId, isVideoModalOpen]);

  // Inject video modal styles
  useEffect(() => {
    if (!isVideoModalOpen) return;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      video::-webkit-media-controls-timeline,
      video::-webkit-media-controls-current-time-display,
      video::-webkit-media-controls-time-remaining-display,
      video::-webkit-media-controls-timeline-container,
      video::-webkit-media-controls-panel {
        display: none !important;
      }
      video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
    `;
    document.head.appendChild(style);
    styleSheetRef.current = style;

    return () => {
      if (styleSheetRef.current) {
        document.head.removeChild(styleSheetRef.current);
        styleSheetRef.current = null;
      }
    };
  }, [isVideoModalOpen]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-background relative min-h-screen overflow-visible lg:overflow-hidden">
        <div className="flex flex-col min-h-screen relative pt-32 pb-12 sm:py-32 md:pt-24 lg:pt-0 overflow-hidden">
          {/* Header content - centered on mobile, side-by-side on desktop */}
          <div className="flex-1 lg:flex-none flex flex-col justify-center md:justify-start md:pt-16 lg:pt-48 items-center space-y-8 lg:space-y-0 z-20 px-3 sm:px-4 lg:px-0 lg:max-w-[1400px] lg:mx-auto lg:w-full lg:mb-12 xl:mb-12 2xl:mb-12 3xl:mb-16">
            <div className="flex flex-col items-center w-full text-center space-y-6 lg:space-y-8">
              <div className="space-y-5 lg:space-y-6 max-w-3xl 3xl:max-w-5xl mx-auto px-2 lg:px-0">
                <Link
                  href="/updates/joining-ramp"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border text-xs font-sans text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  {t("openingOffer")}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <h1 className="font-serif text-3xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl 3xl:text-8xl leading-[1.1] tracking-tight text-foreground">
                  The business stack for{" "}
                  <em className="not-italic text-muted-foreground/80">
                    modern
                  </em>{" "}
                  founders
                </h1>

                <p className="text-muted-foreground text-base lg:text-lg leading-relaxed font-sans max-w-xl mx-auto">
                  Send invoices, automatic reconciliation, track billable hours,
                  get financial insights, and export clean books to your
                  accountant.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                <Button
                  render={
                    <a href="/login">
                    <span className="text-inherit text-sm">
                      Start your trial
                    </span>
                    </a>
                  }
                  className="btn-inverse h-11 px-6 transition-colors"
                />

                <p className="text-muted-foreground text-xs font-sans">
                  14-day free trial آ· Cancel anytime
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <div className="flex items-center gap-2.5">
                    <Link
                      aria-label={t("serviceCopy.sale.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#16a34a] transition-all duration-200"
                      href="/services/sale"
                    >
                      <House aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.rent.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#2563eb] transition-all duration-200"
                      href="/services/rent"
                    >
                      <KeyRound aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.investment.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#0d9488] transition-all duration-200"
                      href="/services/investment"
                    >
                      <TrendingUp aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.propertyManagement.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#7c3aed] transition-all duration-200"
                      href="/services/property-management"
                    >
                      <Building2 aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.propertyMarketing.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#ea580c] transition-all duration-200"
                      href="/services/property-marketing"
                    >
                      <Megaphone aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.propertyConsultation.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#0891b2] transition-all duration-200"
                      href="/services/property-consultation"
                    >
                      <MessageCircle aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.realEstateContracts.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#4f46e5] transition-all duration-200"
                      href="/services/real-estate-contracts"
                    >
                      <FileText aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.engineeringDesign.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#64748b] transition-all duration-200"
                      href="/services/engineering-design"
                    >
                      <DraftingCompass
                        aria-hidden
                        className="w-[18px] h-[18px]"
                      />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.contracting.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#b45309] transition-all duration-200"
                      href="/services/contracting"
                    >
                      <Handshake aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.tenders.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#dc2626] transition-all duration-200"
                      href="/services/tenders"
                    >
                      <ClipboardList
                        aria-hidden
                        className="w-[18px] h-[18px]"
                      />
                    </Link>
                    <Link
                      aria-label={t("serviceCopy.constructionFinishing.title")}
                      className="text-muted-foreground opacity-40 hover:opacity-100 hover:text-[#db2777] transition-all duration-200"
                      href="/services/construction-finishing"
                    >
                      <Hammer aria-hidden className="w-[18px] h-[18px]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video section */}
          <div
            className="mt-8 mb-8 md:mt-12 lg:mt-0 lg:mb-4 3xl:mb-20 overflow-visible lg:w-full"
            ref={videoContainerRef}
          >
            <div className="relative overflow-hidden">
              {/* Poster image with fade and blur effect */}
              <div
                className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out z-[1] ${
                  isVideoLoaded
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
                style={{
                  filter: isVideoLoaded ? "blur(0px)" : "blur(1px)",
                }}
              >
                <Image
                  src="https://cdn.midday.ai/video-poster-v2.jpg"
                  alt="AqarDesk dashboard preview"
                  fill
                  fetchPriority="high"
                  quality={50}
                  sizes="100vw"
                  className="object-cover transition-all duration-1000 ease-in-out"
                  style={{
                    filter: isPosterLoaded ? "blur(0px)" : "blur(12px)",
                    transform: isPosterLoaded ? "scale(1)" : "scale(1.05)",
                  }}
                  priority
                  onLoad={() => setIsPosterLoaded(true)}
                />
              </div>

              <video
                ref={videoRef}
                className={`w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[800px] xl:h-[900px] 3xl:h-[1000px] object-cover transition-opacity duration-1000 ease-in-out ${
                  isVideoLoaded ? "opacity-100" : "opacity-0"
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              >
                <source
                  src="https://cdn.midday.ai/videos/login-video.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Dashboard overlay - different styles for mobile vs desktop */}
              <div className="absolute inset-0 flex items-center justify-center p-0 lg:p-4 z-[2]">
                <div className="relative lg:static scale-[0.95] md:scale-100 lg:scale-100 lg:h-full lg:flex lg:flex-col lg:items-center lg:justify-center">
                  <Image
                    src="/images/dashboard-light.svg"
                    alt="Dashboard illustration"
                    width={1600}
                    height={1200}
                    className="w-full h-auto md:!scale-[0.85] lg:!scale-100 lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] dark:hidden lg:[transform:rotate(-2deg)_skewY(1deg)] lg:[filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
                    style={{
                      filter: isDashboardLightLoaded
                        ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                        : "blur(20px)",
                      transform: isDashboardLightLoaded
                        ? "scale(1)"
                        : "scale(1.02)",
                    }}
                    priority
                    fetchPriority="high"
                    onLoad={() => setIsDashboardLightLoaded(true)}
                  />
                  <Image
                    src="/images/dashboard-dark.svg"
                    alt="Dashboard illustration"
                    width={1600}
                    height={1200}
                    className="w-full h-auto md:!scale-[0.85] lg:!scale-100 lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] hidden dark:block lg:[transform:rotate(-2deg)_skewY(1deg)] lg:[filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
                    style={{
                      filter: isDashboardDarkLoaded
                        ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                        : "blur(20px)",
                      transform: isDashboardDarkLoaded
                        ? "scale(1)"
                        : "scale(1.02)",
                    }}
                    priority
                    fetchPriority="high"
                    onLoad={() => setIsDashboardDarkLoaded(true)}
                  />
                </div>
              </div>

              {/* Play Button Overlay */}
              <button
                type="button"
                onClick={() => {
                  setIsVideoModalOpen(true);
                  setActiveVideoId("overview");
                }}
                className={`hidden absolute inset-0 z-[4] flex items-center justify-center pointer-events-none transition-opacity duration-500 delay-300 ${
                  isDashboardLightLoaded || isDashboardDarkLoaded
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                aria-label="Play video"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-muted hover:bg-secondary hover:scale-105 flex items-center justify-center transition-all duration-200 pointer-events-auto">
                  <Icons.Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            className="fixed inset-0 bg-white/40 backdrop-blur-sm dark:bg-black/40 transition-opacity duration-200"
            onClick={() => setIsVideoModalOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              animation: "fadeIn 200ms ease-out",
            }}
          />
          <div
            className="relative bg-background border border-border max-w-4xl max-h-[90vh] overflow-hidden z-[10000] flex flex-col"
            style={{
              animation: "fadeIn 200ms ease-out 50ms both",
            }}
          >
            {/* Video Player - Center */}
            <div className="relative w-full aspect-video bg-background">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="hidden sm:block absolute top-4 end-4 z-10 backdrop-blur-md bg-background-semi-transparent p-2 transition-colors"
                aria-label="Close dialog"
              >
                <Icons.Close className="h-5 w-5 text-foreground" />
              </button>
              <video
                ref={modalVideoRef}
                className="w-full h-full"
                autoPlay
                playsInline
                loop
                muted
                controls
                controlsList="nodownload noplaybackrate"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              >
                <source
                  src={videos.find((v) => v.id === activeVideoId)?.url || ""}
                  type="video/mp4"
                />
              </video>
            </div>

            {/* Video List - Below Video */}
            <div className="relative w-full border-t border-border bg-background overflow-hidden">
              <div
                ref={videoTagsScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-px-5"
              >
                <div className="p-4 lg:p-6">
                  <div className="flex gap-4">
                    {videos.map((video, index) => (
                      <div key={video.id} className="flex items-stretch">
                        {index > 0 && <div className="w-px bg-border me-4" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            setActiveVideoId(video.id);
                            setVideoProgress(0);

                            const scrollContainer = videoTagsScrollRef.current;
                            if (!scrollContainer) return;

                            const containerRect =
                              scrollContainer.getBoundingClientRect();
                            const adjacentVideos = [
                              scrollContainer.querySelector<HTMLElement>(
                                `[data-video-index="${index + 1}"]`,
                              ),
                              scrollContainer.querySelector<HTMLElement>(
                                `[data-video-index="${index - 1}"]`,
                              ),
                            ];
                            const adjacentVideo = adjacentVideos.find((tag) => {
                              if (!tag) return false;
                              const rect = tag.getBoundingClientRect();
                              return (
                                rect.left < containerRect.left + 20 ||
                                rect.right > containerRect.right - 20
                              );
                            });

                            adjacentVideo?.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                              inline: "nearest",
                            });
                          }}
                          data-video-index={index}
                          className={`w-[100px] sm:w-[140px] md:w-[310px] flex-shrink-0 pt-1 pb-3 md:pt-2 md:pb-5 transition-colors flex flex-col items-start gap-1 md:gap-2 text-start relative bg-background text-muted-foreground hover:text-foreground ${index > 0 ? "ps-2" : ""}`}
                        >
                          <span
                            className={`font-sans text-sm md:text-base leading-tight text-start ${activeVideoId === video.id ? "text-primary" : ""}`}
                          >
                            {video.title}
                          </span>
                          {video.subtitle && (
                            <span className="hidden md:block font-sans text-xs text-muted-foreground leading-tight text-start">
                              {video.subtitle}
                            </span>
                          )}
                          {activeVideoId === video.id && (
                            <div
                              className="absolute bottom-0 start-0 h-0.5 bg-primary transition-all duration-150"
                              style={{ width: `${videoProgress}%` }}
                            />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Gradient fade-out on the right */}
              <div
                className="marketing-inline-end-gradient absolute top-0 end-0 bottom-0 w-24 pointer-events-none z-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto">
        <div className="h-px w-full border-t border-border" />
      </div>

      {/* Features Overview Section */}
      <FeaturesGridSection />

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto">
        <div className="h-px w-full border-t border-border" />
      </div>

      {/* Time Savings Bento Grid Section */}
      <TimeSavingsSection />

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto">
        <div className="h-px w-full border-t border-border" />
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto">
        <div className="h-px w-full border-t border-border" />
      </div>

    </div>
  );
}
