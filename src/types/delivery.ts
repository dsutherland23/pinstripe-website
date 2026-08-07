// Smart Delivery Pricing & Rules Engine (Version 2.0) - Type Definitions

export type StrategyType = "fixed" | "free" | "distance" | "zones" | "dynamic" | "manual";

export interface FixedStrategyConfig {
  deliveryPrice: number;
  freePickupOption: boolean;
  maxRadius?: number; // in miles
  maxOrderValue?: number;
  maxItemCount?: number;
  minOrder?: number;
  activeDays?: string[]; // e.g. ["Monday", "Tuesday"]
  blackoutDates?: string[]; // YYYY-MM-DD
}

export interface FreeStrategyConfig {
  minOrderAmount: number;
  maxDistance: number; // in miles
  eligibleCategories?: string[];
  eligibleCustomers?: string[];
  vipOnly?: boolean;
  couponRequired?: boolean;
}

export interface DistanceStrategyConfig {
  mode: "flat" | "per_mile" | "per_km" | "travel_time" | "hybrid";
  baseFee: number;
  costPerMile: number;
  costPerMinute: number;
  maxRadius: number;
  freeRadius: number;
  minCharge: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  polygonMap?: [number, number][]; // lat/lng pairs
  zipCodes: string[];
  radius?: number;
  price: number;
  maxOrderSize?: number;
  maxWeight?: number;
  enabled: boolean;
  priority: number;
}

export interface Vehicle {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  baseCost: number;
  maxPoints: number;
  maxWeight: number; // lbs
  maxCubicFeet: number;
  maxItemCount: number;
  maxTentSize: number; // sq ft
  maxChairCount: number;
  maxTableCount: number;
  requiresCDL: boolean;
  notes?: string;
}

export interface LaborConfig {
  hourlyRate: number;
  minCharge: number;
  minHours: number;
  loadingMinutesPerPoint: number;
  unloadMinutesPerPoint: number;
  pickupMinutesPerPoint: number;
  setupMinutes: number;
  breakdownMinutes: number;
  additionalWorkerCost: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  emergencyMultiplier: number;
}

export interface TravelConfig {
  calculationMethod: "mileage" | "travel_time" | "hybrid" | "flat";
  baseFee: number;
  costPerMile: number;
  costPerMinute: number;
  minCharge: number;
  maxRadius: number;
  trafficMultiplier: number;
  rushHourMultiplier: number;
  bridgeToll: number;
  tunnelToll: number;
  congestionCharge: number;
  fuelSurcharge: number;
}

export interface HandlingFee {
  id: string;
  name: string; // e.g. "Elevator", "Stairs", "Basement", "Long Walk", "Rooftop", "Beach", "Grass Setup", "Sand Setup", "Dock Delivery", "Restricted Parking", "Night Delivery", "Weekend Delivery", "Holiday Delivery", "Weather Protection", "Fragile Equipment", "Large Tent", "Heavy Equipment"
  feeType: "flat" | "percentage" | "per_item" | "per_point";
  amount: number;
  enabled: boolean;
}

export interface ProductLogistics {
  deliveryPoints: number;
  weight: number; // in lbs
  volume: number; // in cu ft
  stackable: boolean;
  fragile: boolean;
  requiresDolly: boolean;
  requiresLiftGate: boolean;
  requiresForklift: boolean;
  requiresTwoWorkers: boolean;
  requiresThreeWorkers: boolean;
  vehicleOverride?: string; // vehicle ID if specific vehicle is required
  avgLoadingMinutes: number;
  avgUnloadingMinutes: number;
  avgSetupMinutes: number;
  avgBreakdownMinutes: number;
  installationRequired: boolean;
  pickupTime?: string;
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "contains"
  | "between"
  | "starts_with"
  | "ends_with"
  | "in_list"
  | "not_in_list";

export type ConditionField =
  | "orderTotal"
  | "rentalValue"
  | "itemCount"
  | "chairCount"
  | "tableCount"
  | "tentCount"
  | "deliveryDistance"
  | "travelTime"
  | "deliveryZone"
  | "customerType"
  | "couponUsed"
  | "bookingSource"
  | "eventType"
  | "eventDate"
  | "weekend"
  | "holiday"
  | "zipCode"
  | "deliveryAddress"
  | "productCategory"
  | "weight"
  | "volume"
  | "vehicleRequired"
  | "deliveryPoints"
  | "setupRequired"
  | "installationRequired"
  | "repeatCustomer"
  | "corporateAccount"
  | "vipCustomer"
  | "paymentMethod"
  | "manualApproval"
  | "weather"
  | "warehouse"
  | "inventoryAvailability"
  | string;

export interface RuleCondition {
  id?: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: any; // string, number, boolean, array
}

export interface RuleConditionGroup {
  id?: string;
  logic: "AND" | "OR";
  conditions: (RuleCondition | RuleConditionGroup)[];
}

export interface DeliveryRule {
  id: string;
  name: string;
  priority: number; // lower number = higher priority (evaluated first)
  enabled: boolean;
  strategyType: StrategyType;
  strategyId?: string;
  strategyConfigOverride?: any;
  expirationDate?: string;
  notes?: string;
  conditions: RuleConditionGroup;
}

export interface DeliveryStrategy {
  id: string;
  type: StrategyType;
  name: string;
  description: string;
  enabled: boolean;
  config: FixedStrategyConfig | FreeStrategyConfig | DistanceStrategyConfig | { zones: DeliveryZone[] } | Record<string, any>;
}

export interface DeliveryProfile {
  id: string;
  name: string; // e.g. "Standard Pricing", "Summer Pricing", "Winter Pricing", "Holiday Pricing", "Corporate Pricing", "Wedding Pricing", "Festival Pricing", "Emergency Pricing"
  active: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string;
  ruleIds?: string[];
}

export interface DeliveryAuditLog {
  id: string;
  user: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  reason: string;
  timestamp: string;
  ipAddress: string;
  versionNumber: number;
}

export interface DeliveryEngineConfig {
  /** 'smart' = Rules Engine evaluates rules/strategies. 'fixed' = ignores all rules and uses fixedDeliveryPrice. */
  pricingMode: "smart" | "fixed";
  fixedDeliveryPrice: number;   // used only when pricingMode === 'fixed'
  activeProfileId: string;
  profiles: DeliveryProfile[];
  rules: DeliveryRule[];
  strategies: DeliveryStrategy[];
  vehicles: Vehicle[];
  labor: LaborConfig;
  travel: TravelConfig;
  handling: HandlingFee[];
  zones: DeliveryZone[];
  versionNumber: number;
}

export interface DeliveryCalculationInput {
  items: Array<{
    id: string;
    quantity: number;
    title?: string;
    category?: string;
    price?: number;
    logistics?: Partial<ProductLogistics>;
  }>;
  orderTotal: number;
  deliveryDistanceMiles?: number;
  travelTimeMinutes?: number;
  deliveryAddress?: string;
  zipCode?: string;
  city?: string;
  eventDate?: string; // YYYY-MM-DD
  eventType?: string;
  venueType?: string; // residential | commercial | park | school | beach
  customerType?: "standard" | "vip" | "corporate" | "repeat";
  couponCode?: string;
  handlingOptions?: string[]; // IDs of selected handling fees like "stairs", "elevator"
  bookingSource?: string;
  paymentMethod?: string;
  manualOverrideFee?: number;
  manualOverrideReason?: string;
}

export interface DeliveryCalculationResult {
  selectedRuleId: string | null;
  selectedRuleName: string;
  selectedStrategy: StrategyType;
  totalDeliveryFee: number;
  isManualQuote: boolean;
  vehicle: {
    id: string;
    name: string;
    baseCost: number;
  } | null;
  breakdown: {
    vehicleCost: number;
    travelCost: number;
    laborCost: number;
    handlingCost: number;
    optionalServicesCost: number;
  };
  messages: string[];
  warnings: string[];
  errors: string[];
  calculationTimeMs: number;
}
