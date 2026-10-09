/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2E7D32",
          greenLight: "#43A047",
          greenMuted: "#E8F5E9",
        },
        water: {
          blue: "#1565C0",
          blueLight: "#42A5F5",
          blueMuted: "#E3F2FD",
        },
        charcoal: "#1C1C1E",
        muted: "#6B7280",
        surface: "#F8FAFB",
        border: "#E5E7EB",
      },
    },
  },
  plugins: [],
}
