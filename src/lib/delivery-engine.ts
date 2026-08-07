import {
  DeliveryCalculationInput,
  DeliveryCalculationResult,
  DeliveryEngineConfig,
  DeliveryRule,
  RuleCondition,
  RuleConditionGroup,
  Vehicle,
  LaborConfig,
  TravelConfig,
  HandlingFee,
  DeliveryZone,
  FixedStrategyConfig,
  FreeStrategyConfig,
  DistanceStrategyConfig,
  ProductLogistics
} from "@/types/delivery";

// Default Fallback Logistics for items without explicit metadata
export const DEFAULT_PRODUCT_LOGISTICS: ProductLogistics = {
  deliveryPoints: 5,
  weight: 25,
  volume: 10,
  stackable: true,
  fragile: false,
  requiresDolly: false,
  requiresLiftGate: false,
  requiresForklift: false,
  requiresTwoWorkers: false,
  requiresThreeWorkers: false,
  avgLoadingMinutes: 5,
  avgUnloadingMinutes: 5,
  avgSetupMinutes: 10,
  avgBreakdownMinutes: 10,
  installationRequired: false
};

/**
 * Helper to check if a condition group or condition matches the input
 */
export function evaluateConditionGroup(
  group: RuleConditionGroup,
  input: DeliveryCalculationInput,
  itemStats: {
    itemCount: number;
    chairCount: number;
    tableCount: number;
    tentCount: number;
    totalWeight: number;
    totalVolume: number;
    totalPoints: number;
    hasTent: boolean;
    setupRequired: boolean;
    installationRequired: boolean;
    categories: string[];
  }
): boolean {
  if (!group || !group.conditions || group.conditions.length === 0) {
    return true;
  }

  const logic = group.logic || "AND";

  if (logic === "AND") {
    return group.conditions.every(c => evaluateConditionItem(c, input, itemStats));
  } else {
    return group.conditions.some(c => evaluateConditionItem(c, input, itemStats));
  }
}

function evaluateConditionItem(
  cond: RuleCondition | RuleConditionGroup,
  input: DeliveryCalculationInput,
  itemStats: any
): boolean {
  if ("logic" in cond && Array.isArray((cond as RuleConditionGroup).conditions)) {
    return evaluateConditionGroup(cond as RuleConditionGroup, input, itemStats);
  }

  const condition = cond as RuleCondition;
  const fieldValue = extractFieldValue(condition.field, input, itemStats);
  return compareValue(fieldValue, condition.operator, condition.value);
}

function extractFieldValue(field: string, input: DeliveryCalculationInput, itemStats: any): any {
  const isWeekend = (() => {
    if (!input.eventDate) return false;
    const date = new Date(input.eventDate);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  })();

  switch (field) {
    case "orderTotal":
    case "rentalValue":
      return input.orderTotal || 0;
    case "itemCount":
      return itemStats.itemCount || 0;
    case "chairCount":
      return itemStats.chairCount || 0;
    case "tableCount":
      return itemStats.tableCount || 0;
    case "tentCount":
      return itemStats.tentCount || 0;
    case "deliveryDistance":
      return input.deliveryDistanceMiles || 0;
    case "travelTime":
      return input.travelTimeMinutes || 0;
    case "zipCode":
      return input.zipCode || "";
    case "deliveryAddress":
      return input.deliveryAddress || "";
    case "city":
      return input.city || "";
    case "customerType":
      return input.customerType || "standard";
    case "couponUsed":
      return Boolean(input.couponCode);
    case "bookingSource":
      return input.bookingSource || "web";
    case "eventType":
      return input.eventType || "";
    case "eventDate":
      return input.eventDate || "";
    case "weekend":
      return isWeekend;
    case "weight":
      return itemStats.totalWeight || 0;
    case "volume":
      return itemStats.totalVolume || 0;
    case "deliveryPoints":
      return itemStats.totalPoints || 0;
    case "setupRequired":
      return itemStats.setupRequired;
    case "installationRequired":
      return itemStats.installationRequired;
    case "repeatCustomer":
      return input.customerType === "repeat";
    case "corporateAccount":
      return input.customerType === "corporate";
    case "vipCustomer":
      return input.customerType === "vip";
    case "productCategory":
      return itemStats.categories;
    default:
      return (input as any)[field] ?? null;
  }
}

function compareValue(actual: any, operator: string, target: any): boolean {
  if (actual === undefined || actual === null) {
    if (operator === "not_equals") return true;
    return false;
  }

  switch (operator) {
    case "equals":
      if (typeof actual === "boolean") return actual === Boolean(target);
      return String(actual).toLowerCase() === String(target).toLowerCase();
    case "not_equals":
      return String(actual).toLowerCase() !== String(target).toLowerCase();
    case "greater_than":
      return Number(actual) > Number(target);
    case "less_than":
      return Number(actual) < Number(target);
    case "contains":
      if (Array.isArray(actual)) {
        return actual.some(a => String(a).toLowerCase().includes(String(target).toLowerCase()));
      }
      return String(actual).toLowerCase().includes(String(target).toLowerCase());
    case "starts_with":
      return String(actual).toLowerCase().startsWith(String(target).toLowerCase());
    case "ends_with":
      return String(actual).toLowerCase().endsWith(String(target).toLowerCase());
    case "between":
      if (Array.isArray(target) && target.length === 2) {
        const num = Number(actual);
        return num >= Number(target[0]) && num <= Number(target[1]);
      }
      return false;
    case "in_list":
      if (Array.isArray(target)) {
        return target.some(t => String(t).toLowerCase() === String(actual).toLowerCase());
      }
      if (typeof target === "string") {
        const list = target.split(",").map(s => s.trim().toLowerCase());
        return list.includes(String(actual).toLowerCase());
      }
      return false;
    case "not_in_list":
      return !compareValue(actual, "in_list", target);
    default:
      return false;
  }
}

/**
 * Main Calculation Engine Entry Point
 */
export function calculateDeliveryFee(
  input: DeliveryCalculationInput,
  config: DeliveryEngineConfig
): DeliveryCalculationResult {
  const startTime = performance.now();
  const messages: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check manual staff override first
  if (input.manualOverrideFee !== undefined && input.manualOverrideFee !== null) {
    const elapsedMs = Math.round(performance.now() - startTime);
    return {
      selectedRuleId: "manual-override",
      selectedRuleName: "Staff Manual Override",
      selectedStrategy: "manual",
      totalDeliveryFee: Math.max(0, Number(input.manualOverrideFee)),
      isManualQuote: false,
      vehicle: null,
      breakdown: {
        vehicleCost: 0,
        travelCost: 0,
        laborCost: 0,
        handlingCost: 0,
        optionalServicesCost: 0
      },
      messages: [`Delivery fee manually set to $${Number(input.manualOverrideFee).toFixed(2)}. Reason: ${input.manualOverrideReason || 'Not specified'}`],
      warnings: [],
      errors: [],
      calculationTimeMs: elapsedMs
    };
  }

  // ── FIXED PRICE MODE ──────────────────────────────────────────────────────────
  // When pricingMode is 'fixed', skip all rule/strategy evaluation.
  // A flat delivery price is charged for everyone, but venue handling add-ons
  // (stairs, elevator, long walk, surface type) are still added on top.
  if (config.pricingMode === "fixed") {
    const flatBase = Math.max(0, config.fixedDeliveryPrice ?? 45);
    let handlingCost = 0;
    const handlingMessages: string[] = [];
    const handlingFees = config.handling || [];
    for (const hId of (input.handlingOptions || [])) {
      const feeObj = handlingFees.find(h => h.id === hId && h.enabled);
      if (feeObj) {
        handlingCost += feeObj.amount;
        handlingMessages.push(`${feeObj.name}: +$${feeObj.amount}`);
      }
    }
    handlingCost = Math.round(handlingCost * 100) / 100;
    const totalFee = Math.round((flatBase + handlingCost) * 100) / 100;
    const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      selectedRuleId: "fixed-price-mode",
      selectedRuleName: "Fixed Price Mode",
      selectedStrategy: "fixed",
      totalDeliveryFee: totalFee,
      isManualQuote: false,
      vehicle: null,
      breakdown: {
        vehicleCost: 0,
        travelCost: 0,
        laborCost: 0,
        handlingCost,
        optionalServicesCost: 0
      },
      messages: [`Fixed delivery price of $${flatBase.toFixed(2)} applied.`, ...handlingMessages],
      warnings: [],
      errors: [],
      calculationTimeMs: elapsedMs
    };
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Aggregate cart item statistics
  let itemCount = 0;
  let chairCount = 0;
  let tableCount = 0;
  let tentCount = 0;
  let maxTentSize = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  let totalPoints = 0;
  let totalLoadingMins = 0;
  let totalUnloadingMins = 0;
  let totalSetupMins = 0;
  let totalBreakdownMins = 0;
  let hasTent = false;
  let setupRequired = false;
  let installationRequired = false;
  const categoriesSet = new Set<string>();

  for (const item of input.items || []) {
    const qty = item.quantity || 1;
    itemCount += qty;

    const category = (item.category || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    categoriesSet.add(category);

    if (category.includes("chair") || title.includes("chair")) {
      chairCount += qty;
    }
    if (category.includes("table") || title.includes("table")) {
      tableCount += qty;
    }
    if (category.includes("tent") || title.includes("tent") || category.includes("inflatable") || title.includes("bounce")) {
      tentCount += qty;
      hasTent = true;
      maxTentSize = Math.max(maxTentSize, 400 * qty); // estimate sq ft
    }

    const logistics: ProductLogistics = {
      ...DEFAULT_PRODUCT_LOGISTICS,
      ...(item.logistics || {})
    };

    totalWeight += logistics.weight * qty;
    totalVolume += logistics.volume * qty;
    totalPoints += logistics.deliveryPoints * qty;
    totalLoadingMins += logistics.avgLoadingMinutes * qty;
    totalUnloadingMins += logistics.avgUnloadingMinutes * qty;
    totalSetupMins += logistics.avgSetupMinutes * qty;
    totalBreakdownMins += logistics.avgBreakdownMinutes * qty;

    if (logistics.installationRequired) installationRequired = true;
    if (logistics.avgSetupMinutes > 0) setupRequired = true;
  }

  const itemStats = {
    itemCount,
    chairCount,
    tableCount,
    tentCount,
    maxTentSize,
    totalWeight,
    totalVolume,
    totalPoints,
    totalLoadingMins,
    totalUnloadingMins,
    totalSetupMins,
    totalBreakdownMins,
    hasTent,
    setupRequired,
    installationRequired,
    categories: Array.from(categoriesSet)
  };

  // Find active profile and active rules sorted by priority (lowest number = highest priority)
  const activeProfile = config.profiles.find(p => p.id === config.activeProfileId) || config.profiles[0];
  let availableRules = (config.rules || []).filter(r => r.enabled);

  if (activeProfile && activeProfile.ruleIds && activeProfile.ruleIds.length > 0) {
    availableRules = availableRules.filter(r => activeProfile.ruleIds!.includes(r.id));
  }

  availableRules.sort((a, b) => a.priority - b.priority);

  // Evaluate rules from top to bottom
  let matchedRule: DeliveryRule | null = null;
  for (const rule of availableRules) {
    if (rule.expirationDate) {
      const exp = new Date(rule.expirationDate);
      if (!isNaN(exp.getTime()) && exp < new Date()) {
        continue; // Expired rule
      }
    }

    if (evaluateConditionGroup(rule.conditions, input, itemStats)) {
      matchedRule = rule;
      break;
    }
  }

  // Fallback rule if no rule matches
  if (!matchedRule) {
    matchedRule = {
      id: "default-dynamic",
      name: "Default Dynamic Engine",
      priority: 999,
      enabled: true,
      strategyType: "dynamic",
      conditions: { logic: "AND", conditions: [] }
    };
  }

  messages.push(`Matched Rule: "${matchedRule.name}" (Strategy: ${matchedRule.strategyType})`);

  // Execute strategy associated with matched rule
  let resultFee = 0;
  let isManualQuote = false;
  let assignedVehicle: Vehicle | null = null;
  let vehicleCost = 0;
  let travelCost = 0;
  let laborCost = 0;
  let handlingCost = 0;
  let optionalServicesCost = 0;

  // Calculate handling cost from selected options across ALL strategies
  const handlingFees = config.handling || [];
  const selectedHandling = input.handlingOptions || [];
  for (const hId of selectedHandling) {
    const feeObj = handlingFees.find(h => h.id === hId && h.enabled);
    if (feeObj) {
      handlingCost += feeObj.amount;
    }
  }
  handlingCost = Math.round(handlingCost * 100) / 100;

  switch (matchedRule.strategyType) {
    case "free": {
      resultFee = handlingCost; // Free base delivery; handling add-ons still apply if selected
      messages.push(`Free delivery strategy applied${handlingCost > 0 ? ` (+ $${handlingCost.toFixed(2)} handling)` : ""}.`);
      break;
    }
    case "fixed": {
      const strat = config.strategies.find(s => s.type === "fixed")?.config as FixedStrategyConfig;
      const baseFixed = strat?.deliveryPrice ?? 45;
      resultFee = Math.round((baseFixed + handlingCost) * 100) / 100;
      messages.push(`Fixed delivery fee of $${baseFixed.toFixed(2)} applied${handlingCost > 0 ? ` + $${handlingCost.toFixed(2)} handling` : ""}.`);
      break;
    }
    case "distance": {
      const distanceConfig = (config.strategies.find(s => s.type === "distance")?.config as DistanceStrategyConfig) || {
        mode: "hybrid",
        baseFee: 25,
        costPerMile: 1.5,
        costPerMinute: 0.5,
        maxRadius: 60,
        freeRadius: 5,
        minCharge: 35
      };

      const dist = input.deliveryDistanceMiles || 15;
      const time = input.travelTimeMinutes || Math.round(dist * 2);
      const billableDist = Math.max(0, dist - distanceConfig.freeRadius);

      let distFee = distanceConfig.baseFee + (billableDist * distanceConfig.costPerMile) + (time * distanceConfig.costPerMinute);
      distFee = Math.max(distanceConfig.minCharge, distFee);
      travelCost = Math.round(distFee * 100) / 100;
      resultFee = Math.round((travelCost + handlingCost) * 100) / 100;
      messages.push(`Distance pricing calculated ($${travelCost.toFixed(2)} for ${dist} mi${handlingCost > 0 ? ` + $${handlingCost.toFixed(2)} handling` : ""}).`);
      break;
    }
    case "zones": {
      const zones = config.zones.filter(z => z.enabled).sort((a, b) => a.priority - b.priority);
      let matchedZone: DeliveryZone | null = null;

      if (input.zipCode) {
        matchedZone = zones.find(z => z.zipCodes.includes(input.zipCode!)) || null;
      }
      if (!matchedZone && input.deliveryDistanceMiles) {
        matchedZone = zones.find(z => z.radius && input.deliveryDistanceMiles! <= z.radius) || null;
      }
      if (!matchedZone && zones.length > 0) {
        matchedZone = zones[0];
      }

      const zoneBase = matchedZone ? matchedZone.price : 50;
      resultFee = Math.round((zoneBase + handlingCost) * 100) / 100;
      messages.push(`Delivery Zone "${matchedZone ? matchedZone.name : "Default"}" price applied ($${zoneBase.toFixed(2)}${handlingCost > 0 ? ` + $${handlingCost.toFixed(2)} handling` : ""}).`);
      break;
    }
    case "manual": {
      resultFee = 0;
      isManualQuote = true;
      messages.push("Order requires manual delivery quote from staff.");
      break;
    }
    case "dynamic":
    default: {
      // 1. Vehicle Selection
      const activeVehicles = config.vehicles.filter(v => v.enabled).sort((a, b) => a.priority - b.priority);
      assignedVehicle = activeVehicles.find(v => (
        totalPoints <= v.maxPoints &&
        totalWeight <= v.maxWeight &&
        totalVolume <= v.maxCubicFeet &&
        itemCount <= v.maxItemCount &&
        chairCount <= v.maxChairCount &&
        tableCount <= v.maxTableCount
      )) || activeVehicles[activeVehicles.length - 1] || {
        id: "van-1",
        name: "Standard Cargo Van",
        enabled: true,
        priority: 1,
        baseCost: 45,
        maxPoints: 75,
        maxWeight: 1500,
        maxCubicFeet: 200,
        maxItemCount: 50,
        maxTentSize: 400,
        maxChairCount: 100,
        maxTableCount: 20,
        requiresCDL: false
      };

      vehicleCost = assignedVehicle.baseCost;

      // 2. Travel Module
      const travel = config.travel || {
        calculationMethod: "hybrid",
        baseFee: 15,
        costPerMile: 1.5,
        costPerMinute: 0.4,
        minCharge: 25,
        maxRadius: 60,
        trafficMultiplier: 1.15,
        rushHourMultiplier: 1.25,
        bridgeToll: 0,
        tunnelToll: 0,
        congestionCharge: 0,
        fuelSurcharge: 5
      };

      const distMiles = input.deliveryDistanceMiles || 15;
      const timeMins = input.travelTimeMinutes || Math.round(distMiles * 2);

      let rawTravel = travel.baseFee + (distMiles * travel.costPerMile) + (timeMins * travel.costPerMinute);
      rawTravel = Math.max(travel.minCharge, rawTravel);
      rawTravel += travel.bridgeToll + travel.tunnelToll + travel.congestionCharge + travel.fuelSurcharge;
      travelCost = Math.round(rawTravel * 100) / 100;

      // 3. Labor Module
      const labor = config.labor || {
        hourlyRate: 25,
        minCharge: 40,
        minHours: 1,
        loadingMinutesPerPoint: 0.5,
        unloadMinutesPerPoint: 0.5,
        pickupMinutesPerPoint: 0.5,
        setupMinutes: 15,
        breakdownMinutes: 15,
        additionalWorkerCost: 20,
        weekendMultiplier: 1.2,
        holidayMultiplier: 1.5,
        emergencyMultiplier: 1.5
      };

      const totalLaborMins = (totalPoints * labor.loadingMinutesPerPoint) +
        (totalPoints * labor.unloadMinutesPerPoint) +
        totalSetupMins + totalBreakdownMins;
      const laborHours = Math.max(labor.minHours, totalLaborMins / 60);

      const isWeekend = (() => {
        if (!input.eventDate) return false;
        const d = new Date(input.eventDate).getDay();
        return d === 0 || d === 6;
      })();

      const multiplier = isWeekend ? labor.weekendMultiplier : 1.0;
      laborCost = Math.round((laborHours * labor.hourlyRate * multiplier) * 100) / 100;
      laborCost = Math.max(labor.minCharge, laborCost);

      // Total Dynamic Fee
      resultFee = Math.round((vehicleCost + travelCost + laborCost + handlingCost + optionalServicesCost) * 100) / 100;
      messages.push(`Dynamic Delivery calculated (Vehicle: $${vehicleCost}, Travel: $${travelCost}, Labor: $${laborCost}, Handling: $${handlingCost}).`);
      break;
    }
  }

  const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    selectedRuleId: matchedRule.id,
    selectedRuleName: matchedRule.name,
    selectedStrategy: matchedRule.strategyType,
    totalDeliveryFee: resultFee,
    isManualQuote,
    vehicle: assignedVehicle ? {
      id: assignedVehicle.id,
      name: assignedVehicle.name,
      baseCost: assignedVehicle.baseCost
    } : null,
    breakdown: {
      vehicleCost,
      travelCost,
      laborCost,
      handlingCost,
      optionalServicesCost
    },
    messages,
    warnings,
    errors,
    calculationTimeMs: elapsedMs
  };
}
