import { ImageResponse } from "next/og"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedTitle = searchParams.get("title")?.slice(0, 140) ?? ""
  const requestedDescription =
    searchParams.get("description")?.slice(0, 220) ?? ""
  const title = /^[\x20-\x7e]*$/.test(requestedTitle)
    ? requestedTitle || "AqarDesk"
    : "AqarDesk"
  const description = /^[\x20-\x7e]*$/.test(requestedDescription)
    ? requestedDescription || "Real estate, managed with clarity."
    : "Real estate, managed with clarity."

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f7f7f5",
        padding: "64px",
        color: "#171717",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            backgroundColor: "#171717",
          }}
        />
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 1 }}>
          AQARDESK
        </span>
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 1000,
          flexDirection: "column",
          gap: 20,
        }}
      >
        <span style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.15 }}>
          {title}
        </span>
        <span style={{ color: "#686868", fontSize: 28, lineHeight: 1.4 }}>
          {description}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 1,
          backgroundColor: "#dededb",
        }}
      />
    </div>,
    { width: 1200, height: 630 }
  )
}
