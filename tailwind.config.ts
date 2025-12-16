import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        card: "var(--bg-card)",
        muted: "var(--text-muted)",
        accent: "var(--text-accent)",
        border: "var(--border-primary)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        muted: "var(--text-muted)",
        inverse: "var(--text-inverse)",
      },
      borderColor: {
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
        accent: "var(--border-accent)",
        inverted: "var(--border-inverted)",
      },
      inputColor: {
        bg: "var(--input-bg)",
        border: "var(--input-border)",
        placeholder: "var(--input-placeholder)",
        focusBorder: "var(--input-focus-border)",
        focusRing: "var(--input-focus-ring)",
      },
      statusColor: {
        success: "var(--status-success)",
        danger: "var(--status-danger)",
        warning: "var(--status-warning)",
        info: "var(--status-info)",
      },
      shadowColor: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      hoverColor: {
        bgPrimary: "var(--hover-bg-primary)",
        bgSecondary: "var(--hover-bg-secondary)",
        textPrimary: "var(--hover-text-primary)",
        borderPrimary: "var(--hover-border-primary)",
      },
    },
  },
  plugins: [],
};

export default config;
