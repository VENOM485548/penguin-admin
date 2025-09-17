import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> } // 👈 fixed: must be Promise
) {
  const { storeId } = await params; // 👈 must await
  const { productIds } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  // 👉 Calculate total amount in paise (₹1 = 100 paise)
  const amount = products.reduce(
    (total, product) => total + product.price * 100,
    0
  );

  // 👉 Save order in DB
  const order = await prismadb.order.create({
    data: {
      storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: { connect: { id: productId } },
        })),
      },
    },
  });

  // 👉 Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: order.id, // link to DB order
    notes: {
      storeId,
    },
  });

  return NextResponse.json(
    {
      orderId: razorpayOrder.id,
      amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID, // frontend needs this
    },
    { headers: corsHeaders }
  );
}
