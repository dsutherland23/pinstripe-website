/**
 * Input Sanitization Utilities
 * Protects against XSS, HTML injection, and ensures data integrity
 */

/** Strip all HTML tags and script content from a string */
export function sanitizeInput(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // remove script tags + content
    .replace(/<[^>]*>/g, "")  // remove all HTML tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/** Escape HTML special characters for safe display */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

/** Validate US phone number (10 digits) */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

/** Validate US zip code */
export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

/** Validate date is at least 48 hours in the future and within 1 year */
export function isValidFutureDate(dateStr: string): { valid: boolean; reason?: string } {
  const date = new Date(dateStr + "T12:00:00");
  if (isNaN(date.getTime())) return { valid: false, reason: "Invalid date format" };

  const now = new Date();
  const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  if (date < minDate) return { valid: false, reason: "Date must be at least 48 hours from now" };
  if (date > maxDate) return { valid: false, reason: "Date must be within the next year" };

  return { valid: true };
}

/** Quote submission payload type */
export interface QuotePayload {
  eventType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: string;
  selectedItems: Record<string, number>;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  customCity: string;
  zipCode: string;
  notes: string;
  paymentMethod: string;
  estimatedTotal: number;
}

/** Sanitize and validate entire quote payload. Returns errors map or null if valid. */
export function validateQuotePayload(data: QuotePayload): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // Required text fields
  if (!data.firstName?.trim()) errors.firstName = "First name is required";
  if (!data.lastName?.trim()) errors.lastName = "Last name is required";
  if (!data.address?.trim()) errors.address = "Delivery address is required";
  if (!data.zipCode?.trim()) errors.zipCode = "Zip code is required";

  // Email
  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Phone
  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(data.phone)) {
    errors.phone = "Please enter a valid 10-digit US phone number";
  }

  // Zip
  if (data.zipCode?.trim() && !isValidZip(data.zipCode)) {
    errors.zipCode = "Please enter a valid 5-digit US zip code";
  }

  // Date
  if (!data.eventDate?.trim()) {
    errors.eventDate = "Event date is required";
  } else {
    const dateCheck = isValidFutureDate(data.eventDate);
    if (!dateCheck.valid) {
      errors.eventDate = dateCheck.reason || "Invalid date";
    }
  }

  // Guest count
  const guests = parseInt(data.guestCount, 10);
  if (isNaN(guests) || guests < 1) {
    errors.guestCount = "Guest count must be at least 1";
  } else if (guests > 2000) {
    errors.guestCount = "Guest count cannot exceed 2,000";
  }

  // Items
  if (!data.selectedItems || Object.keys(data.selectedItems).length === 0) {
    errors.selectedItems = "Please select at least one rental item";
  }

  // City (if "Other")
  if (data.city === "Other" && !data.customCity?.trim()) {
    errors.customCity = "Please specify your city";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/** Sanitize all string fields in a quote payload */
export function sanitizeQuotePayload(data: QuotePayload): QuotePayload {
  return {
    eventType: sanitizeInput(data.eventType || ""),
    eventDate: sanitizeInput(data.eventDate || ""),
    eventLocation: sanitizeInput(data.eventLocation || ""),
    guestCount: sanitizeInput(data.guestCount || ""),
    selectedItems: data.selectedItems || {},
    firstName: sanitizeInput(data.firstName || ""),
    lastName: sanitizeInput(data.lastName || ""),
    email: sanitizeInput(data.email || "").toLowerCase(),
    phone: sanitizeInput(data.phone || ""),
    address: sanitizeInput(data.address || ""),
    city: sanitizeInput(data.city || ""),
    customCity: sanitizeInput(data.customCity || ""),
    zipCode: sanitizeInput(data.zipCode || ""),
    notes: sanitizeInput(data.notes || ""),
    paymentMethod: sanitizeInput(data.paymentMethod || ""),
    estimatedTotal: typeof data.estimatedTotal === "number" ? data.estimatedTotal : 0,
  };
}
