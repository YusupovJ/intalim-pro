import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Intalim Pro — Билеты ПДД",
    short_name: "Intalim Pro",
    description: "Тренировка билетов ПДД Узбекистан",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    lang: "ru",
    dir: "ltr",
    categories: ["education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
