import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "خلوت",
    short_name: "خلوت",
    description: "فضایی آرام برای عادت‌ها، نوشته‌ها، وظایف و حال روزانه",
    lang: "fa",
    dir: "rtl",
    // Launch the private workspace directly. Unauthenticated launches are
    // safely redirected to login by the proxy.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F1E8",
    theme_color: "#8A5A44",
    categories: ["productivity", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
