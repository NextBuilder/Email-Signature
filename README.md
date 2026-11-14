<div align="center">

<img src="assets/favicon.png" alt="Signature Studio" width="72">

# Signature Studio

**Professional email signatures, ready in two minutes.**

Free · Open source · No sign-up · Works in Gmail, Apple Mail and Outlook

[**Open Signature Studio →**](https://nextbuilder.github.io/Email-Signature/)

<br>

<img src="assets/screenshot.png" alt="Signature Studio editor" width="900">

</div>

<br>

## Features

- **4 templates:** Classic, Stacked, Minimal and Accent. Each one is built from email-safe tables and inline styles.
- **Logo and photo upload:** drag, drop, paste or browse. Images are enhanced automatically in your browser: empty edges are trimmed, plain backgrounds can be removed, and small logos are upscaled with edge smoothing and sharpening, then exported as an optimised 288 × 288 PNG or JPG.
- **50 platforms:** social, developer, maker, creator, chat and contact icons in one consistent set.
- **3 icon styles × 13 colours:** Outline, Solid or Badge, in a neutral palette or each platform's official brand colour.
- **Call-to-action button:** add a "Book a call" or "Watch on YouTube" button as a filled button, an outline button or a text link.
- **Complete details:** name, pronouns, title, company, phone, email, website, city, address, tagline and a disclaimer.
- **Saved signatures:** keep several signatures, duplicate them, and export or import a settings file to move between devices.
- **Live preview:** switch between light and dark inboxes, and between desktop and phone widths.
- **Copy anywhere:** copy the signature, a plain-text version, or the raw HTML, or download it as a file.
- **Private by design:** everything runs in your browser. Nothing is uploaded, and your signatures are saved only on your device.

<div align="center"><img src="assets/templates.png" alt="The four templates" width="900"></div>

## Supported platforms

| Group | Platforms |
|---|---|
| **Social** | YouTube · Instagram · X · LinkedIn · Facebook · TikTok · Threads · Bluesky · Mastodon · Pinterest · Reddit · Snapchat · Tumblr |
| **Build** | GitHub · GitLab · Stack Overflow · CodePen · Product Hunt · Figma · Dribbble · Behance · Notion |
| **Make** | Instructables · Hackster · Hackaday · Printables · Thingiverse · Arduino |
| **Chat** | WhatsApp · Telegram · Discord · Signal |
| **Create** | Twitch · Spotify · SoundCloud · Vimeo · Medium · Substack · Patreon · Ko-fi · Gumroad · Linktree · Unsplash |
| **Work** | Upwork · Fiverr · Calendly |
| **Contact** | Website · Email · Phone · Location |

## Quick start

1. Open **[Signature Studio](https://nextbuilder.github.io/Email-Signature/)** and click **+** to start a new signature.
2. Choose a template, then fill in your details.
3. Upload your photo or logo, paste a public image link, or use your GitHub avatar.
4. Pick your platforms and paste your profile links.
5. Optionally add a call-to-action button, then choose an accent colour and icon style.
6. Click **Copy signature**, then follow the steps below for your email app.

## Add it to your email

### Gmail (computer)

> **Direct link:** [mail.google.com/mail/u/0/#settings/general](https://mail.google.com/mail/u/0/#settings/general)

1. Click **Copy signature** in Signature Studio.
2. Open **Gmail → Settings → See all settings → General**. The direct link above takes you straight there.
3. Scroll to **Signature**, click **Create new** and give it a name.
4. Click inside the signature box and paste with `Ctrl + V` (`⌘ + V` on Mac).
5. Under **Signature defaults**, choose it for **For new emails use** and **On reply/forward use**.
6. Scroll to the bottom and click **Save Changes**.

If you're signed in to several Google accounts, change `/u/0/` in the link to `/u/1/`, `/u/2/` and so on until it opens the right inbox.

#### Using an uploaded logo in Gmail

Uploaded images are embedded in the signature. That works in Apple Mail and Outlook, but Gmail removes embedded images, so let Gmail host your logo once:

1. In Signature Studio, click **Download your enhanced image** (under **Photo or logo**).
2. In Gmail's signature box, click **Insert image → Upload** and choose that file.
3. Right-click the image in Gmail and choose **Copy image address**.
4. Paste it into **Image link** in Signature Studio, copy your signature again and paste it over the old one.

### Gmail app (iPhone, iPad, Android)

Set the signature up on a computer first.

- **iPhone & iPad:** Menu ☰ → **Settings** → your account → **Signature settings** → turn **Mobile Signature** off. The app then uses your computer signature.
- **Android:** Menu ☰ → **Settings** → your account → **Mobile signature**. Leave it empty, or click **Text** in Signature Studio and paste the plain-text version there.

### Apple Mail (Mac)

1. Click **Copy signature**.
2. Open **Mail → Settings → Signatures**, pick your account and click **+**.
3. Paste into the right-hand box with `⌘ + V`.
4. Untick **Always match my default message font**, then choose the signature under **Choose Signature**.

### Outlook

1. Click **Copy signature**.
2. **Outlook on the web / new Outlook:** Settings ⚙ → **Account** → **Signatures** → **New signature**.
   **Classic Outlook (Windows):** File → Options → Mail → **Signatures…** → **New**.
3. Paste, set it as the default for new messages and replies, then click **Save**.

## How it works

Email apps strip scripts, external stylesheets and SVG, so Signature Studio writes table-based HTML with inline styles only. Icons are PNG images hosted on GitHub Pages, because Gmail only shows images that have a public link. Uploaded images are processed with the browser's canvas — trimmed, optionally background-removed, upscaled step by step, edge-smoothed and sharpened — without ever leaving your device. The output stays well under Gmail's 10,000-character signature limit, and the editor shows you the live count.

## Run your own copy

1. **Fork** this repository.
2. In your fork, open **Settings → Pages**, set **Source** to **Deploy from a branch**, then choose **`main`** and **`/ (root)`**.
3. Your studio goes live at `https://<your-username>.github.io/Email-Signature/`, and its icons are served from your own fork.

To rebuild or extend the icon set:

```bash
npm install
npm run build:icons
```

Add a platform in [`scripts/build-icons.mjs`](scripts/build-icons.mjs). The script renders every style and colour and updates [`app/platforms.js`](app/platforms.js).

## Project structure

```
Email-Signature/
├── index.html              # Signature Studio app
├── app/
│   ├── studio.css          # Interface styles
│   ├── studio.js           # Editor, image enhancer, preview and signature builder
│   └── platforms.js        # Generated platform list
├── icons/                  # 1,900 PNG icons: {outline,solid,badge}/{colour}/{platform}.png
├── scripts/
│   └── build-icons.mjs     # Icon build script
├── examples/
│   └── next-builder.html   # Example signature
└── assets/                 # Favicon, screenshots and example images
```

## Credits

- Outline icons are based on [Tabler Icons](https://tabler.io/icons) (MIT).
- Brand marks are based on [Simple Icons](https://simpleicons.org) (CC0).
- All brand names and logos are trademarks of their respective owners.

## License

[MIT](LICENSE) © Kishan Pratap Singh · [Next Builder](https://youtube.com/@NextBuilderIO)

<div align="center">
<br>

[YouTube](https://youtube.com/@NextBuilderIO) · [Instagram](https://instagram.com/next_builder) · [GitHub](https://github.com/NextBuilder) · [LinkedIn](https://www.linkedin.com/company/nextbuilderio/) · [X](https://x.com/NEXTBUILDERIO) · [Instructables](https://www.instructables.com/member/Next%20Builder%20DIY/) · [Hackster](https://hackster.io/NEXTBUILDER) · [Hackaday](https://hackaday.io/NextBuilder)

</div>
