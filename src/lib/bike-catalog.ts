export type BikeCategory = "Manual" | "Automatic" | "Semi-Automatic" | "Electric";
export type Transmission = "Manual" | "Automatic" | "Semi-Automatic" | "Electric";

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
  1500000: [0, 200000, 350000, 450000, 550000, 650000, 700000, 800000, 850000, 900000, 1000000, 1050000, 1100000, 1150000, 1200000, 1250000, 1300000, 1350000, 1400000, 1400000, 1450000, 1450000, 1450000, 1500000, 1500000, 1500000],
  1600000: [0, 212000, 370000, 475000, 581000, 687000, 740000, 846000, 899000, 951000, 1057000, 1110000, 1163000, 1216000, 1268000, 1321000, 1374000, 1427000, 1480000, 1480000, 1533000, 1533000, 1533000, 1600000, 1600000, 1600000],
  1700000: [0, 223000, 389000, 499000, 610000, 722000, 777000, 888000, 944000, 999000, 1110000, 1165000, 1221000, 1276000, 1332000, 1388000, 1443000, 1499000, 1554000, 1554000, 1610000, 1610000, 1610000, 1700000, 1700000, 1700000],
  1800000: [0, 233000, 408000, 522000, 638000, 755000, 813000, 929000, 987000, 1045000, 1161000, 1219000, 1277000, 1335000, 1393000, 1451000, 1509000, 1567000, 1625000, 1625000, 1683000, 1683000, 1683000, 1800000, 1800000, 1800000],
  1900000: [0, 243000, 425000, 543000, 664000, 786000, 847000, 968000, 1028000, 1089000, 1210000, 1270000, 1331000, 1391000, 1452000, 1512000, 1573000, 1633000, 1694000, 1694000, 1754000, 1754000, 1754000, 1900000, 1900000, 1900000],
  2000000: [0, 251000, 439000, 564000, 690000, 815000, 878000, 1003000, 1066000, 1129000, 1254000, 1317000, 1380000, 1442000, 1505000, 1568000, 1631000, 1693000, 1756000, 1756000, 1819000, 1819000, 1819000, 2000000, 2000000, 2000000],
  2200000: [0, 270000, 472000, 607000, 742000, 877000, 945000, 1080000, 1147000, 1215000, 1350000, 1417000, 1485000, 1552000, 1620000, 1687000, 1755000, 1822000, 1890000, 1890000, 1957000, 1957000, 1957000, 2200000, 2200000, 2200000],
  2300000: [0, 279000, 487000, 626000, 766000, 905000, 975000, 1114000, 1184000, 1254000, 1393000, 1463000, 1532000, 1602000, 1672000, 1741000, 1811000, 1881000, 1950000, 1950000, 2020000, 2020000, 2020000, 2300000, 2300000, 2300000],
  2500000: [0, 293000, 512000, 658000, 805000, 951000, 1024000, 1170000, 1244000, 1317000, 1463000, 1536000, 1609000, 1683000, 1756000, 1829000, 1902000, 1975000, 2049000, 2049000, 2122000, 2122000, 2122000, 2500000, 2500000, 2500000],
  2700000: [0, 306000, 535000, 688000, 841000, 994000, 1070000, 1223000, 1299000, 1376000, 1529000, 1605000, 1682000, 1758000, 1835000, 1911000, 1988000, 2064000, 2141000, 2141000, 2217000, 2217000, 2217000, 2700000, 2700000, 2700000],
  2800000: [0, 312000, 546000, 701000, 858000, 1014000, 1092000, 1248000, 1326000, 1404000, 1560000, 1638000, 1716000, 1794000, 1872000, 1950000, 2028000, 2106000, 2184000, 2184000, 2262000, 2262000, 2262000, 2800000, 2800000, 2800000],
  2900000: [0, 318000, 556000, 715000, 874000, 1033000, 1112000, 1271000, 1350000, 1430000, 1589000, 1668000, 1748000, 1827000, 1907000, 1986000, 2065000, 2145000, 2224000, 2224000, 2304000, 2304000, 2304000, 2900000, 2900000, 2900000],
  3000000: [0, 323000, 565000, 727000, 888000, 1050000, 1130000, 1292000, 1373000, 1454000, 1615000, 1696000, 1777000, 1858000, 1939000, 2019000, 2100000, 2181000, 2262000, 2262000, 2342000, 2342000, 2342000, 3000000, 3000000, 3000000],
  3300000: [0, 335000, 460000, 600000, 760000, 920000, 1030000, 1160000, 1290000, 1420000, 1560000, 1700000, 1840000, 1980000, 2120000, 2260000, 2400000, 2540000, 2680000, 2780000, 2900000, 3020000, 3150000, 3300000, 3300000, 3300000],
  3500000: [0, 350000, 480000, 625000, 790000, 955000, 1070000, 1205000, 1340000, 1475000, 1620000, 1765000, 1910000, 2055000, 2200000, 2345000, 2490000, 2635000, 2780000, 2885000, 3010000, 3140000, 3280000, 3500000, 3500000, 3500000],
  4500000: [0, 450000, 620000, 810000, 1020000, 1230000, 1380000, 1540000, 1700000, 1860000, 2030000, 2200000, 2370000, 2540000, 2710000, 2880000, 3050000, 3220000, 3390000, 3560000, 3730000, 3920000, 4180000, 4500000, 4500000, 4500000],
  5500000: [0, 550000, 740000, 960000, 1200000, 1440000, 1610000, 1790000, 1970000, 2150000, 2340000, 2530000, 2720000, 2910000, 3100000, 3290000, 3480000, 3670000, 3860000, 4050000, 4240000, 4550000, 5050000, 5500000, 5500000, 5500000],
  6000000: [0, 600000, 800000, 1040000, 1300000, 1560000, 1740000, 1930000, 2120000, 2310000, 2510000, 2710000, 2910000, 3110000, 3310000, 3510000, 3710000, 3910000, 4110000, 4310000, 4510000, 4840000, 5450000, 6000000, 6000000, 6000000],
  6500000: [0, 650000, 860000, 1120000, 1400000, 1680000, 1870000, 2070000, 2270000, 2470000, 2680000, 2890000, 3100000, 3310000, 3520000, 3730000, 3940000, 4150000, 4360000, 4570000, 4780000, 5120000, 6050000, 6500000, 6500000, 6500000],
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
