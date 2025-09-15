import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { CategoryClient } from "./components/client";
import { CategoryColumn } from "./components/columns";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;  // 👈 params is now a Promise
}) => {
  const { storeId } = await params;       // 👈 await params

  const categories = await prismadb.category.findMany({
    where: {
      storeId,
    },

    include: {
      billboard:true,
    },
    
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardlabel: item.billboard.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y p-8 pt-6">
        <CategoryClient data={formattedCategories} />  
      </div>
    </div>
  );
};

export default CategoriesPage;
