import nodemailer from "nodemailer";

// ─── Transport ────────────────────────────────────────────────────────────────

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/** Fire-and-forget. Never throws ,email failure should never break a user request. */
async function send(subject: string, html: string) {
  const transport = getTransport();
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
  if (!transport || !to) return;

  try {
    await transport.sendMail({
      from: `"Womaniya Store" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Log but never surface to caller
    console.error("[mailer] Failed to send email:", err);
  }
}

// ─── Shared layout ───────────────────────────────────────────────────────────

function wrap(accentColor: string, icon: string, title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f1ec;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:${accentColor};padding:24px 32px;text-align:center;">
            <div style="font-size:32px;margin-bottom:6px;">${icon}</div>
            <div style="color:#fff;font-family:'Georgia',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.85;">Womaniya</div>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <h2 style="margin:0;font-family:'Georgia',serif;font-size:22px;color:#1a1a1a;font-weight:normal;">${title}</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:8px 32px 28px;font-size:14px;color:#444;line-height:1.7;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0ebe4;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;letter-spacing:1px;text-transform:uppercase;">Womaniya · Admin Alerts</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;color:#888;font-size:13px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#1a1a1a;font-size:13px;font-weight:bold;vertical-align:top;">${value}</td>
  </tr>`;
}

function table(rows: string): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;border-top:1px solid #f0ebe4;">${rows}</table>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

/** New customer verified their phone number */
export function notifyNewCustomer(phone: string, isNew: boolean) {
  const label = isNew ? "New customer just joined! 🎉" : "Returning customer verified";
  const body = `
    <p>${isNew ? "A new customer has verified their phone number on Womaniya." : "A returning customer signed back in."}</p>
    ${table(
      row("Phone", `+91 ${phone}`) +
      row("Status", isNew ? "🆕 First-time visitor" : "🔄 Returning customer") +
      row("Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    )}
    <p style="margin-top:16px;color:#999;font-size:12px;">They can now browse their wishlist, place orders, and track deliveries.</p>`;

  send(label, wrap("#8B1A2F", isNew ? "👤" : "🔄", label, body));
}

/** Order placed */
export function notifyOrderPlaced(order: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{ title: string; size: string; qty: number; price: number }>;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
}) {
  const itemsList = order.items
    .map(
      (i) =>
        `<li style="padding:4px 0;border-bottom:1px solid #f5f1ec;">${i.qty}× <strong>${i.title}</strong> ,Size ${i.size} ,₹${i.price.toLocaleString("en-IN")}</li>`
    )
    .join("");

  const body = `
    <p>A new order has been placed on Womaniya. Please review and ship promptly.</p>
    ${table(
      row("Order #", order.orderNumber) +
      row("Customer", order.customerName) +
      row("Phone", `+91 ${order.phone}`) +
      row("Payment", order.paymentMethod.toUpperCase()) +
      row("Address", `${order.address}, ${order.city}, ${order.state} ${order.pincode}`)
    )}
    <p style="margin-top:20px;font-weight:bold;font-size:13px;color:#1a1a1a;">Items ordered:</p>
    <ul style="padding-left:0;list-style:none;margin:8px 0;">${itemsList}</ul>
    ${table(
      row("Subtotal", `₹${order.subtotal.toLocaleString("en-IN")}`) +
      (order.discount ? row("Discount", `−₹${order.discount.toLocaleString("en-IN")}`) : "") +
      row("Shipping", order.shippingCharge ? `₹${order.shippingCharge.toLocaleString("en-IN")}` : "Free") +
      row("Total paid", `₹${order.finalAmount.toLocaleString("en-IN")}`)
    )}`;

  send(
    `🛍️ New Order #${order.orderNumber} ,₹${order.finalAmount.toLocaleString("en-IN")}`,
    wrap("#1a3a1a", "🛍️", `New Order ,₹${order.finalAmount.toLocaleString("en-IN")}`, body)
  );
}

/** Buy Now clicked ,purchase intent signal */
export function notifyBuyNowClicked(phone: string, productTitle: string, size: string) {
  const body = `
    <p>A customer clicked <strong>Buy Now</strong> and is heading to checkout.</p>
    ${table(
      row("Phone", `+91 ${phone}`) +
      row("Product", productTitle) +
      row("Size", size) +
      row("Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    )}
    <p style="margin-top:16px;color:#999;font-size:12px;">They may or may not complete the order ,watch for an order confirmation.</p>`;

  send(
    `⚡ Buy Now ,${productTitle} (${size})`,
    wrap("#7c3d00", "⚡", "Buy Now Intent", body)
  );
}

/** Customer requested an out-of-stock item */
export function notifyRestockRequest(phone: string | null, productTitle: string, size: string) {
  const body = `
    <p>A customer tried to order an item that is <strong>out of stock</strong> and has requested it.</p>
    ${table(
      row("Product", productTitle) +
      row("Size", size) +
      row("Phone", phone ? `+91 ${phone}` : "Guest (not verified)") +
      row("Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    )}
    <p style="margin-top:16px;color:#8B1A2F;font-weight:bold;font-size:13px;">Action needed: Restock this item or follow up with the customer.</p>`;

  send(
    `📦 Restock Request ,${productTitle} (${size})`,
    wrap("#8B1A2F", "📦", "Restock Request", body)
  );
}

/** Add to bag */
export function notifyAddToBag(phone: string | null, productTitle: string, size: string) {
  const body = `
    <p>A customer added an item to their bag.</p>
    ${table(
      row("Phone", phone ? `+91 ${phone}` : "Guest (not verified yet)") +
      row("Product", productTitle) +
      row("Size", size) +
      row("Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    )}
    <p style="margin-top:16px;color:#999;font-size:12px;">They have shown purchase intent ,watch for an order confirmation.</p>`;

  send(
    `🛒 Add to Bag ,${productTitle} (${size})`,
    wrap("#1a3d5c", "🛒", "Added to Bag", body)
  );
}

/** Product wishlisted */
export function notifyWishlistAdd(phone: string, productId: string) {
  const body = `
    <p>A customer added a product to their wishlist.</p>
    ${table(
      row("Phone", `+91 ${phone}`) +
      row("Product ID", productId) +
      row("Time", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    )}
    <p style="margin-top:16px;color:#999;font-size:12px;">This shows clear purchase interest ,consider a follow-up if they don't order soon.</p>`;

  send(
    `❤️ Wishlist Add ,Product ${productId}`,
    wrap("#6b2d4a", "❤️", "Product Wishlisted", body)
  );
}
