/*import { NextResponse } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // ✅ Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // ✅ Handle successful payments
  if (event.event === "payment.captured") {
    const order = event.payload.payment.entity.order_id;

    // Update the corresponding order in DB
    await prismadb.order.updateMany({
      where: { id: orderId }, // make sure you’re storing razorpay `orderId` in DB
      data: { isPaid: true },
    });

    console.log("✅ Payment captured:", orderId);
  }

  return NextResponse.json({ status: "ok" });
}

import Razorpay from "razorpay";
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req:Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhook.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error:any) {
        return new NextResponse(`webhook Error: ${error.message}` , {status:400});
    }
    const session = event.data.object as Stripe.Checkout.session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ];

    const addressString = addressComponents.filter((c) => c !== null ).join(', ');

    if (event.type === "checkout.session.completed") {
        const order = await prismadb.order.update({
            where: {
                id: session?.metadata?.orderId,

            },
            data: {
                isPaid: true,
                address: addressString,
                phone: session?.customer_details?.phone || ''
            },
            include: {
                orderItems: true,
            }
        });

        const productIds = order.orderItems.map((orderItem) => orderItem.productId);

        await prismadb.product.updateMany({
            where: {
                id: {
                    in: [...productIds]
                }
            },
            data: {
                isArchived: true
            }
        });
    }
    return new NextResponse(null, {status: 200});
}*/

import { NextResponse } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("🔔 Incoming Razorpay webhook:", event.event);

  if (event.event === "payment.captured") {
    const dbOrderId = event.payload.payment.entity.receipt; // 👈 from checkout
    console.log("🔔 Receipt (DB order id):", dbOrderId);

    try {
      const updated = await prismadb.order.update({
        where: { id: dbOrderId },
        data: { isPaid: true },
      });
      console.log("✅ Order updated in DB:", updated.id);
    } catch (err) {
      console.error("❌ Failed to update DB order:", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}



