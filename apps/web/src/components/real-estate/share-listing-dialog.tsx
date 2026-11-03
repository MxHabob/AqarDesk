"use client"

import { Button } from "@aqardesk/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@aqardesk/ui/components/dialog"
import { Input } from "@aqardesk/ui/components/input"
import { Textarea } from "@aqardesk/ui/components/textarea"
import { useToast } from "@aqardesk/ui/use-toast"
import { Briefcase, Check, Copy, Mail, QrCode, Share2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useId, useState } from "react"
import { SiFacebook, SiTelegram, SiWhatsapp, SiX } from "react-icons/si"
import { createListingShareLink } from "@/actions/real-estate"
import { useCurrentLocale, useI18n } from "@/locales/client"

export type ShareableListing = {
  id: string
  title: string
  listingType: "sale" | "rent"
}

function getSocialShareUrl(
  network: "whatsapp" | "facebook" | "telegram" | "x" | "linkedin" | "email",
  url: string,
  title: string,
  message: string
) {
  if (network === "whatsapp") {
    return `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`
  }

  if (network === "facebook") {
    const params = new URLSearchParams({ u: url, quote: message })
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
  }

  if (network === "telegram") {
    const params = new URLSearchParams({ url, text: message })
    return `https://t.me/share/url?${params.toString()}`
  }

  if (network === "x") {
    const params = new URLSearchParams({ text: message, url })
    return `https://x.com/intent/post?${params.toString()}`
  }

  if (network === "linkedin") {
    const params = new URLSearchParams({ url })
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
  }

  const params = new URLSearchParams({
    subject: title,
    body: `${message}\n${url}`,
  })
  return `mailto:?${params.toString()}`
}

export function ShareListingDialog({
  listings,
  initialListingId,
  className,
  useShortLink = true,
}: {
  listings: ShareableListing[]
  initialListingId?: string
  className?: string
  useShortLink?: boolean
}) {
  const t = useI18n()
  const locale = useCurrentLocale()
  const { toast } = useToast()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(
    initialListingId ?? listings[0]?.id ?? ""
  )
  const [message, setMessage] = useState("")
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [supportsNativeShare, setSupportsNativeShare] = useState(false)
  const [isPreparingLink, setIsPreparingLink] = useState(false)
  const [shortLinks, setShortLinks] = useState<
    Record<string, { path: string; expiresAt: string }>
  >({})
  const [sharePath, setSharePath] = useState("")
  const selectedListing =
    listings.find((listing) => listing.id === selectedId) ?? listings[0]
  const shareUrl =
    sharePath && origin ? new URL(sharePath, origin).toString() : ""
  const direction = locale === "ar" ? "rtl" : "ltr"
  const listingTypeLabel = (listing: ShareableListing) =>
    listing.listingType === "sale" ? t("sharing.forSale") : t("sharing.forRent")
  const socialLinks = selectedListing
    ? [
        {
          name: "whatsapp" as const,
          label: t("sharing.whatsapp"),
          icon: SiWhatsapp,
          className: "text-[#128c7e]",
        },
        {
          name: "facebook" as const,
          label: t("sharing.facebook"),
          icon: SiFacebook,
          className: "text-[#1877f2]",
        },
        {
          name: "telegram" as const,
          label: t("sharing.telegram"),
          icon: SiTelegram,
          className: "text-[#229ed9]",
        },
        {
          name: "x" as const,
          label: t("sharing.x"),
          icon: SiX,
          className: "text-foreground",
        },
        {
          name: "linkedin" as const,
          label: t("sharing.linkedin"),
          icon: Briefcase,
          className: "text-[#0a66c2]",
        },
        {
          name: "email" as const,
          label: t("sharing.email"),
          icon: Mail,
          className: "text-muted-foreground",
        },
      ]
    : []

  async function getSharePath(listing: ShareableListing) {
    if (!useShortLink) return `/listings/${listing.id}`

    const cached = shortLinks[listing.id]
    if (cached && new Date(cached.expiresAt).getTime() > Date.now()) {
      return cached.path
    }

    const { token, expiresAt } = await createListingShareLink(listing.id)
    const path = `/s/${token}`
    setShortLinks((current) => ({
      ...current,
      [listing.id]: { path, expiresAt: expiresAt.toISOString() },
    }))
    return path
  }

  async function openDialog() {
    const listing =
      listings.find((item) => item.id === initialListingId) ?? listings[0]
    if (!listing) return
    setIsPreparingLink(true)
    setSelectedId(listing.id)
    setMessage(`${t("sharing.defaultMessage")} ${listing.title}`)
    setOrigin(window.location.origin)
    setSupportsNativeShare(typeof navigator.share === "function")
    setCopied(false)
    setShowQr(false)
    try {
      setSharePath(await getSharePath(listing))
      setOpen(true)
    } catch {
      toast({ type: "error", title: t("sharing.linkCreateFailed") })
    } finally {
      setIsPreparingLink(false)
    }
  }

  async function selectListing(listing: ShareableListing) {
    setIsPreparingLink(true)
    setSelectedId(listing.id)
    setMessage(`${t("sharing.defaultMessage")} ${listing.title}`)
    setCopied(false)
    setShowQr(false)
    setSharePath("")
    try {
      setSharePath(await getSharePath(listing))
    } catch {
      toast({ type: "error", title: t("sharing.linkCreateFailed") })
    } finally {
      setIsPreparingLink(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({ type: "success", title: t("sharing.copied") })
    } catch {
      toast({
        type: "error",
        title: t("sharing.copyFailed"),
      })
    }
  }

  async function shareWithDevice() {
    if (!selectedListing || !shareUrl) return
    if (typeof navigator.share !== "function") {
      await copyLink()
      return
    }

    try {
      await navigator.share({
        title: selectedListing.title,
        text: message,
        url: shareUrl,
      })
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      toast({ type: "error", title: t("sharing.shareFailed") })
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        disabled={listings.length === 0 || isPreparingLink}
        aria-busy={isPreparingLink}
        title={listings.length === 0 ? t("sharing.noLiveListings") : undefined}
        aria-label={
          listings.length === 0
            ? t("sharing.noLiveListings")
            : t("sharing.share")
        }
        onClick={openDialog}
      >
        <Share2 aria-hidden className="size-4" />
        {t("sharing.share")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[min(90dvh,760px)] max-w-lg gap-0 overflow-y-auto p-0"
          closeLabel={t("common.close")}
        >
          <div className="space-y-5 p-5 sm:p-6">
            <header className="space-y-2 pe-8">
              <DialogTitle className="text-base font-medium text-foreground">
                {t("sharing.title")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                {t("sharing.description")}
              </DialogDescription>
            </header>

            {listings.length > 1 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  {t("sharing.selectListing")}
                </legend>
                <div className="grid gap-2">
                  {listings.map((listing) => (
                    <label
                      key={listing.id}
                      className="flex cursor-pointer items-start gap-3 border border-border px-3 py-2.5 has-[:checked]:border-foreground"
                    >
                      <input
                        type="radio"
                        name={`${formId}-listing`}
                        value={listing.id}
                        checked={selectedListing?.id === listing.id}
                        disabled={isPreparingLink}
                        onChange={() => selectListing(listing)}
                        className="mt-1 accent-foreground"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {listing.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {listingTypeLabel(listing)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="space-y-2">
              <label htmlFor={`${formId}-url`} className="text-sm font-medium">
                {t("sharing.linkLabel")}
              </label>
              <div className="flex gap-2">
                <Input
                  id={`${formId}-url`}
                  readOnly
                  value={shareUrl}
                  dir="ltr"
                  className="min-w-0 text-start"
                  aria-label={t("sharing.linkLabel")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!shareUrl}
                  aria-label={
                    copied ? t("sharing.copied") : t("sharing.copyLink")
                  }
                  title={copied ? t("sharing.copied") : t("sharing.copyLink")}
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check aria-hidden className="size-4" />
                  ) : (
                    <Copy aria-hidden className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`${formId}-message`}
                className="text-sm font-medium"
              >
                {t("sharing.messageLabel")}
              </label>
              <Textarea
                id={`${formId}-message`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                dir={direction}
                rows={3}
                maxLength={500}
                className="min-h-20 resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {socialLinks.map(
                ({ name, label, icon: Icon, className: color }) => (
                  <a
                    key={name}
                    href={
                      shareUrl
                        ? getSocialShareUrl(
                            name,
                            shareUrl,
                            selectedListing?.title ?? "",
                            message
                          )
                        : undefined
                    }
                    target={name === "email" ? undefined : "_blank"}
                    rel={name === "email" ? undefined : "noopener noreferrer"}
                    aria-disabled={!shareUrl}
                    tabIndex={!shareUrl ? -1 : undefined}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-border px-3 text-sm transition-colors hover:bg-accent aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  >
                    <Icon aria-hidden className={`size-4 ${color}`} />
                    {label}
                  </a>
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!shareUrl}
                onClick={shareWithDevice}
              >
                <Share2 aria-hidden className="size-4" />
                {supportsNativeShare
                  ? t("sharing.moreApps")
                  : t("sharing.copyLink")}
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!shareUrl}
                onClick={() => setShowQr((value) => !value)}
              >
                <QrCode aria-hidden className="size-4" />
                {showQr ? t("sharing.hideQr") : t("sharing.showQr")}
              </Button>
              {showQr && shareUrl && (
                <div className="mt-3 flex flex-col items-center gap-2 border border-border bg-background p-4 text-center">
                  <QRCodeSVG
                    value={shareUrl}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    level="M"
                    title={t("sharing.qrDescription")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("sharing.qrDescription")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
