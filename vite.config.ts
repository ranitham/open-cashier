import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";
import webmanifest from "./src/manifest.json";
import UnoCSS from "@unocss/vite";
import presetWebFonts from "@unocss/preset-web-fonts";
import presetUno from "@unocss/preset-uno";

export default {
  base: "./",
  plugins: [
    eslint(),
    UnoCSS({
      presets: [
        presetUno(),
        presetWebFonts({
          provider: "google", // default provider
          fonts: {
            lato: [
              {
                name: "Lato",
                weights: ["400", "700"],
                italic: true,
              },
              {
                name: "sans-serif",
                provider: "none",
              },
            ],
          },
        }),
      ],
      theme: {
        colors: {
          primary: "#b4d7bc", // class="bg-primary"
          secondary: "#c0dfd9",
          tertiary: "#a34653",
          error: "#a34653",
          warning: "#F9C04E",
          offWhite: "#f4f4f4",
          richDark: {
            600: "#2f2a2a",
            700: "#242222",
            800: "1b1919",
            900: "#121111",
          },
          dark: "#3b3a36",
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: webmanifest,
    }),
  ],
};
