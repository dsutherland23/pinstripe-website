export interface RentalItem {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  depositAmount: number;
  availability: boolean;
  dimensions: string;
  capacity: string;
  image: string;
  rating: number;
  reviews: number;
  stock?: number;
}

export const mockInventory: RentalItem[] = [
  {
    id: "1",
    title: "Adventure 5-in-1 Inflatable Water Park",
    category: "Water Slides",
    description:
      "The ultimate water play adventure! Features dual racing slides, climbing wall, water cannons, sprinkler arch, splash pool, and integrated sports play zone.",
    price: 350,
    depositAmount: 100,
    availability: true,
    dimensions: "18ft L × 16ft W × 10ft H",
    capacity: "Up to 8 Kids",
    image: "/images/water-slide-1.png",
    rating: 4.9,
    reviews: 42,
  },
  {
    id: "2",
    title: "Premium White Fan-Back Folding Chair",
    category: "Chairs",
    description:
      "Heavy-duty commercial folding chairs in a sleek fan-back style — perfect for weddings, birthdays, banquets and outdoor corporate gatherings.",
    price: 2.5,
    depositAmount: 0.5,
    availability: true,
    dimensions: "Standard fold",
    capacity: "Up to 300 lbs",
    image: "/images/folding-chair.png",
    rating: 4.8,
    reviews: 120,
  },
  {
    id: "3",
    title: "Red Cotton Candy Cart",
    category: "Cotton Candy Machines",
    description:
      "Professional high-yield cotton candy maker on a mobile trolley. Adds nostalgic joy and sweet treats to any event.",
    price: 85,
    depositAmount: 25,
    availability: true,
    dimensions: "36″ × 24″ × 42″",
    capacity: "120 Cones / hr",
    image: "/images/logo.jpg",
    rating: 4.9,
    reviews: 28,
  },
  {
    id: "4",
    title: "Summer Waves Double-Slide Splash Kingdom",
    category: "Bounce Houses",
    description:
      "Multi-activity inflatable bounce kingdom with safety netting, basketball hoop, giant splash pool and automatic water bucket drop.",
    price: 295,
    depositAmount: 80,
    availability: true,
    dimensions: "16ft L × 14ft W × 9ft H",
    capacity: "Up to 6 Kids",
    image: "/images/water-slide-2.png",
    rating: 4.7,
    reviews: 19,
  },
  {
    id: "5",
    title: "High-Peak Elegance Canopy Tent",
    category: "Tents",
    description:
      "Stunning professional high-peak tent — perfect for outdoor wedding receptions, corporate dinners, or milestone celebrations.",
    price: 450,
    depositAmount: 150,
    availability: true,
    dimensions: "20ft × 30ft",
    capacity: "Up to 80 seated",
    image: "/images/canopy-tent.png",
    rating: 4.9,
    reviews: 31,
  },
  {
    id: "6",
    title: "Round Banqueting Table (60-inch)",
    category: "Tables",
    description:
      "Premium heavy-duty round tables built for high-end dining setups. Seats 8–10 guests comfortably under our event tents.",
    price: 18,
    depositAmount: 5,
    availability: true,
    dimensions: "60-inch diameter",
    capacity: "8–10 Guests",
    image: "/images/banquet-table.png",
    rating: 4.8,
    reviews: 75,
  },
  {
    id: "7",
    title: "Theatre-Style Popcorn Maker",
    category: "Popcorn Machines",
    description:
      "Fresh, hot popcorn in minutes! Comes with a stand and all starter ingredients (corn, oil, butter salt).",
    price: 75,
    depositAmount: 20,
    availability: true,
    dimensions: "18″ × 18″ × 30″",
    capacity: "8 oz Kettle",
    image: "/images/popcorn-machine.png",
    rating: 4.8,
    reviews: 34,
  },
  {
    id: "8",
    title: "Interactive Open-Air Photo Booth",
    category: "Photo Booths",
    description:
      "Fully digital touchscreen booth with instant SMS / email delivery, custom frames, props, and green screen backdrop.",
    price: 350,
    depositAmount: 100,
    availability: true,
    dimensions: "Needs 6 × 6 ft area",
    capacity: "Unlimited sharing",
    image: "/images/photo-booth.png",
    rating: 5,
    reviews: 53,
  },
  {
    id: "9",
    title: "Professional Snow-cone Machine",
    category: "Snow-cone Machines",
    description:
      "High-yield commercial-grade snow-cone shaver. Easy to operate and produces perfectly crushed ice for cool summer treats.",
    price: 75,
    depositAmount: 20,
    availability: true,
    dimensions: "16″ × 16″ × 24″",
    capacity: "120 Cones / hr",
    image: "/images/kids-snowcones.png",
    rating: 4.8,
    reviews: 15,
    stock: 5,
  },
  {
    id: "10",
    title: "Cotton Candy Kit (50 Servings)",
    category: "Products",
    description: "Sweet cotton candy sugar floss and cones — yields approximately 50 servings. Works perfectly with our cotton candy makers.",
    price: 20,
    depositAmount: 5,
    availability: true,
    dimensions: "N/A",
    capacity: "50 Servings",
    image: "/images/kids-cotton-candy.png",
    rating: 4.8,
    reviews: 12,
    stock: 100
  },
  {
    id: "11",
    title: "Popcorn Kit (50 Servings)",
    category: "Products",
    description: "Theatre-style popcorn kits including gourmet kernels, coconut oil, and seasoning salt — yields approximately 50 servings.",
    price: 18,
    depositAmount: 5,
    availability: true,
    dimensions: "N/A",
    capacity: "50 Servings",
    image: "/images/popcorn-machine.png",
    rating: 4.9,
    reviews: 18,
    stock: 100
  },
  {
    id: "12",
    title: "Snow-cone Kit (50 Servings)",
    category: "Products",
    description: "Premium snow-cone syrups and cups — yields approximately 50 cool, refreshing servings.",
    price: 20,
    depositAmount: 5,
    availability: true,
    dimensions: "N/A",
    capacity: "50 Servings",
    image: "/images/kids-snowcones.png",
    rating: 4.7,
    reviews: 9,
    stock: 100
  },
  {
    id: "13",
    title: "Equipment Stand",
    category: "Products",
    description: "Heavy-duty mobile equipment stand designed to hold and showcase our concession machinery.",
    price: 25,
    depositAmount: 5,
    availability: true,
    dimensions: "Standard stand",
    capacity: "Fits Concessions",
    image: "/images/kids-concessions.png",
    rating: 4.8,
    reviews: 15,
    stock: 10
  },
  {
    id: "14",
    title: "Additional Rental Hour",
    category: "Products",
    description: "Additional hourly service/rental time for concession machinery.",
    price: 15,
    depositAmount: 0,
    availability: true,
    dimensions: "N/A",
    capacity: "1 Hour",
    image: "/images/logo.jpg",
    rating: 4.8,
    reviews: 5,
    stock: 100
  }
];
