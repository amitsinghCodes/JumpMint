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
  contactEmail: "vasusr76@gmail.com",

  // ---------------------------------------------------------------------
  // Games & Apps
  // status: "released" | "testing" | "development"
  // screenshots: list of image paths, e.g. ["brand/rally-1.jpg"]
  //   (portrait or landscape both work; the first one is shown large)
  // playStoreUrl: full Google Play link, or "" until the app is public
  // ---------------------------------------------------------------------
  apps: [
    {
      name: "Quantum Hop",
      description:
        "A puzzle platformer where a glowing particle splits into two quantum states, observes to collapse them, and tunnels through barriers. 50 levels across five worlds, from Quantum Beginnings to the Entangled Void, each with its own scenery and music. Find the hidden Core in every level and unlock one of 56 short, accurate quantum-physics facts. Plays offline, with no ads.",
      status: "testing",
      screenshots: [
        "brand/quantum-hop-2.jpg",
        "brand/quantum-hop-1.jpg",
        "brand/quantum-hop-3.jpg",
        "brand/quantum-hop-4.jpg"
      ],
      // Optional numbers shown under the description; they count up on scroll.
      stats: [
        { value: 50, label: "levels" },
        { value: 5, label: "worlds" },
        { value: 56, label: "quantum facts" }
      ],
      playStoreUrl: ""
    },
    {
      // Working title; the name may change before release.
      name: "Haul & Harvest",
      description:
        "Build a working transport company in Alder Vale. Collect stone, timber and grain, make goods in Depot Town, and deliver what your neighbours need. Two trucks, 45 story jobs and ten chapters connect the valley, from the first loading bench to the Alder crossing. A standalone Android game in development.",
      status: "development",
      screenshots: ["brand/haul-vale.jpg", "brand/haul-town.jpg"],
      stats: [{ value: 45, label: "story jobs" }, { value: 10, label: "chapters" }],
      playStoreUrl: ""
    },
    {
      name: "Nakshaa (नक्शा)",
      description:
        "Learn India's 28 states and 8 union territories on the official map. Tap the named state, match capitals, race your own ghost, guess the daily mystery state from its silhouette, and paint the map with family in pass-the-phone mode. English and Hindi, fully offline, no ads.",
      status: "development",
      screenshots: [],
      stats: [
        { value: 36, label: "states & UTs" },
        { value: 9, label: "game modes" },
        { value: 2, label: "languages" }
      ],
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
