import type { ThemeMode } from "@/lib/types";

const lightTokens = {
  paper: "#FDFAF4",
  cream: "#F2EDE0",
  ink: "#1A1814",
  inkMuted: "#6B6457",
  inkFaint: "#B5AB9C",
  stamp: "#B8922A",
  stampLight: "#F5E8C8",
  danger: "#9B3A3A",
} as const;

const darkTokens = {
  paper: "#1C1A16",
  cream: "#110F0C",
  ink: "#EDE8DE",
  inkMuted: "#8C8070",
  inkFaint: "#6E665B",
  stamp: "#B8922A",
  stampLight: "#F5E8C8",
  danger: "#C46A6A",
} as const;

export function resolveTokens(theme: ThemeMode = "light") {
  return theme === "dark" ? darkTokens : lightTokens;
}
