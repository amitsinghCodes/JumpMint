# JumpMint website

The JumpMint studio site: a 3D ribbon hero, Games & Apps, Watch, About, and a
Google Play–ready privacy policy.

It is a plain static site (HTML, CSS, JavaScript, with three.js loaded from a
CDN). There is no build step and no Node.js requirement, so you can publish it
to GitHub Pages by uploading the files.

## Files

```
index.html            main page
privacy-policy.html   privacy policy (works without JavaScript)
config.js             ALL editable content: apps, videos, links, email
assets/site.css       styles
assets/site.js        renders content from config.js, loads the 3D scene lazily
assets/motion.js      site motion: hero intro, scroll reveals, progress bar,
                      parallax, marquee, magnetic buttons, card tilt, counters,
                      and the "Motion on/off" switch (remembered per browser)
assets/hero3d.js      the 3D ribbon sculpture
brand/mark.svg        favicon and small logo
brand/ribbon.svg      symbol shown while the 3D scene loads, or if it can't run
brand/apple-touch-icon.png
og-image.png          1200×630 social preview image
```

## Run it locally

The site works when you double-click `index.html`, but a local server is closer
to how it runs online. From this folder:

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Before you publish (required)

1. **Email in the privacy policy.** In `privacy-policy.html`, replace
   `your-email@example.com` (it appears twice on one line) with your real
   email, the same one as your Play Console contact email.
2. **Email in `config.js`.** Set `contactEmail` to the same address so it
   shows in the footer.
3. **Game names.** `config.js` lists Quantum Hop (in testing) and Alder Lake
   (a working title, in development). Update them if a store name changes.
4. **Check the privacy policy is true for your apps.** It states there are no
   ads, analytics, accounts, or automatic data sending, and that crash reports
   are sent only if the player chooses to email one. If an app ever adds
   Firebase, ads, or online features, update the policy first.

## Edit content

Everything visible that changes over time lives in `config.js`. Empty values
(`""`) are hidden automatically, so there are never dead buttons.

### Add or update an app

Add an entry to `apps`:

```js
{
  name: "JumpMint Rally",
  description: "One or two sentences about the game.",
  status: "released",            // "released", "testing" or "development"
  screenshots: ["brand/rally-1.jpg", "brand/rally-2.jpg"],
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.jumpmint.rally"
}
```

Put screenshot files in `brand/` (JPG or PNG, around 1280 px wide is plenty).
The first screenshot is shown large; the rest appear as thumbnails. The Google
Play button appears only when `playStoreUrl` is filled in.

### Add YouTube videos

```js
youtube: {
  channelUrl: "https://www.youtube.com/@yourchannel",
  videos: [
    { title: "Rally stage 1, first try", url: "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
  ]
}
```

Normal watch links, `youtu.be` links and Shorts links all work. Only the
thumbnail loads with the page; the YouTube player loads when someone presses
play, using YouTube's privacy-enhanced domain.

### Social links

Fill in any of `youtube`, `instagram`, `x`, `discord`, `github` under `social`.

## Replace the branding

- **Logo:** put your logo in `brand/` (SVG or transparent PNG) and set
  `brand.logo` in `config.js`, e.g. `"brand/logo.svg"`. It replaces the
  navigation wordmark and the loading/fallback symbol.
- **Favicon:** replace `brand/mark.svg` and `brand/apple-touch-icon.png`
  (180×180).
- **Social preview:** replace `og-image.png` (1200×630). After publishing,
  change the `og:image` line in `index.html` to the full address, for example
  `https://yourname.github.io/og-image.png`. Some sites ignore relative paths.
- **Colours:** the brand colours are at the top of `assets/site.css`
  (`--bg`, `--mint`, `--text`, `--muted`).

## Publish on GitHub Pages

1. Create a GitHub repository. Name it `yourusername.github.io` for the address
   `https://yourusername.github.io`, or any name (for example `jumpmint`) for
   `https://yourusername.github.io/jumpmint`.
2. On the repository page, choose **Add file → Upload files** and drag in
   everything inside this folder, keeping the `assets` and `brand` folders.
   Commit.
3. Open **Settings → Pages**. Under **Build and deployment**, choose
   **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute or two, open your address. The privacy policy is at the same
   address plus `/privacy-policy.html`. Paste that URL into Play Console →
   **App content → Privacy policy**.

All links in the site are relative, so it works from either kind of address.
The empty `.nojekyll` file is optional; it just tells GitHub to serve the files
as they are.

## How the 3D hero behaves

- The headline and buttons are plain HTML and show immediately. three.js and
  the scene load after the page, only when the hero is on screen.
- Intro: the ribbon rises, crouches, jumps, lands with a squash, and settles
  (about 2 seconds). **Replay jump** plays it again. **Pause motion** stops the
  idle floating.
- On desktop the sculpture tilts gently toward the mouse. On touch devices
  there are no touch handlers on the scene, so scrolling is never blocked.
- Rendering stops when the hero is scrolled away or the tab is hidden.
- Pixel density is capped (1.5× on phones, 2× on desktop) and phones use a
  lighter material and fewer segments.
- With "reduce motion" turned on in the operating system, the sculpture is
  shown still, section reveals are off, and the pause button is hidden.
- If WebGL is unavailable, three.js can't load, or the graphics context is
  lost, the static ribbon symbol stays in place.

## Verification

Checked in headless Chromium at 1440, 1280, 1024, 820, 375 and 320 px wide:

- No horizontal overflow on either page, including with extra-wide headline
  letterforms to simulate the Unbounded typeface.
- All links and buttons are at least 44 px tall. No empty or `#` links.
- Empty config shows honest "Screenshots coming soon", "Google Play link coming
  at launch" and "Channel launching soon" states with no buttons.
- With a filled-in config: the Google Play button, channel button, footer
  email and social links render; an invalid video URL and a `javascript:` link
  are rejected; pressing play swaps the thumbnail for the YouTube player.
- Reduced-motion mode disables reveals and all decorative motion; the nav
  "Motion" switch turns it off for everyone else and also pauses the 3D ribbon.
- The 3D fallback path works: when three.js can't load, the static symbol
  stays and the controls stay hidden.
- All scripts pass a JavaScript syntax check.

Not verified here (the test environment had no internet access):

- **The 3D scene itself was not seen running.** three.js and the Google Fonts
  could not be downloaded, so the ribbon's look, the jump animation, pointer
  tilt, Replay and Pause were checked by code review only. Open the site
  after publishing and check them on a desktop browser and your phone.
- Screenshots used fallback fonts instead of Unbounded and Figtree.
- Not tested on a real phone or in Safari or Firefox.
