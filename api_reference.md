# OwnComm API Reference

This document serves as a reference for all the backend API endpoints implemented for the OwnComm store. It details the request payloads, methods, and expected responses used during testing.

---

## 📦 Products API

### 1. Create a Product
**Endpoint:** `POST /api/products`
**Description:** Creates a new product. The `slug` is automatically generated from the title.
**Request Payload:**
```json
{
  "title": "Summer Plazo Set",
  "description": "Comfortable and light for the summer.",
  "price": 999,
  "discountPrice": 799,
  "images": ["/products/sample.png"],
  "sizeInventory": { "M": 10, "L": 5 },
  "active": true
}
```

### 2. Fetch All Products
**Endpoint:** `GET /api/products`
**Description:** Retrieves all active products. Supports optional query parameters for filtering: `?collection=everyday&sort=price-asc&maxPrice=1500`.

### 3. Fetch a Single Product
**Endpoint:** `GET /api/products/[slug]`
**Description:** Retrieves full details for a single product using its URL-friendly slug.
**Example:** `GET /api/products/summer-plazo-set`

### 4. Update a Product
**Endpoint:** `PUT /api/products/[id]`
**Description:** Updates specific fields on a product. You must pass the unique `id` (not the slug) in the URL.
**Request Payload:**
```json
{
  "price": 899,
  "active": false
}
```

### 5. Update Product Inventory
**Endpoint:** `PATCH /api/products/[id]/inventory`
**Description:** Completely replaces the inventory object for a specific product. Validates that all quantities are non-negative integers.
**Request Payload:**
```json
{
  "sizeInventory": {
    "S": 15,
    "M": 8,
    "L": 2
  }
}
```

### 6. Delete a Product
**Endpoint:** `DELETE /api/products/[id]`
**Description:** Permanently removes a product from the database by its ID.

---

## 🛒 Orders API

### 1. Place an Order (Checkout)
**Endpoint:** `POST /api/orders`
**Description:** Places a new order. It uses a database transaction to atomically check if sufficient inventory exists, deducts the stock, and then creates the order. If any item is out of stock, it returns an error and cancels the operation.
**Request Payload:**
```json
{
  "customerName": "Test User",
  "phone": "9876543210",
  "email": "user@example.com",
  "address": "123 Test St",
  "city": "Test City",
  "state": "TS",
  "pincode": "123456",
  "items": [
    { 
      "productId": "clxyz123...", 
      "title": "Summer Plazo Set", 
      "size": "M", 
      "qty": 1, 
      "price": 899 
    }
  ],
  "subtotal": 899,
  "shippingCharge": 49,
  "discount": 0,
  "finalAmount": 948,
  "paymentMethod": "UPI"
}
```

### 2. Fetch All Orders
**Endpoint:** `GET /api/orders`
**Description:** Retrieves all orders, sorted by most recent first (for admin use).

### 3. Fetch a Single Order
**Endpoint:** `GET /api/orders/[id]`
**Description:** Retrieves details for a specific order.

### 4. Update Order Status & Tracking
**Endpoint:** `PATCH /api/orders/[id]`
**Description:** Updates the status, payment status, or shipping/tracking IDs. Strict validation ensures only valid statuses can be set.
**Request Payload:**
```json
{
  "orderStatus": "SHIPPED",
  "paymentStatus": "SUCCESS",
  "awbNumber": "123456789",
  "trackingUrl": "https://shiprocket.in/tracking/123",
  "shiprocketOrderId": "SR987654"
}
```
*Valid `orderStatus` values: `UNDER_PACKAGING`, `SHIPPED`, `DELIVERED`, `CANCELLED`*
*Valid `paymentStatus` values: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`*
