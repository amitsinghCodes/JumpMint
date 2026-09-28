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
      playStoreUrl: ""
    },
    {
      // Working title; the name may change before release.
      name: "Alder Lake",
      description:
        "Run a highway hauling company. Send trucks from your depot to quarries, farms and factories, turn raw goods into steel, fuel and planks, and fill city contracts. Build new road segments to open six regions, from Harbor Gate to Airport Link. When a truck reaches a toll plaza, take control of the traffic in a quick puzzle to cut its trip time.",
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
