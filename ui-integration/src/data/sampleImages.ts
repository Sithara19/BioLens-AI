
import { ModalityType } from '../types';

// =========================================================
// SAMPLE VISUALS FOR BIOLENS PHOTO GUIDES
// =========================================================
// These are UI reference illustrations only.
// They are NOT medical diagnostic images.
// =========================================================

function createEyeSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="85%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </radialGradient>

      <radialGradient id="irisGrad" cx="45%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="40%" stop-color="#0284c7"/>
        <stop offset="80%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#082f49"/>
      </radialGradient>

      <linearGradient id="palpebralGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fecdd3"/>
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.75"/>
      </linearGradient>
    </defs>

    <rect width="600" height="450" fill="#f8fafc"/>

    <path
      d="M 50,225 Q 300,60 550,225 Q 300,390 50,225 Z"
      fill="url(#scleraGrad)"
      stroke="#94a3b8"
      stroke-width="3"
    />

    <path
      d="M 120,210 Q 180,215 220,220 M 130,235 Q 170,230 215,225"
      stroke="#fca5a5"
      stroke-width="1.5"
      fill="none"
      opacity="0.6"
    />

    <path
      d="M 480,210 Q 420,218 380,222 M 460,230 Q 410,225 385,228"
      stroke="#fca5a5"
      stroke-width="1.5"
      fill="none"
      opacity="0.6"
    />

    <circle cx="300" cy="225" r="95" fill="url(#irisGrad)"/>
    <circle cx="300" cy="225" r="42" fill="#0f172a"/>

    <circle cx="280" cy="205" r="14" fill="#ffffff" opacity="0.85"/>
    <circle cx="325" cy="235" r="6" fill="#ffffff" opacity="0.6"/>

    <path
      d="M 160,300 Q 300,360 440,300 Q 300,380 160,300 Z"
      fill="url(#palpebralGrad)"
      stroke="#fb7185"
      stroke-width="1"
    />

    <circle
      cx="300"
      cy="225"
      r="130"
      fill="none"
      stroke="#0ea5e9"
      stroke-width="1.5"
      stroke-dasharray="6,6"
      opacity="0.4"
    />

    <text
      x="300"
      y="420"
      text-anchor="middle"
      fill="#64748b"
      font-family="system-ui, sans-serif"
      font-size="14"
      font-weight="600"
    >
      BioLens Visual Modality 01: Eye
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


// =========================================================
// TONGUE SAMPLE
// =========================================================

function createTongueSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <radialGradient id="tongueGrad" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#fda4af"/>
        <stop offset="45%" stop-color="#fb7185"/>
        <stop offset="80%" stop-color="#e11d48"/>
        <stop offset="100%" stop-color="#be123c"/>
      </radialGradient>

      <linearGradient id="tongueHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
      </linearGradient>
    </defs>

    <rect width="600" height="450" fill="#f8fafc"/>

    <!-- Tongue shape -->
    <path
      d="M 300,365
         C 220,365 150,315 145,245
         C 140,180 185,120 245,105
         C 265,100 285,110 300,125
         C 315,110 335,100 355,105
         C 415,120 460,180 455,245
         C 450,315 380,365 300,365 Z"
      fill="url(#tongueGrad)"
      stroke="#be123c"
      stroke-width="3"
    />

    <!-- Tongue center line -->
    <path
      d="M 300,135 C 292,185 292,250 300,330"
      stroke="#9f1239"
      stroke-width="3"
      fill="none"
      opacity="0.45"
    />

    <!-- Surface texture -->
    <g fill="#881337" opacity="0.25">
      <circle cx="220" cy="185" r="3"/>
      <circle cx="250" cy="165" r="2.5"/>
      <circle cx="280" cy="200" r="2.5"/>
      <circle cx="325" cy="175" r="2.5"/>
      <circle cx="355" cy="205" r="3"/>
      <circle cx="390" cy="185" r="2.5"/>
      <circle cx="235" cy="240" r="2.5"/>
      <circle cx="270" cy="255" r="3"/>
      <circle cx="330" cy="245" r="3"/>
      <circle cx="370" cy="250" r="2.5"/>
    </g>

    <!-- Highlight -->
    <ellipse
      cx="300"
      cy="205"
      rx="80"
      ry="95"
      fill="url(#tongueHighlight)"
    />

    <!-- Framing guide -->
    <rect
      x="125"
      y="85"
      width="350"
      height="300"
      rx="28"
      fill="none"
      stroke="#0ea5e9"
      stroke-width="2"
      stroke-dasharray="8,6"
      opacity="0.65"
    />

    <text
      x="300"
      y="420"
      text-anchor="middle"
      fill="#64748b"
      font-family="system-ui, sans-serif"
      font-size="14"
      font-weight="600"
    >
      BioLens Visual Modality 02: Tongue
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


// =========================================================
// NAIL SAMPLE
// =========================================================

function createNailSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <radialGradient id="fingerSkin" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="70%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </radialGradient>

      <linearGradient id="nailPlate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdf2f8"/>
        <stop offset="30%" stop-color="#fbcfe8"/>
        <stop offset="85%" stop-color="#f472b6"/>
        <stop offset="100%" stop-color="#e11d48" stop-opacity="0.6"/>
      </linearGradient>
    </defs>

    <rect width="600" height="450" fill="#f8fafc"/>

    <path
      d="M 190,450 L 190,200 C 190,110 410,110 410,200 L 410,450 Z"
      fill="url(#fingerSkin)"
      stroke="#c2410c"
      stroke-width="2"
    />

    <path
      d="M 220,330 C 220,350 380,350 380,330 C 395,200 395,150 380,140 C 350,120 250,120 220,140 C 205,150 205,200 220,330 Z"
      fill="#ffffff"
      opacity="0.1"
    />

    <path
      d="M 230,320 C 230,335 370,335 370,320 C 382,210 382,155 365,145 C 340,132 260,132 235,145 C 218,155 218,210 230,320 Z"
      fill="url(#nailPlate)"
      stroke="#f43f5e"
      stroke-width="2"
    />

    <path
      d="M 260,320 C 265,285 335,285 340,320 Z"
      fill="#ffffff"
      opacity="0.85"
    />

    <path
      d="M 240,146 C 265,135 335,135 360,146"
      stroke="#ffffff"
      stroke-width="4"
      stroke-linecap="round"
      fill="none"
      opacity="0.9"
    />

    <ellipse
      cx="300"
      cy="230"
      rx="35"
      ry="45"
      fill="#ffffff"
      opacity="0.25"
    />

    <text
      x="300"
      y="420"
      text-anchor="middle"
      fill="#64748b"
      font-family="system-ui, sans-serif"
      font-size="14"
      font-weight="600"
    >
      BioLens Visual Modality 03: Nail
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


// =========================================================
// SKIN SAMPLE
// =========================================================

function createSkinSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <radialGradient id="skinDermis" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="50%" stop-color="#fdba74"/>
        <stop offset="85%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#f97316"/>
      </radialGradient>

      <radialGradient id="dermalGlow" cx="45%" cy="40%" r="30%">
        <stop offset="0%" stop-color="#fecdd3" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#fed7aa" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="600" height="450" fill="#f8fafc"/>

    <rect
      x="80"
      y="50"
      width="440"
      height="320"
      rx="28"
      fill="url(#skinDermis)"
      stroke="#ea580c"
      stroke-width="2"
    />

    <circle
      cx="280"
      cy="200"
      r="100"
      fill="url(#dermalGlow)"
    />

    <path
      d="M 120,120 Q 220,140 320,130 Q 420,120 480,135"
      stroke="#ea580c"
      stroke-width="0.8"
      fill="none"
      opacity="0.25"
    />

    <path
      d="M 110,180 Q 230,195 330,185 Q 430,175 490,190"
      stroke="#ea580c"
      stroke-width="0.8"
      fill="none"
      opacity="0.25"
    />

    <path
      d="M 115,240 Q 215,250 315,245 Q 415,235 485,250"
      stroke="#ea580c"
      stroke-width="0.8"
      fill="none"
      opacity="0.25"
    />

    <circle
      cx="300"
      cy="210"
      r="70"
      fill="none"
      stroke="#0ea5e9"
      stroke-width="2"
      stroke-dasharray="8,6"
      opacity="0.7"
    />

    <circle
      cx="300"
      cy="210"
      r="4"
      fill="#0ea5e9"
      opacity="0.9"
    />

    <text
      x="300"
      y="420"
      text-anchor="middle"
      fill="#64748b"
      font-family="system-ui, sans-serif"
      font-size="14"
      font-weight="600"
    >
      BioLens Visual Modality 04: Skin
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


// =========================================================
// PHOTO GUIDE TYPE
// =========================================================

export interface ModalityPhotoGuide {
  title: string;
  subtitle: string;
  sampleName: string;
  dataUrl: string;
  distance: string;
  lighting: string;
  positioning: string;
  dos: string[];
  donts: string[];
}


// =========================================================
// ALL FOUR MODALITY GUIDES
// =========================================================

export const MODALITY_PHOTO_GUIDES: Record<
  ModalityType,
  ModalityPhotoGuide
> = {
  eye: {
    title: 'Eye & Lower Eyelid',
    subtitle: 'Proper framing sample for eye screening',
    sampleName: 'Eye Photo Sample Guide',
    dataUrl: createEyeSvg(),
    distance: '10–15 cm (4–6 inches) from eye',
    lighting:
      'Soft natural daylight or bright diffuse room light (no camera flash)',
    positioning:
      'Keep eye comfortably open and gently pull down the lower eyelid to show the inner pink rim.',
    dos: [
      'Inner lower eyelid margin clearly exposed',
      'Natural, even lighting without flash reflection',
      'Steady camera with sharp focus on eye and eyelid',
    ],
    donts: [
      'Do not use camera flash (causes glare and squinting)',
      'Avoid harsh directional shadows across face',
      'Do not submit blurry or out-of-focus photos',
    ],
  },

  // =======================================================
  // TONGUE
  // =======================================================
  tongue: {
    title: 'Tongue',
    subtitle: 'Proper framing sample for tongue screening',
    sampleName: 'Tongue Photo Sample Guide',
    dataUrl: createTongueSvg(),
    distance: '10–15 cm (4–6 inches) from the mouth',
    lighting:
      'Soft natural daylight or bright diffuse room light without camera flash',
    positioning:
      'Extend the tongue naturally and keep the full visible tongue centered in the frame.',
    dos: [
      'Keep the tongue fully visible and centered',
      'Use even lighting without strong shadows',
      'Keep the camera steady and the image sharply focused',
    ],
    donts: [
      'Avoid camera flash or strong direct light',
      'Do not cover the tongue with fingers or objects',
      'Do not submit blurry or heavily filtered photos',
    ],
  },

  nail: {
    title: 'Fingernail & Nail Bed',
    subtitle: 'Proper framing sample for fingernail screening',
    sampleName: 'Fingernail Photo Sample Guide',
    dataUrl: createNailSvg(),
    distance: '10–15 cm (4–6 inches) from nail',
    lighting:
      'Even daylight or soft overhead room light without strong shadows',
    positioning:
      'Rest finger flat against a plain, neutral background such as a sheet of white paper or plain table.',
    dos: [
      'Plain, neutral background (white paper or clean desk)',
      'Fingernail facing squarely toward camera lens',
      'Clean, bare nail without colored nail polish',
    ],
    donts: [
      'Avoid colored or opaque nail polish / artificial nails',
      'Avoid dark, patterned, or cluttered backgrounds',
      'Do not tilt finger at an extreme sideways angle',
    ],
  },

  skin: {
    title: 'Skin Area (Forearm / Hand)',
    subtitle: 'Proper framing sample for skin screening',
    sampleName: 'Skin Photo Sample Guide',
    dataUrl: createSkinSvg(),
    distance: '10–15 cm (4–6 inches) from skin',
    lighting:
      'Even, diffused lighting without shadows cast by phone or hands',
    positioning:
      'Select a flat, clear patch of skin on your inner forearm, wrist, or back of hand.',
    dos: [
      'Clean patch on inner forearm or back of hand',
      'Even, diffused lighting without hard shadows',
      'Camera parallel to skin with steady, clear focus',
    ],
    donts: [
      'Avoid shadows cast by phone or hands over the area',
      'Avoid skin areas with bandages, jewelry, or tattoos',
      'Do not hold camera too close (causes focus blur)',
    ],
  },
};


// =========================================================
// SAMPLE MODALITY IMAGES
// =========================================================

export const SAMPLE_MODALITY_IMAGES: Record<
  ModalityType,
  {
    name: string;
    description: string;
    dataUrl: string;
  }
> = {
  eye: {
    name: MODALITY_PHOTO_GUIDES.eye.title,
    description: MODALITY_PHOTO_GUIDES.eye.subtitle,
    dataUrl: MODALITY_PHOTO_GUIDES.eye.dataUrl,
  },

  tongue: {
    name: MODALITY_PHOTO_GUIDES.tongue.title,
    description: MODALITY_PHOTO_GUIDES.tongue.subtitle,
    dataUrl: MODALITY_PHOTO_GUIDES.tongue.dataUrl,
  },

  nail: {
    name: MODALITY_PHOTO_GUIDES.nail.title,
    description: MODALITY_PHOTO_GUIDES.nail.subtitle,
    dataUrl: MODALITY_PHOTO_GUIDES.nail.dataUrl,
  },

  skin: {
    name: MODALITY_PHOTO_GUIDES.skin.title,
    description: MODALITY_PHOTO_GUIDES.skin.subtitle,
    dataUrl: MODALITY_PHOTO_GUIDES.skin.dataUrl,
  },
};
