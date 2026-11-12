const sales = [
  {
    orderId: "ORD001",
    product: "Keyboard",
    quantity: 2,
    unitPrice: 750,
    unitCost: 500,
  },
  {
    orderId: "ORD002",
    product: "Mouse",
    quantity: 3,
    unitPrice: 400,
    unitCost: 220,
  },
  {
    orderId: "ORD003",
    product: "Monitor",
    quantity: 1,
    unitPrice: 8500,
    unitCost: 6900,
  },
  {
    orderId: "ORD004",
    product: "Keyboard",
    quantity: 1,
    unitPrice: 750,
    unitCost: 500,
  },
  {
    orderId: "ORD005",
    product: "Laptop Stand",
    quantity: 2,
    unitPrice: 1200,
    unitCost: 800,
  },
  {
    orderId: "ORD006",
    product: "Mouse",
    quantity: 0,
    unitPrice: 400,
    unitCost: 220,
  },
  {
    orderId: "ORD007",
    product: "Monitor",
    quantity: 1,
    unitPrice: -8500,
    unitCost: 6900,
  },
  {
    orderId: "ORD008",
    product: "Webcam",
    quantity: 2,
    unitPrice: 1800,
    unitCost: 1200,
  }
];

const seenOrderIds = new Set();
const validRecords = [];
const invalidRecords = [];

for (const record of sales) {
  const issues = [];
  const orderId = typeof record.orderId === "string" ? record.orderId.trim() : "";

  if (!orderId) {
    issues.push("Missing order ID");
  } else if (seenOrderIds.has(orderId)) {
    issues.push("Duplicate order ID");
  } else {
    seenOrderIds.add(orderId);
  }

  if (typeof record.product !== "string" || !record.product.trim()) {
    issues.push("Missing product");
  }
  if (!Number.isFinite(record.quantity) || record.quantity <= 0) {
    issues.push("Quantity must be greater than zero");
  }
  if (!Number.isFinite(record.unitPrice) || record.unitPrice <= 0) {
    issues.push("Unit price must be greater than zero");
  }
  if (!Number.isFinite(record.unitCost) || record.unitCost < 0) {
    issues.push("Unit cost must be zero or greater");
  }

  if (issues.length) {
    invalidRecords.push({
      orderId: orderId || "<missing>",
      issues,
    });
  } else {
    validRecords.push(record);
  }
}

const totalRevenue = validRecords.reduce(
  (total, record) => total + record.quantity * record.unitPrice,
  0,
);
const totalOrders = validRecords.length;
const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
const estimatedGrossProfit = validRecords.reduce(
  (total, record) => total + record.quantity * (record.unitPrice - record.unitCost),
  0,
);

function sumByProduct(field) {
  return validRecords.reduce((totals, record) => {
    totals[record.product] = (totals[record.product] || 0) + record.quantity * record[field];
    return totals;
  }, {});
}

function sumBy(field) {
  const totals = {};
  let missingRecords = 0;

  for (const record of validRecords) {
    const key = typeof record[field] === "string" ? record[field].trim() : "";
    if (!key) {
      missingRecords += 1;
      continue;
    }
    totals[key] = (totals[key] || 0) + record.quantity * record.unitPrice;
  }

  return { totals, missingRecords };
}

function getLeaders(totals) {
  const entries = Object.entries(totals);
  if (!entries.length) return [];
  const highestValue = Math.max(...entries.map(([, value]) => value));
  return entries.filter(([, value]) => value === highestValue);
}

const productRevenue = sumByProduct("unitPrice");
const productQuantity = validRecords.reduce((totals, record) => {
  totals[record.product] = (totals[record.product] || 0) + record.quantity;
  return totals;
}, {});
const highestRevenueProducts = getLeaders(productRevenue);
const highestQuantityProducts = getLeaders(productQuantity);
const revenueByRegion = sumBy("region");
const revenueByCategory = sumBy("category");

const sameTopProduct = highestRevenueProducts.some(([product]) =>
  highestQuantityProducts.some(([name]) => name === product),
);
const report = {
  validationRules: [
    "Order ID must be present and unique.",
    "Product name must be present and non-empty.",
    "Quantity must be a finite number greater than zero.",
    "Unit price must be a finite number greater than zero.",
    "Unit cost must be a finite number greater than or equal to zero.",
  ],
  records: {
    total: sales.length,
    valid: validRecords.length,
    invalid: invalidRecords.length,
    invalidIds: invalidRecords.map(({ orderId }) => orderId),
  },
  sales: {
    totalRevenue,
    totalOrders,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
    estimatedGrossProfit,
  },
  productRankings: {
    highestRevenue: highestRevenueProducts.map(([product, revenue]) => ({ product, revenue })),
    highestQuantity: highestQuantityProducts.map(([product, quantity]) => ({ product, quantity })),
    sameTopProduct,
  },
  revenueByRegion: {
    totals: revenueByRegion.totals,
    missingRecords: revenueByRegion.missingRecords,
    available: revenueByRegion.missingRecords < validRecords.length,
  },
  revenueByCategory: {
    totals: revenueByCategory.totals,
    missingRecords: revenueByCategory.missingRecords,
    available: revenueByCategory.missingRecords < validRecords.length,
  },
  invalidRecordReport: invalidRecords,
  businessObservations: [
    `${highestRevenueProducts.map(([product]) => product).join(", ")} generated the highest revenue, while ${highestQuantityProducts
      .map(([product]) => product)
      .join(", ")} sold the highest quantity; these are ${sameTopProduct ? "the same" : "different"}.`,
    `${((invalidRecords.length / sales.length) * 100).toFixed(1)}% of records are invalid and excluded from the sales metrics; correcting them may change the totals and rankings.`,
  ],
  memberContributions: [
    { member: "Member 1", contribution: "Prepared the sales dataset and checked its fields." },
    { member: "Member 2", contribution: "Defined and applied the record validation rules; identified invalid records." },
    { member: "Member 3", contribution: "Calculated total revenue, valid order count, average order value, and estimated gross profit." },
    { member: "Member 4", contribution: "Compared product revenue and quantities, and checked regional/category data availability." },
    { member: "Member 5", contribution: "Summarized business observations and verified the final JSON report." },
  ],
};

console.log(JSON.stringify(report, null, 2));