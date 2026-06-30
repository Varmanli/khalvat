import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "خلوت",
    short_name: "خلوت",
    description:
      "خلوت یک دفتر دیجیتال شخصی و بولت ژورنال آنلاین برای ثبت نوشته‌ها، ایده‌ها، وظایف، شکرگزاری، عادت‌ها، یادآورها و شعر روز است.",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f4",
    theme_color: "#8a5a44",
    icons: [
      {
        src: "/faveicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/faveicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
