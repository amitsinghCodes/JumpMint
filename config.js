/*
 * JumpMint site content
 * ---------------------
 * Edit this file to change what the website shows. You do not need to touch
 * any other file for everyday updates.
 *
 * Rules:
 *  - Leave a URL as "" (empty) if you don't have it yet. The site hides any
 *    button or link whose URL is empty, so visitors never see a dead link.
 *  - Keep the quotes and commas. After saving, reload the page to check.
 *  - The contact email is ALSO written in privacy-policy.html (that page
 *    works without JavaScript). Update it in both places.
 */
window.JUMPMINT_CONFIG = {
  brand: {
    name: "JumpMint",
    tagline: "Small Jumps. Big Adventures.",
    intro: "Gaming, Android apps, and ideas in motion.",
    // Path to your logo, e.g. "brand/logo.svg" or "brand/logo.png".
    // Leave "" to use the text wordmark.
    logo: ""
  },

  // Email shown in the footer and used for contact links.
  contactEmail: "",

  // ---------------------------------------------------------------------
  // Games & Apps
  // status: "released" | "testing" | "development"
  // screenshots: list of image paths, e.g. ["brand/rally-1.jpg"]
  //   (portrait or landscape both work; the first one is shown large)
  // playStoreUrl: full Google Play link, or "" until the app is public
  // ---------------------------------------------------------------------
  apps: [
    {
      // Rename to your game's real store name.
      name: "Physics Platformer",
      description:
        "A physics platformer with 50 levels across five worlds. Collect quanta, find the secret core hidden off the path in every level, and unlock a new science fact each time.",
      status: "testing",
      screenshots: [],
      playStoreUrl: ""
    },
    {
      name: "JumpMint Rally",
      description:
        "An offline rally game built for touch controls. Gravel forest stages, medal target times, and races against AI drivers.",
      status: "development",
      screenshots: [],
      playStoreUrl: ""
    }
  ],

  // ---------------------------------------------------------------------
  // YouTube
  // channelUrl: e.g. "https://www.youtube.com/@yourchannel"
  // videos: list of { title, url } using normal YouTube links, e.g.
  //   { title: "Rally stage 1 blind run", url: "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
  // Videos load only after a visitor presses play.
  // ---------------------------------------------------------------------
  youtube: {
    channelUrl: "",
    videos: []
  },

  // ---------------------------------------------------------------------
  // Social links shown in the footer. Empty ones are hidden.
  // ---------------------------------------------------------------------
  social: {
    youtube: "",
    instagram: "",
    x: "",
    discord: "",
    github: ""
  }
};
