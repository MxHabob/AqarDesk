"use client"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@aqardesk/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
  ChevronLeft,
  ChevronRight,
  Images,
  Pause,
  Play,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import Image from "next/image"
import {
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type WheelEvent,
} from "react"
import listingImageLoader from "@/lib/listings/image-loader"

export type ListingPhoto = {
  url: string
  altText: string | null
}

type Props = {
  photos: ListingPhoto[]
  title: string
  noImageLabel: string
  zoomLabel: string
  zoomInLabel: string
  zoomOutLabel: string
  previousLabel: string
  nextLabel: string
  imagePositionLabel: string
  playSlideshowLabel: string
  pauseSlideshowLabel: string
  presentation?: "sheet" | "detail"
}

export function ListingPhotoCarousel({
  photos,
  title,
  noImageLabel,
  zoomLabel,
  zoomInLabel,
  zoomOutLabel,
  previousLabel,
  nextLabel,
  imagePositionLabel,
  playSlideshowLabel,
  pauseSlideshowLabel,
  presentation = "sheet",
}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoplayPlaying, setIsAutoplayPlaying] = useState(false)
  const [loadedPhotos, setLoadedPhotos] = useState<Record<string, boolean>>({})
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 })
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 6000,
        playOnInit: false,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    []
  )
  const carouselPlugins = useMemo(() => [autoplayPlugin], [autoplayPlugin])
  const onApiChange = useCallback((nextApi: CarouselApi) => {
    setApi(nextApi)
  }, [])

  useEffect(() => {
    if (!api) return

    const updateIndex = () => setActiveIndex(api.selectedScrollSnap())
    updateIndex()
    api.on("select", updateIndex)
    api.on("reInit", updateIndex)

    return () => {
      api.off("select", updateIndex)
      api.off("reInit", updateIndex)
    }
  }, [api])

  useEffect(() => {
    if (!api || presentation !== "detail") return

    const autoplay = api.plugins().autoplay
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePlaying = () => setIsAutoplayPlaying(autoplay.isPlaying())
    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        autoplay.stop()
      } else {
        autoplay.play()
      }
      updatePlaying()
    }

    api.on("autoplay:play", updatePlaying)
    api.on("autoplay:stop", updatePlaying)
    handleMotionPreference()
    reducedMotion.addEventListener("change", handleMotionPreference)

    return () => {
      reducedMotion.removeEventListener("change", handleMotionPreference)
      api.off("autoplay:play", updatePlaying)
      api.off("autoplay:stop", updatePlaying)
      autoplay.stop()
    }
  }, [api, presentation])

  const activePhoto = photos[activeIndex]

  useEffect(() => {
    if (!activePhoto?.url) return
    setImageZoom(1)
    setImagePan({ x: 0, y: 0 })
    setIsPanning(false)
  }, [activePhoto?.url])

  const changeImageZoom = (value: number) => {
    const nextZoom = Math.min(4, Math.max(0.5, value))
    setImageZoom(nextZoom)
    if (nextZoom <= 1) setImagePan({ x: 0, y: 0 })
  }

  const handleImageWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    changeImageZoom(imageZoom + (event.deltaY < 0 ? 0.25 : -0.25))
  }

  const startImagePan = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || imageZoom <= 1) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsPanning(true)
    setPanStart({ x: event.clientX, y: event.clientY })
    setPanOrigin(imagePan)
  }

  const moveImagePan = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return
    setImagePan({
      x: panOrigin.x + event.clientX - panStart.x,
      y: panOrigin.y + event.clientY - panStart.y,
    })
  }

  return (
    <div
      className={
        presentation === "sheet"
          ? "relative -mx-6 -mt-6 border-b border-border bg-muted"
          : "relative w-full overflow-hidden border border-border bg-muted"
      }
    >
      {photos.length > 0 ? (
        <Carousel
          opts={{ loop: photos.length > 1 }}
          plugins={carouselPlugins}
          setApi={onApiChange}
          className="group"
        >
          <CarouselContent className="ms-0">
            {photos.map((photo, index) => (
              <CarouselItem key={photo.url} className="ps-0">
                <div
                  className={`relative w-full ${
                    presentation === "sheet"
                      ? "h-[min(48dvh,360px)] min-h-48 sm:h-[320px]"
                      : "h-[min(60dvh,640px)] min-h-60"
                  }`}
                >
                  <div
                    className={`absolute inset-0 overflow-hidden ${
                      isPanning
                        ? "cursor-grabbing"
                        : imageZoom > 1
                          ? "cursor-grab"
                          : ""
                    }`}
                    style={{
                      touchAction: imageZoom > 1 ? "none" : "pan-y",
                    }}
                    onWheel={handleImageWheel}
                    onPointerDown={startImagePan}
                    onPointerMove={moveImagePan}
                    onPointerUp={() => setIsPanning(false)}
                    onPointerCancel={() => setIsPanning(false)}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText || title}
                      fill
                      loader={listingImageLoader}
                      sizes="(max-width: 640px) 100vw, 520px"
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                      onLoad={() =>
                        setLoadedPhotos((loaded) => ({
                          ...loaded,
                          [photo.url]: true,
                        }))
                      }
                      className={`select-none object-cover transition-[opacity,transform] duration-200 ${
                        loadedPhotos[photo.url] ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        transform: `translate(${imagePan.x}px, ${imagePan.y}px) scale(${imageZoom})`,
                      }}
                    />
                    {!loadedPhotos[photo.url] && (
                      <div
                        aria-hidden
                        className="absolute inset-0 animate-pulse bg-muted"
                      />
                    )}
                  </div>
                  <fieldset
                    aria-label={zoomLabel}
                    className="absolute bottom-3 end-3 z-10 inline-flex min-w-0 items-center gap-0.5 border border-border bg-background/90 p-0.5 text-foreground shadow-sm backdrop-blur-md"
                  >
                    <button
                      type="button"
                      aria-label={zoomOutLabel}
                      onClick={() => changeImageZoom(imageZoom - 0.25)}
                      disabled={imageZoom <= 0.5}
                      className="inline-flex size-8 items-center justify-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    >
                      <ZoomOut aria-hidden className="size-3.5" />
                    </button>
                    <span className="min-w-9 text-center text-[11px] tabular-nums text-muted-foreground">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      aria-label={zoomInLabel}
                      onClick={() => changeImageZoom(imageZoom + 0.25)}
                      disabled={imageZoom >= 4}
                      className="inline-flex size-8 items-center justify-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    >
                      <ZoomIn aria-hidden className="size-3.5" />
                    </button>
                  </fieldset>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {photos.length > 1 && (
            <>
              {presentation === "detail" && (
                <button
                  type="button"
                  aria-label={
                    isAutoplayPlaying ? pauseSlideshowLabel : playSlideshowLabel
                  }
                  onClick={() => {
                    if (autoplayPlugin.isPlaying()) {
                      autoplayPlugin.stop()
                    } else if (
                      !window.matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                    ) {
                      autoplayPlugin.play()
                    }
                    setIsAutoplayPlaying(autoplayPlugin.isPlaying())
                  }}
                  className="absolute end-3 top-3 z-10 inline-flex size-8 items-center justify-center border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isAutoplayPlaying ? (
                    <Pause aria-hidden className="size-3.5" />
                  ) : (
                    <Play aria-hidden className="size-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                aria-label={previousLabel}
                onClick={() => api?.scrollPrev()}
                className="absolute start-3 top-1/2 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
              </button>
              <button
                type="button"
                aria-label={nextLabel}
                onClick={() => api?.scrollNext()}
                className="absolute end-3 top-1/2 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
              </button>
              <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 border border-border bg-background/90 px-2 py-1 shadow-sm backdrop-blur-md">
                  <Images
                    aria-hidden
                    className="size-3 text-muted-foreground"
                  />
                  <span className="text-[11px] tabular-nums text-foreground">
                    {imagePositionLabel} {activeIndex + 1} / {photos.length}
                  </span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex h-0.5">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo.url}-dot`}
                    type="button"
                    aria-label={`${imagePositionLabel} ${index + 1} / ${photos.length}`}
                    aria-current={index === activeIndex}
                    onClick={() => api?.scrollTo(index)}
                    className="group/dot flex min-w-0 flex-1 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className={`h-0.5 w-full transition-colors ${
                        index === activeIndex
                          ? "bg-primary"
                          : "bg-foreground/15 group-hover/dot:bg-foreground/35"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </Carousel>
      ) : (
        <div
          className={`flex w-full flex-col items-center justify-center gap-2 text-muted-foreground ${
            presentation === "sheet"
              ? "h-[min(48dvh,360px)] min-h-48"
              : "h-[min(60dvh,640px)] min-h-60"
          }`}
        >
          <Images aria-hidden className="size-10" />
          <span className="text-sm">{noImageLabel}</span>
        </div>
      )}
    </div>
  )
}
