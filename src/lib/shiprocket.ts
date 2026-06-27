import { Order } from "@prisma/client";

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

function isMockMode(): boolean {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  return (
    !email ||
    !password ||
    email.includes("example.com") ||
    password.includes("your_shiprocket_api_password")
  );
}

/**
 * Get a valid authorization token for Shiprocket API.
 * Authenticates if no token is cached or if the token has expired.
 */
async function getAuthToken(): Promise<string> {
  if (isMockMode()) {
    return "mock-shiprocket-token";
  }

  // Token is valid for 240 hours. Refresh 1 hour before expiry for safety.
  const now = Date.now();
  if (cachedToken && tokenExpiryTime && now < tokenExpiryTime - 60 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket login failed: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    if (!data.token) {
      throw new Error("Shiprocket login returned no token");
    }

    cachedToken = data.token;
    // Set expiry to 239 hours from now
    tokenExpiryTime = now + 239 * 60 * 60 * 1000;
    return cachedToken!;
  } catch (error) {
    console.error("[Shiprocket API] Authentication error:", error);
    throw error;
  }
}

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
}

interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

/**
 * Pushes an order to Shiprocket.
 * Maps our DB Order model to Shiprocket format.
 */
export async function createShiprocketOrder(
  order: Order,
  itemsList: Array<{ title: string; price: number; qty: number; size: string; productId: string }>,
  customPickupLocation?: string,
  orderIdSuffix?: string
) {
  const pickupLoc = customPickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || "Primary Warehouse";
  const finalOrderNumber = orderIdSuffix ? `${order.orderNumber}-${orderIdSuffix}` : order.orderNumber;

  if (isMockMode()) {
    console.warn("[Shiprocket API] Running in MOCK mode. Configure credentials in .env to call live APIs.");
    return {
      success: true,
      shiprocketOrderId: `SR-${Math.floor(100000 + Math.random() * 900000)}`,
      shipmentId: `SH-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };
  }

  const token = await getAuthToken();

  // Prepare names
  const nameParts = order.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "Storefront";

  // Build items mapping
  const orderItems: ShiprocketOrderItem[] = itemsList.map((item) => ({
    name: `${item.title} (${item.size})`,
    sku: `${item.productId}-${item.size}`,
    units: item.qty,
    selling_price: item.price,
  }));

  // Calculate dynamic subtotal for this set of items
  const subTotal = itemsList.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Date format yyyy-mm-dd HH:MM
  const date = new Date(order.createdAt);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const payload: ShiprocketOrderPayload = {
    order_id: finalOrderNumber,
    order_date: formattedDate,
    pickup_location: pickupLoc,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.address,
    billing_city: order.city,
    billing_pincode: order.pincode,
    billing_state: order.state,
    billing_country: "India",
    billing_email: order.email || "customer@example.com",
    billing_phone: order.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    sub_total: subTotal,
    weight: parseFloat(process.env.SHIPROCKET_DEFAULT_WEIGHT || "0.5"),
    length: parseInt(process.env.SHIPROCKET_DEFAULT_LENGTH || "10", 10),
    breadth: parseInt(process.env.SHIPROCKET_DEFAULT_BREADTH || "10", 10),
    height: parseInt(process.env.SHIPROCKET_DEFAULT_HEIGHT || "5", 10),
  };

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create order in Shiprocket: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      shiprocketOrderId: String(data.order_id),
      shipmentId: String(data.shipment_id),
    };
  } catch (error) {
    console.error("[Shiprocket API] Order creation error:", error);
    throw error;
  }
}

/**
 * Assigns Courier AWB to a Shipment.
 */
export async function assignAWB(shipmentId: string) {
  if (isMockMode()) {
    const mockAwb = `AWB${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      success: true,
      awbNumber: mockAwb,
      trackingUrl: `https://www.shiprocket.in/shipment-tracking/${mockAwb}`,
    };
  }

  const token = await getAuthToken();

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: parseInt(shipmentId, 10),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to assign AWB: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const awb = data.response?.data?.awb_code;
    if (!awb) {
      throw new Error("Shiprocket did not return an AWB code");
    }

    return {
      success: true,
      awbNumber: String(awb),
      trackingUrl: `https://www.shiprocket.in/shipment-tracking/${awb}`,
    };
  } catch (error) {
    console.error("[Shiprocket API] AWB assignment error:", error);
    throw error;
  }
}
