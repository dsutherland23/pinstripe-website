import { NextResponse } from "next/server";

// Local Hampton Roads Virginia Address & ZIP Code Database for instant offline/resilient autocomplete
const LOCAL_VIRGINIA_ADDRESSES = [
  { street: "Atlantic Ave", city: "Virginia Beach", zip: "23451", lat: 36.8529, lon: -75.9780 },
  { street: "Pacific Ave", city: "Virginia Beach", zip: "23451", lat: 36.8540, lon: -75.9785 },
  { street: "Virginia Beach Blvd", city: "Virginia Beach", zip: "23452", lat: 36.8500, lon: -76.0200 },
  { street: "Lynnhaven Pkwy", city: "Virginia Beach", zip: "23452", lat: 36.8200, lon: -76.0800 },
  { street: "Independence Blvd", city: "Virginia Beach", zip: "23455", lat: 36.8400, lon: -76.1300 },
  { street: "Princess Anne Rd", city: "Virginia Beach", zip: "23456", lat: 36.7800, lon: -76.0500 },
  { street: "Shore Dr", city: "Virginia Beach", zip: "23455", lat: 36.9100, lon: -76.1000 },
  { street: "Granby St", city: "Norfolk", zip: "23510", lat: 36.8500, lon: -76.2850 },
  { street: "Colley Ave", city: "Norfolk", zip: "23507", lat: 36.8700, lon: -76.2900 },
  { street: "Brambleton Ave", city: "Norfolk", zip: "23510", lat: 36.8530, lon: -76.2800 },
  { street: "Tidewater Dr", city: "Norfolk", zip: "23509", lat: 36.8800, lon: -76.2600 },
  { street: "Greenbrier Pkwy", city: "Chesapeake", zip: "23320", lat: 36.7800, lon: -76.2400 },
  { street: "Battlefield Blvd", city: "Chesapeake", zip: "23322", lat: 36.7200, lon: -76.2300 },
  { street: "Western Branch Blvd", city: "Chesapeake", zip: "23321", lat: 36.8400, lon: -76.4000 },
  { street: "High St", city: "Portsmouth", zip: "23704", lat: 36.8350, lon: -76.3000 },
  { street: "Portsmouth Blvd", city: "Portsmouth", zip: "23701", lat: 36.8200, lon: -76.3500 },
  { street: "Bridge Rd", city: "Suffolk", zip: "23435", lat: 36.8700, lon: -76.4500 },
  { street: "Main St", city: "Suffolk", zip: "23434", lat: 36.7300, lon: -76.5800 },
  { street: "Jefferson Ave", city: "Newport News", zip: "23601", lat: 37.0500, lon: -76.4800 },
  { street: "Warwick Blvd", city: "Newport News", zip: "23607", lat: 37.0000, lon: -76.4400 },
  { street: "Mercury Blvd", city: "Hampton", zip: "23669", lat: 37.0300, lon: -76.3600 },
  { street: "Coliseum Dr", city: "Hampton", zip: "23666", lat: 37.0450, lon: -76.3800 },
  { street: "Richmond Rd", city: "Williamsburg", zip: "23185", lat: 37.2700, lon: -76.7100 },
  { street: "George Washington Memorial Hwy", city: "Yorktown", zip: "23693", lat: 37.1500, lon: -76.4900 }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const cleanQuery = query.trim().toLowerCase();
    const suggestions: Array<{
      display_name: string;
      street: string;
      city: string;
      zip: string;
      lat: number;
      lon: number;
    }> = [];

    // 1. Try fetching from Photon / Nominatim free geocoding service with custom User-Agent header
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Virginia, USA")}&countrycodes=us&addressdetails=1&limit=6`;
      const res = await fetch(geoUrl, {
        headers: {
          "User-Agent": "PinstripeRentals/1.0 (info@pinstripesrentals.com)",
          "Accept-Language": "en-US,en;q=0.9"
        },
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          for (const item of data) {
            const addr = item.address || {};
            const streetName = [addr.house_number, addr.road].filter(Boolean).join(" ") || item.display_name.split(",")[0];
            const city = addr.city || addr.town || addr.village || addr.county || "Virginia Beach";
            const zip = addr.postcode || "23451";
            suggestions.push({
              display_name: `${streetName}, ${city}, VA ${zip}`,
              street: streetName,
              city,
              zip,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon)
            });
          }
        }
      }
    } catch (e) {
      console.warn("External geocoding fetch fallback:", e);
    }

    // 2. Add local database matches if external lookup is empty or sparse
    if (suggestions.length < 3) {
      const localMatches = LOCAL_VIRGINIA_ADDRESSES.filter(item =>
        item.street.toLowerCase().includes(cleanQuery) ||
        item.city.toLowerCase().includes(cleanQuery) ||
        item.zip.includes(cleanQuery)
      );

      for (const m of localMatches) {
        const fullDisplay = `${m.street}, ${m.city}, VA ${m.zip}`;
        if (!suggestions.some(s => s.display_name.toLowerCase() === fullDisplay.toLowerCase())) {
          suggestions.push({
            display_name: fullDisplay,
            street: m.street,
            city: m.city,
            zip: m.zip,
            lat: m.lat,
            lon: m.lon
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 6)
    });
  } catch (err: any) {
    console.error("Address autocomplete API error:", err);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}
