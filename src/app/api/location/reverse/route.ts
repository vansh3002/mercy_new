import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, error: "lat and lon query parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Nominatim requires a descriptive User-Agent header to avoid 403 blocks
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      {
        headers: {
          "User-Agent": "OwnComm-Storefront-Backend/1.0 (contact@owncomm.com)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Build a structured, user-friendly address
    const street = address.road || address.pedestrian || address.suburb || "";
    const city = address.city || address.town || address.village || address.district || "";
    let state = address.state || "";
    const pincode = address.postcode || "";
    const country = address.country || "";

    // Fallback for state if it's not directly in the address object (e.g. Union Territories like Delhi)
    if (!state && data.display_name) {
      const parts = data.display_name.split(",").map((p: string) => p.trim());
      if (pincode) {
        const pincodeIdx = parts.indexOf(pincode);
        if (pincodeIdx > 0) {
          state = parts[pincodeIdx - 1];
        }
      }
      if (!state && parts.length >= 3) {
        state = parts[parts.length - 3];
      }
    }

    // Clean up potential multi-word state formats or pincode spaces (e.g. "110 070" -> "110070")
    const cleanPincode = pincode.replace(/\s+/g, "");

    return NextResponse.json({
      success: true,
      address: {
        street,
        city,
        state,
        pincode: cleanPincode,
        country,
        formattedAddress: data.display_name || "",
      },
    });
  } catch (error) {
    console.error("[GET /api/location/reverse] Geocoding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve coordinates into address" },
      { status: 500 }
    );
  }
}
