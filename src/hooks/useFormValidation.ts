import { useState, useCallback } from "react";

export interface FieldErrors {
  [key: string]: string | undefined;
}

/** Format phone number as (XXX) XXX-XXXX while typing */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Validate a single field and return error message or undefined */
export function validateField(name: string, value: string, extra?: { city?: string }): string | undefined {
  switch (name) {
    case "firstName":
      if (!value.trim()) return "First name is required";
      if (value.trim().length < 2) return "First name must be at least 2 characters";
      return undefined;

    case "lastName":
      if (!value.trim()) return "Last name is required";
      if (value.trim().length < 2) return "Last name must be at least 2 characters";
      return undefined;

    case "email":
      if (!value.trim()) return "Email address is required";
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim()))
        return "Please enter a valid email address";
      return undefined;

    case "phone": {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Phone number is required";
      if (digits.length < 10) return "Please enter a valid 10-digit phone number";
      return undefined;
    }

    case "address":
      if (!value.trim()) return "Delivery address is required";
      if (value.trim().length < 5) return "Please enter a complete address";
      return undefined;

    case "zipCode":
      if (!value.trim()) return "Zip code is required";
      if (!/^\d{5}(-\d{4})?$/.test(value.trim())) return "Please enter a valid 5-digit zip code";
      return undefined;

    case "eventDate": {
      if (!value.trim()) return "Event date is required";
      const date = new Date(value + "T12:00:00");
      if (isNaN(date.getTime())) return "Invalid date";
      const now = new Date();
      const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      if (date < minDate) return "Must be at least 48 hours from now";
      if (date > maxDate) return "Must be within the next 12 months";
      return undefined;
    }

    case "guestCount": {
      const n = parseInt(value, 10);
      if (!value.trim() || isNaN(n)) return "Guest count is required";
      if (n < 1) return "Must be at least 1 guest";
      if (n > 2000) return "Maximum 2,000 guests";
      return undefined;
    }

    case "customCity":
      if (extra?.city === "Other" && !value.trim()) return "Please specify your city";
      return undefined;

    default:
      return undefined;
  }
}

/** Validate all fields for a specific step */
export function validateStep(
  step: number,
  values: Record<string, string>,
  selectedItemCount: number
): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 1) {
    const dateErr = validateField("eventDate", values.eventDate || "");
    if (dateErr) errors.eventDate = dateErr;

    const guestErr = validateField("guestCount", values.guestCount || "");
    if (guestErr) errors.guestCount = guestErr;
  }

  if (step === 2) {
    if (selectedItemCount === 0) {
      errors.selectedItems = "Please select at least one rental item";
    }
  }

  if (step === 3) {
    for (const field of ["firstName", "lastName", "email", "phone", "address", "zipCode"]) {
      const err = validateField(field, values[field] || "");
      if (err) errors[field] = err;
    }
    const customCityErr = validateField("customCity", values.customCity || "", { city: values.city });
    if (customCityErr) errors.customCity = customCityErr;
  }

  return errors;
}

/** React hook for form validation state management */
export function useFormValidation() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const setError = useCallback((field: string, message: string | undefined) => {
    setErrors((prev) => {
      if (message === undefined) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const validateOnBlur = useCallback(
    (name: string, value: string, extra?: { city?: string }) => {
      markTouched(name);
      const err = validateField(name, value, extra);
      setError(name, err);
    },
    [markTouched, setError]
  );

  const validateStepFields = useCallback(
    (step: number, values: Record<string, string>, selectedItemCount: number): boolean => {
      const stepErrors = validateStep(step, values, selectedItemCount);
      setErrors((prev) => ({ ...prev, ...stepErrors }));

      // Mark all errored fields as touched
      Object.keys(stepErrors).forEach((field) => {
        setTouched((prev) => new Set(prev).add(field));
      });

      return Object.keys(stepErrors).length === 0;
    },
    []
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    touched,
    setError,
    clearError,
    clearAllErrors,
    markTouched,
    validateOnBlur,
    validateStepFields,
    isValid,
  };
}
