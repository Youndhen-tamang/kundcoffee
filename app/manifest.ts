import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bodhiberry POS",
    short_name: "Bodhiberry",
    description: "Premium Restaurant & Cafe POS System in Kathmandu",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/Logo.jpeg",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
