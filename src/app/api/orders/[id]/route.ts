import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createShiprocketOrder, assignAWB } from "@/lib/shiprocket";

const VALID_ORDER_STATUSES = ["UNDER_PACKAGING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const VALID_PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] as const;

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];
type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

// ─── GET /api/orders/[id] ────────────────────────────────────────────────────
// Customer: fetch order details by Prisma cuid.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, order });
}

// ─── PATCH /api/orders/[id] ──────────────────────────────────────────────────
// Admin: update order status, payment status, or shipping tracking fields.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    awbNumber?: string;
    trackingUrl?: string;
    shiprocketOrderId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };

  // Validate enum values if provided
  if (body.orderStatus && !VALID_ORDER_STATUSES.includes(body.orderStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid orderStatus. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (body.paymentStatus && !VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid paymentStatus. Valid values: ${VALID_PAYMENT_STATUSES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Fetch the current order state
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  // Prepare updates
  let updateData: any = {
    ...(body.orderStatus !== undefined && { orderStatus: body.orderStatus }),
    ...(body.paymentStatus !== undefined && { paymentStatus: body.paymentStatus }),
    ...(body.awbNumber !== undefined && { awbNumber: body.awbNumber }),
    ...(body.trackingUrl !== undefined && { trackingUrl: body.trackingUrl }),
    ...(body.shiprocketOrderId !== undefined && { shiprocketOrderId: body.shiprocketOrderId }),
    ...(body.razorpayOrderId !== undefined && { razorpayOrderId: body.razorpayOrderId }),
    ...(body.razorpayPaymentId !== undefined && { razorpayPaymentId: body.razorpayPaymentId }),
  };

  // If payment changes from NOT SUCCESS -> SUCCESS, automatically integrate with Shiprocket
  if (body.paymentStatus === "SUCCESS" && existing.paymentStatus !== "SUCCESS") {
    try {
      console.log(`[PATCH /api/orders/${id}] Payment succeeded. Triggering Shiprocket creation...`);
      const items = (existing.items ?? []) as any[];
      
      // 1. Fetch products to get their respective pickup locations
      const productIds = items.map((item) => item.productId).filter(Boolean);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 2. Group items by pickup location
      const defaultPickup = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary Warehouse";
      const itemsByLocation: Record<string, typeof items> = {};
      for (const item of items) {
        const prod = productMap.get(item.productId);
        const loc = prod?.pickupLocation || defaultPickup;
        if (!itemsByLocation[loc]) {
          itemsByLocation[loc] = [];
        }
        itemsByLocation[loc].push(item);
      }

      // 3. Process each pickup location as a separate shipment
      const shipmentsList = [];
      const locations = Object.keys(itemsByLocation);
      let index = 1;

      for (const loc of locations) {
        const shipmentItems = itemsByLocation[loc];
        // Suffix order ID if splitting to prevent Shiprocket 422 duplicate errors
        const suffix = locations.length > 1 ? String(index++) : undefined;

        console.log(`[PATCH /api/orders/${id}] Pushing shipment for location [${loc}]...`);
        const srResult = await createShiprocketOrder(existing, shipmentItems, loc, suffix);

        if (srResult.success) {
          let awb = null;
          let track = null;

          try {
            console.log(`[PATCH /api/orders/${id}] Assigning AWB for shipment: ${srResult.shipmentId}`);
            const awbResult = await assignAWB(srResult.shipmentId);
            if (awbResult.success) {
              awb = awbResult.awbNumber;
              track = awbResult.trackingUrl;
            }
          } catch (awbErr) {
            console.error(`[PATCH /api/orders/${id}] AWB assignment failed for shipment:`, awbErr);
          }

          shipmentsList.push({
            pickupLocation: loc,
            shiprocketOrderId: srResult.shiprocketOrderId,
            shipmentId: srResult.shipmentId,
            awbNumber: awb,
            trackingUrl: track,
            items: shipmentItems,
          });
        }
      }

      // 4. Update the order object in DB with the shipments list
      if (shipmentsList.length > 0) {
        updateData.shipments = shipmentsList;
        updateData.orderStatus = "SHIPPED";
        // Legacy support: copy first shipment details to root
        updateData.shiprocketOrderId = shipmentsList[0].shiprocketOrderId;
        updateData.awbNumber = shipmentsList[0].awbNumber;
        updateData.trackingUrl = shipmentsList[0].trackingUrl;
      }
    } catch (error) {
      console.error(`[PATCH /api/orders/${id}] Shiprocket integration failure:`, error);
      // We do not crash the order status update if Shiprocket fails, but log the error
    }
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[PATCH /api/orders/[id]] Update failed:", error);
    return NextResponse.json({ success: false, error: "update_failed" }, { status: 500 });
  }
}
