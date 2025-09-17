import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Record<string, string> }) {
  try {
    const { storeId } = params;
    const { userId } = await auth();
    const { name } = await req.json();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!storeId) return new NextResponse("Store ID is required", { status: 400 });

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

export async function DELETE(req: Request, { params }: { params: Record<string, string> }) {
  try {
    const { storeId } = params;
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
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
