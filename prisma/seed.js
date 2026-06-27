const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Read the products from mercy_new/data/products.json
  const file = path.join(__dirname, "..", "data", "products.json");
  const raw = fs.readFileSync(file, "utf8");
  const products = JSON.parse(raw);

  console.log(`Parsed ${products.length} products from products.json.`);

  // Delete all existing products in Neon database
  // This is safe because it's a test database and we are seeding the complete catalog
  const { count } = await prisma.product.deleteMany();
  console.log(`Cleaned up ${count} existing products from database.`);

  for (const p of products) {
    // Generate sizeInventory from sizes and stock
    const qtyPerSize = Math.floor(p.stock / p.sizes.length);
    const remainder = p.stock % p.sizes.length;
    const sizeInventory = {};
    p.sizes.forEach((size, idx) => {
      sizeInventory[size] = qtyPerSize + (idx < remainder ? 1 : 0);
    });

    console.log(`Seeding product: ${p.title} (${p.id})`);
    
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description ?? null,
        // MRP in catalog maps to regular price in database
        price: p.mrp || p.price,
        // Price in catalog maps to discountPrice in database
        discountPrice: p.mrp && p.price < p.mrp ? p.price : null,
        images: p.images || {},
        sizeInventory,
        story: p.story ?? null,
        fabric: p.fabric ?? null,
        colorName: p.colorName ?? null,
        colorHex: p.colorHex ?? null,
        pickupLocation: p.pickupLocation ?? "Primary Warehouse",
        active: true,
      },
    });
  }

  console.log("Database seed completed successfully.");
}

main()
  .catch((err) => {
    console.error("Error during seeding:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
