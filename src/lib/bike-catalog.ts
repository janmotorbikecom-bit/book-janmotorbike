export type BikeCategory = "Manual" | "Automatic" | "Semi-Automatic";
export type Transmission = "Manual" | "Automatic" | "Semi-Automatic";

export type Bike = {
  id: string;
  name: string;
  brand?: string;
  category: BikeCategory;
  engineCc: number;
  transmission: Transmission;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  deposit: number;
  description: string;
  descriptionVi?: string;
  imageUrl: string;
  images?: string[];
  available: boolean;
  isForSale?: boolean;
  salePrice?: number;
  busyFrom?: string;
  busyTo?: string;
};

const UNSPLASH = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const visionImgs = [
  UNSPLASH("photo-1558981403-c5f9899a28bc"),
  UNSPLASH("photo-1558981806-ec527fa84c39"),
  UNSPLASH("photo-1621217036647-73236e7a2b25"),
  UNSPLASH("photo-1449426468159-d96dbf08f19f"),
];
const exciterImgs = [
  UNSPLASH("photo-1568772585407-9361f9bf3a87"),
  UNSPLASH("photo-1571646034647-52e6ea84b28c"),
  UNSPLASH("photo-1611241443322-b5c8b1e7cbb2"),
  UNSPLASH("photo-1591637333184-19aa84b3e01f"),
];
const winnerImgs = [
  UNSPLASH("photo-1580310614729-ccd69652491d"),
  UNSPLASH("photo-1609630875171-b1321377ee65"),
  UNSPLASH("photo-1519681393784-d120267933ba"),
  UNSPLASH("photo-1517649763962-0c623066013b"),
];
const vespaImgs = [
  UNSPLASH("photo-1601517442857-83e79c14da58"),
  UNSPLASH("photo-1591637333184-19aa84b3e01f"),
  UNSPLASH("photo-1558980664-10ea3f0d0c8a"),
  UNSPLASH("photo-1571068316344-75bc76f77890"),
];

export const seedBikes: Bike[] = [
  {
    id: "b1",
    name: "Honda Vision #12",
    brand: "Honda",
    category: "Automatic",
    engineCc: 110,
    transmission: "Automatic",
    pricePerDay: 150000,
    pricePerWeek: 750000,
    pricePerMonth: 1500000,
    deposit: 2000000,
    description:
      "Lightweight scooter, perfect for daily city rides. Extremely fuel-efficient and easy to handle in Saigon traffic. Comes with 2 helmets.",
    imageUrl: visionImgs[0],
    images: visionImgs,
    available: true,
  },
  {
    id: "b2",
    name: "Yamaha Exciter 155 #07",
    brand: "Yamaha",
    category: "Manual",
    engineCc: 155,
    transmission: "Manual",
    pricePerDay: 280000,
    pricePerWeek: 1500000,
    pricePerMonth: 3200000,
    deposit: 4000000,
    description: "Sporty manual bike with strong acceleration.",
    imageUrl: exciterImgs[0],
    images: exciterImgs,
    available: true,
  },
  {
    id: "b3",
    name: "Honda Winner X #03",
    brand: "Honda",
    category: "Semi-Automatic",
    engineCc: 150,
    transmission: "Semi-Automatic",
    pricePerDay: 230000,
    pricePerWeek: 1300000,
    pricePerMonth: 2800000,
    deposit: 3500000,
    description: "Reliable semi-auto, great for road trips.",
    imageUrl: winnerImgs[0],
    images: winnerImgs,
    available: false,
  },
  {
    id: "b4",
    name: "Vespa Sprint #21",
    brand: "Vespa",
    category: "Automatic",
    engineCc: 125,
    transmission: "Automatic",
    pricePerDay: 350000,
    pricePerWeek: 1900000,
    pricePerMonth: 4000000,
    deposit: 5000000,
    description: "Stylish Italian scooter with premium ride.",
    imageUrl: vespaImgs[0],
    images: vespaImgs,
    available: true,
  },
];

const BASE_RATE = 1500000;
export const DEFAULT_PRICING_TIERS: Record<number, number[]> = {
  1500000: [
    0, 200000, 350000, 450000, 550000, 650000, 700000, 800000, 850000, 900000, 1000000, 1050000,
    1100000, 1150000, 1200000, 1250000, 1300000, 1350000, 1400000, 1400000, 1450000, 1450000,
    1450000, 1500000, 1500000, 1500000,
  ],
  1600000: [
    0, 200000, 350000, 500000, 600000, 700000, 750000, 850000, 900000, 950000, 1050000, 1100000,
    1150000, 1250000, 1300000, 1350000, 1400000, 1450000, 1500000, 1500000, 1550000, 1550000,
    1550000, 1600000, 1600000, 1600000,
  ],
  1700000: [
    0, 250000, 400000, 500000, 600000, 750000, 800000, 900000, 950000, 1000000, 1150000, 1200000,
    1250000, 1300000, 1350000, 1400000, 1500000, 1550000, 1600000, 1600000, 1650000, 1650000,
    1650000, 1700000, 1700000, 1700000,
  ],
  1800000: [
    0, 250000, 400000, 550000, 650000, 800000, 850000, 950000, 1000000, 1100000, 1200000, 1250000,
    1300000, 1400000, 1450000, 1500000, 1550000, 1600000, 1700000, 1700000, 1750000, 1750000,
    1750000, 1800000, 1800000, 1800000,
  ],
  1900000: [
    0, 250000, 450000, 550000, 700000, 850000, 900000, 1000000, 1100000, 1150000, 1250000, 1350000,
    1400000, 1450000, 1500000, 1600000, 1650000, 1700000, 1800000, 1800000, 1850000, 1850000,
    1850000, 1900000, 1900000, 1900000,
  ],
};

export function calculateRentPrice(
  totalDays: number,
  priceDay: number,
  priceWeek: number,
  priceMonth: number,
  pricingTiers: Record<number, number[]> = DEFAULT_PRICING_TIERS,
) {
  if (totalDays <= 0) return 0;

  const months = Math.floor(totalDays / 30);
  const remainderDays = totalDays % 30;

  let remainderPrice = 0;
  if (remainderDays > 0) {
    if (remainderDays >= 25 && remainderDays <= 30) {
      remainderPrice = priceMonth;
    } else {
      const schedule = pricingTiers[priceMonth];
      if (schedule) {
        remainderPrice = schedule[remainderDays];
      } else {
        // Fallback: Scale based on priceMonth ratio compared to BASE_RATE
        const ratio = priceMonth / BASE_RATE;
        const baseSchedule = pricingTiers[BASE_RATE] || DEFAULT_PRICING_TIERS[BASE_RATE];
        // Round to nearest 10,000 for clean numbers
        remainderPrice = Math.round((baseSchedule[remainderDays] * ratio) / 10000) * 10000;
      }
    }
  }

  return months * priceMonth + remainderPrice;
}
