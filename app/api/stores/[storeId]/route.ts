import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    // Extract storeId from URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/"); // e.g. /api/stores/[storeId]
    const storeId = segments[segments.length - 1];

    if (!storeId) return new NextResponse("Store ID is required", { status: 400 });

    const deleted = await prismadb.store.deleteMany({
      where: { id: storeId, userId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    // Extract storeId from URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const storeId = segments[segments.length - 1];

    if (!storeId) return new NextResponse("Store ID is required", { status: 400 });

    const { name } = await req.json();
    if (!name) return new NextResponse("Name is required", { status: 400 });

    const updated = await prismadb.store.updateMany({
      where: { id: storeId, userId },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
