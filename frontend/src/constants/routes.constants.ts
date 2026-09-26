export const APP_ROUTES = {
  DASHBOARD: "dashboard",
  SIMULATOR: "simulator",
  RULES: "rules",
  AUDIT: "audit",
  COMPENHACK: "compenhack",
} as const;

export type AppTab = typeof APP_ROUTES[keyof typeof APP_ROUTES];
