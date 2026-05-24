/**
 * Application configuration
 * Centralized settings for the TCSS 460 demo application
 */

export const APP_CONFIG = {
  course: {
    code: "TCSS 460",
    name: "Client/Server Programming for Internet Applications",
    semester: "Spring 2026",
    university: "UW Tacoma",
    school: "School of Engineering and Technology",
  },

  app: {
    title: "IMDBv0",
    description: "Explore popular movies and TV shows",
  },

  routes: {
    home: "/",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
