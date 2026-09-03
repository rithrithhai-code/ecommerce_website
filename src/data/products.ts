import type { CategoryId, Product } from "@/types";

export const CATEGORIES: Array<{ id: CategoryId; label: string; blurb: string }> = [
  { id: "audio", label: "Audio", blurb: "Headphones & speakers" },
  { id: "computing", label: "Computing", blurb: "Laptops, desks, input" },
  { id: "mobile", label: "Mobile", blurb: "Phones & wearables" },
  { id: "lifestyle", label: "Lifestyle", blurb: "Optics & carry" },
];

export const CATEGORY_LABEL: Record<CategoryId, string> = CATEGORIES.reduce(
  (acc, category) => ({ ...acc, [category.id]: category.label }),
  {} as Record<CategoryId, string>,
);

export const PRODUCTS: Product[] = [
  {
    id: "aura-one",
    slug: "aura-one-anc-headphones",
    name: "Aura One ANC Headphones",
    tagline: "Adaptive noise cancelling, 40-hour battery",
    description:
      "Forty millimetre beryllium-coated drivers paired with a six-microphone adaptive array that reads the room every 200 milliseconds. Aura One settles into a smooth, wide presentation — enough low-end weight for electronic music without smearing the midrange where voices live.",
    priceUsd: 299,
    compareAtUsd: 349,
    category: "audio",
    brand: "Aura Acoustics",
    rating: 4.8,
    reviews: 412,
    stock: 24,
    glyph: "headphones",
    hue: ["#d63a2b", "#40100c"],
    badge: "bestseller",
    highlights: [
      "Adaptive hybrid ANC with transparency dial",
      "40 h playback, 4 h from a 10 min charge",
      "Multipoint Bluetooth 5.4 + USB-C audio",
      "Memory foam pads, 249 g frame",
    ],
    specs: {
      Driver: "40 mm beryllium-coated",
      Battery: "40 h (ANC on)",
      Codecs: "LDAC, aptX Adaptive, AAC, SBC",
      Weight: "249 g",
      Warranty: "24 months",
    },
  },
  {
    id: "beam-360",
    slug: "beam-360-portable-speaker",
    name: "Beam 360 Speaker",
    tagline: "Room-filling sound in a 680 g shell",
    description:
      "A upward-firing full-range driver and dual passive radiators throw sound in a full circle, which makes Beam 360 the rare portable speaker that stays even whether it sits on a desk or the far end of a terrace.",
    priceUsd: 89,
    category: "audio",
    brand: "Beam Audio",
    rating: 4.5,
    reviews: 188,
    stock: 60,
    glyph: "speaker",
    hue: ["#2b6cb0", "#0d2233"],
    highlights: ["360° dispersion", "IP67 dust & water sealing", "18 h battery", "Stereo pair mode"],
    specs: {
      Output: "2 × 15 W",
      Battery: "18 h",
      Rating: "IP67",
      Weight: "680 g",
      Warranty: "12 months",
    },
  },
  {
    id: "studio-air-14",
    slug: "studio-air-14-laptop",
    name: "Studio Air 14 Laptop",
    tagline: "14″ 3K OLED, 18-hour day, 1.19 kg",
    description:
      "A magnesium chassis that stays under 1.2 kg, a 3K OLED panel calibrated to 100% DCI-P3, and a thermally-tuned fan that stays silent through ordinary work. This is the machine you carry all week and still want to open in a meeting.",
    priceUsd: 1799,
    compareAtUsd: 1949,
    category: "computing",
    brand: "Studio Systems",
    rating: 4.7,
    reviews: 96,
    stock: 8,
    glyph: "laptop",
    hue: ["#7c6f64", "#241f1c"],
    badge: "new",
    highlights: [
      "14″ 2880 × 1800 OLED, 120 Hz",
      "16 GB unified memory, 512 GB NVMe",
      "18 h mixed-use battery",
      "Two Thunderbolt ports + full-size HDMI",
    ],
    specs: {
      Display: '14" 2880 × 1800 OLED 120 Hz',
      Memory: "16 GB unified",
      Storage: "512 GB NVMe Gen 4",
      Weight: "1.19 kg",
      Warranty: "24 months",
    },
  },
  {
    id: "lumen-27",
    slug: "lumen-27-studio-monitor",
    name: "Lumen 27 Studio Monitor",
    tagline: "4K mini-LED with factory calibration",
    description:
      "Every panel ships with its own colour report, and hardware LUT support means the profile survives operating-system changes. Dimming is handled by 1,152 local zones, so bright text on a dark canvas stays crisp instead of blooming.",
    priceUsd: 429,
    category: "computing",
    brand: "Lumen Optics",
    rating: 4.6,
    reviews: 74,
    stock: 15,
    glyph: "monitor",
    hue: ["#3f7d8c", "#10262c"],
    highlights: [
      '27" 4K mini-LED, 1,152 dimming zones',
      "99% DCI-P3, Delta-E under 1.5",
      "96 W USB-C power delivery",
      "Height, tilt, swivel and pivot stand",
    ],
    specs: {
      Panel: '27" IPS mini-LED',
      Resolution: "3840 × 2160 at 144 Hz",
      "Ports": "USB-C 96 W, HDMI 2.1, DP 1.4",
      Calibration: "Factory report, hardware LUT",
      Warranty: "36 months",
    },
  },
  {
    id: "terra-65",
    slug: "terra-65-mechanical-keyboard",
    name: "Terra 65 Mechanical Keyboard",
    tagline: "Gasket-mounted, hot-swap, aluminium case",
    description:
      "A 65% layout on a CNC aluminium tray with silicone gaskets under the plate — the typing feel is soft and deep rather than pingy. Hot-swap sockets mean you can change switches without a soldering iron.",
    priceUsd: 169,
    category: "computing",
    brand: "Terra Works",
    rating: 4.9,
    reviews: 240,
    stock: 32,
    glyph: "keyboard",
    hue: ["#a4761f", "#2e2113"],
    badge: "bestseller",
    highlights: [
      "Gasket-mounted 65% with rotary knob",
      "Hot-swap north-facing sockets",
      "Tri-mode: USB-C, 2.4 GHz, Bluetooth",
      "PBT dye-sub keycaps, 1.5 mm foam",
    ],
    specs: {
      Layout: "65% (68 keys) ANSI",
      Switches: "Pre-lubed linear, hot-swap",
      Connection: "USB-C / 2.4 GHz / BT 5.2",
      Weight: "1.24 kg",
      Warranty: "12 months",
    },
  },
  {
    id: "glide-ergo",
    slug: "glide-ergo-wireless-mouse",
    name: "Glide Ergo Wireless Mouse",
    tagline: "74 g shell, 8K polling, silent switches",
    description:
      "Light without feeling hollow. The hump sits under the palm rather than the arch, and the optical switches are quiet enough for shared offices and open-plan desks.",
    priceUsd: 79,
    category: "computing",
    brand: "Glide Labs",
    rating: 4.4,
    reviews: 131,
    stock: 54,
    glyph: "mouse",
    hue: ["#5b6b8c", "#161b26"],
    highlights: ["74 g, PTFE feet", "Up to 8 kHz polling", "90 h per charge", "Silent optical switches"],
    specs: {
      Sensor: "26,000 DPI optical",
      Polling: "125 Hz – 8 kHz",
      Battery: "90 h (1 kHz)",
      Weight: "74 g",
      Warranty: "24 months",
    },
  },
  {
    id: "orbit-pad",
    slug: "orbit-gamepad-controller",
    name: "Orbit Gamepad Controller",
    tagline: "Hall-effect sticks, swappable backs",
    description:
      "Hall-effect sensors mean the sticks cannot develop the drift that wears out potentiometers. Triggers lock to two positions, and the face plates swap without tools when you want a different reach.",
    priceUsd: 99,
    category: "computing",
    brand: "Orbit Interactive",
    rating: 4.3,
    reviews: 87,
    stock: 41,
    glyph: "gamepad",
    hue: ["#6d4d8c", "#1b1526"],
    highlights: [
      "Hall-effect thumbsticks and triggers",
      "Two lockable trigger stops",
      "Back paddles with four profiles",
      "Wired, 2.4 GHz and Bluetooth",
    ],
    specs: {
      Sticks: "Hall-effect, 12-bit",
      Battery: "22 h",
      Profiles: "4 onboard",
      Platforms: "PC, Android, iOS",
      Warranty: "12 months",
    },
  },
  {
    id: "nova-fold",
    slug: "nova-fold-smartphone",
    name: "Nova Fold Smartphone",
    tagline: "7.6″ foldable with a crease you forget",
    description:
      "Opens to a 7.6 inch canvas with a hinge that holds angles on its own, and the inner laminate spreads the crease so it reads as a reflection rather than a fold line. Split-screen here is genuinely usable.",
    priceUsd: 1299,
    category: "mobile",
    brand: "Nova Mobile",
    rating: 4.2,
    reviews: 63,
    stock: 6,
    glyph: "smartphone",
    hue: ["#43569c", "#12182f"],
    badge: "limited",
    highlights: [
      "7.6″ inner LTPO, 6.5″ cover display",
      "48 MP main + 32 MP telephoto",
      "4,400 mAh with 65 W charge",
      "IP48 and five years of updates",
    ],
    specs: {
      Display: '7.6" LTPO 120 Hz + 6.5" cover',
      Camera: "48 MP wide, 32 MP tele, 12 MP ultra",
      Battery: "4,400 mAh, 65 W",
      Storage: "512 GB",
      Warranty: "24 months",
    },
  },
  {
    id: "pulse-s2",
    slug: "pulse-s2-smartwatch",
    name: "Pulse S2 Smartwatch",
    tagline: "Titanium case, 12-day battery",
    description:
      "A grade-5 titanium shell with a sapphire cover, and an electrocardiogram readout you can export as a PDF for a doctor's visit. The twelve-day figure is real with the always-on display off.",
    priceUsd: 249,
    compareAtUsd: 279,
    category: "mobile",
    brand: "Pulse Wearables",
    rating: 4.6,
    reviews: 205,
    stock: 27,
    glyph: "watch",
    hue: ["#8a6f4c", "#241d15"],
    highlights: [
      "Grade-5 titanium, sapphire crystal",
      "ECG, SpO₂, skin temperature",
      "12 days typical / 3 days GPS-heavy",
      "Dual-band GNSS route tracking",
    ],
    specs: {
      Case: "42 mm titanium",
      Display: '1.4" AMOLED, 2000 nits',
      Sensors: "ECG, SpO₂, temperature, GNSS",
      Water: "10 ATM",
      Warranty: "24 months",
    },
  },
  {
    id: "retro-x100",
    slug: "retro-x100-mirrorless-camera",
    name: "Retro X100 Mirrorless",
    tagline: "40 MP APS-C body with a fixed 35 mm",
    description:
      "Dials where you expect them, a leaf shutter you can leave running at 1/4000 s, and a simulation set that keeps people shooting JPEG. The kind of camera that stays on the strap instead of in the bag.",
    priceUsd: 1299,
    category: "lifestyle",
    brand: "Retro Imaging",
    rating: 4.8,
    reviews: 118,
    stock: 5,
    glyph: "camera",
    hue: ["#4a5240", "#171a14"],
    badge: "limited",
    highlights: [
      "40 MP APS-C X-Trans sensor",
      "Fixed 23 mm f/2 (35 mm equivalent)",
      "Leaf shutter to 1/4000 s",
      "19 film simulations, ISO up to 125k",
    ],
    specs: {
      Sensor: "40 MP APS-C",
      Lens: "23 mm f/2 (35 mm equiv.)",
      Iso: "125 – 12,800 (ext. 125k)",
      Video: "6.2K open gate, 4K 60p",
      Warranty: "24 months",
    },
  },
  {
    id: "voyage-25",
    slug: "voyage-25-backpack",
    name: "Voyage 25 Backpack",
    tagline: "Weatherproof shell, 25 L, laptop flat",
    description:
      "A clamshell main compartment lets the bag lie flat on a security-tray belt, and the laptop sleeve is suspended above the base so a dropped bag never lands on the machine.",
    priceUsd: 129,
    category: "lifestyle",
    brand: "Voyage Supply",
    rating: 4.7,
    reviews: 156,
    stock: 38,
    glyph: "backpack",
    hue: ["#2f5d6b", "#0e2126"],
    highlights: [
      "Recycled 420D ripstop, PFAS-free DWR",
      "Clamshell opening to 180°",
      "Suspended 16″ laptop sleeve",
      "Luggage pass-through + TSA lock point",
    ],
    specs: {
      Volume: "25 L",
      Fabric: "Recycled 420D ripstop",
      Laptop: "Up to 16″",
      Weight: "1.05 kg",
      Warranty: "Lifetime repair",
    },
  },
  {
    id: "halo-buds",
    slug: "halo-mini-earbuds",
    name: "Halo Mini Earbuds",
    tagline: "2.9 h case, spatial audio on any phone",
    description:
      "The case is small enough to forget in a pocket, and the buds track head position well enough that spatial mode is more than a demo trick. Find-my integration works without a proprietary account.",
    priceUsd: 129,
    category: "audio",
    brand: "Halo Audio",
    rating: 4.1,
    reviews: 97,
    stock: 0,
    glyph: "headphones",
    hue: ["#4f7f9c", "#14262f"],
    highlights: [
      "ANC with wind-noise reduction",
      "8 h buds / 28 h with case",
      "Head-tracked spatial audio",
      "Wireless charging case, IPX5",
    ],
    specs: {
      Driver: "11 mm dynamic",
      Battery: "8 h + 20 h case",
      Codecs: "LC3, AAC, SBC",
      Rating: "IPX5 buds",
      Warranty: "12 months",
    },
  },
];

const BY_SLUG = new Map(PRODUCTS.map((product) => [product.slug, product]));
const BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

export function getProductBySlug(slug: string): Product | undefined {
  return BY_SLUG.get(slug);
}

export function getProductById(id: string): Product | undefined {
  return BY_ID.get(id);
}

export function getFeatured(limit = 4): Product[] {
  const priority: Record<string, number> = { bestseller: 0, new: 1, limited: 2 };
  return [...PRODUCTS]
    .filter((product) => product.stock > 0)
    .sort((a, b) => {
      const badgeRank = (priority[a.badge ?? ""] ?? 9) - (priority[b.badge ?? ""] ?? 9);
      return badgeRank || b.rating - a.rating;
    })
    .slice(0, limit);
}

export function getRelated(product: Product, limit = 4): Product[] {
  const sameCategory = PRODUCTS.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const fillers = PRODUCTS.filter(
    (candidate) => candidate.id !== product.id && candidate.category !== product.category,
  ).sort((a, b) => b.rating - a.rating);
  return [...sameCategory, ...fillers].slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PRODUCTS;
  return PRODUCTS.filter((product) =>
    [product.name, product.brand, product.tagline, CATEGORY_LABEL[product.category]]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

export const PRICE_BOUNDS_USD = {
  min: Math.min(...PRODUCTS.map((product) => product.priceUsd)),
  max: Math.max(...PRODUCTS.map((product) => product.priceUsd)),
};
