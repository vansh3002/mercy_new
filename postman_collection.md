# Postman Collection for OwnComm APIs

You can import this collection directly into Postman!

### Instructions:
1. Copy all the JSON code below.
2. Open Postman.
3. Click the **"Import"** button in the top left.
4. Go to the **"Raw text"** tab and paste the JSON, then click **"Continue"** and **"Import"**.

*(Note: You don't necessarily need the `postman-cli` installed just to import and test these. The desktop or web app works perfectly fine!)*

```json
{
	"info": {
		"_postman_id": "c1f7b8d9-a2c3-4d4e-b5f6-c7d8e9f0a1b2",
		"name": "OwnComm Storefront API",
		"description": "Complete collection of the backend endpoints for the OwnComm store.",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Products",
			"item": [
				{
					"name": "Get All Products",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/products?collection=everyday&sort=new",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products"
							],
							"query": [
								{
									"key": "collection",
									"value": "everyday",
									"description": "Optional filter"
								},
								{
									"key": "sort",
									"value": "new",
									"description": "Optional sort"
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "Create Product",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"title\": \"Summer Plazo Set\",\n  \"description\": \"Comfortable and light for the summer.\",\n  \"price\": 999,\n  \"discountPrice\": 799,\n  \"images\": [\"/products/sample.png\"],\n  \"sizeInventory\": { \"M\": 10, \"L\": 5 },\n  \"active\": true\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/api/products",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Single Product",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/products/summer-plazo-set",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products",
								"summer-plazo-set"
							]
						}
					},
					"response": []
				},
				{
					"name": "Update Product",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"price\": 899,\n  \"active\": false\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/api/products/:id",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products",
								":id"
							],
							"variable": [
								{
									"key": "id",
									"value": "<product_cuid>"
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "Update Product Inventory",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"sizeInventory\": {\n    \"S\": 15,\n    \"M\": 8,\n    \"L\": 2\n  }\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/api/products/:id/inventory",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products",
								":id",
								"inventory"
							],
							"variable": [
								{
									"key": "id",
									"value": "<product_cuid>"
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "Delete Product",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/products/:id",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"products",
								":id"
							],
							"variable": [
								{
									"key": "id",
									"value": "<product_cuid>"
								}
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "Orders",
			"item": [
				{
					"name": "Get All Orders",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/orders",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"orders"
							]
						}
					},
					"response": []
				},
				{
					"name": "Place Order",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"customerName\": \"Test User\",\n  \"phone\": \"9876543210\",\n  \"email\": \"user@example.com\",\n  \"address\": \"123 Test St\",\n  \"city\": \"Test City\",\n  \"state\": \"TS\",\n  \"pincode\": \"123456\",\n  \"items\": [\n    { \n      \"productId\": \"<replace_with_actual_product_id>\", \n      \"title\": \"Summer Plazo Set\", \n      \"size\": \"M\", \n      \"qty\": 1, \n      \"price\": 899 \n    }\n  ],\n  \"subtotal\": 899,\n  \"shippingCharge\": 49,\n  \"discount\": 0,\n  \"finalAmount\": 948,\n  \"paymentMethod\": \"UPI\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/api/orders",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"orders"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Single Order",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/orders/:id",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"orders",
								":id"
							],
							"variable": [
								{
									"key": "id",
									"value": "<order_cuid>"
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "Update Order Status",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"orderStatus\": \"SHIPPED\",\n  \"paymentStatus\": \"SUCCESS\",\n  \"awbNumber\": \"123456789\",\n  \"trackingUrl\": \"https://shiprocket.in/tracking/123\",\n  \"shiprocketOrderId\": \"SR987654\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/api/orders/:id",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"orders",
								":id"
							],
							"variable": [
								{
									"key": "id",
									"value": "<order_cuid>"
								}
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "Location",
			"item": [
				{
					"name": "Reverse Geocode Coordinates",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/api/location/reverse?lat=28.6139&lon=77.2090",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"location",
								"reverse"
							],
							"query": [
								{
									"key": "lat",
									"value": "28.6139",
									"description": "Latitude"
								},
								{
									"key": "lon",
									"value": "77.2090",
									"description": "Longitude"
								}
							]
						}
					},
					"response": []
				}
			]
		}
	],
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:3000",
			"type": "string"
		}
	]
}
```
