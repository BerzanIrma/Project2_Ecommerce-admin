"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ProductColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";
import { useMemo } from "react";

interface ProductClientProps {
    data: ProductColumn[];
}

export const ProductClient = ({ data }: ProductClientProps) => {
    const router = useRouter();
    const params = useParams();
    const rows = useMemo(() => data, [data]);

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Products (${rows.length})`}
             description="Manage products for your store"
          />
          <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable  searchKey="name"  columns={columns} data={rows} />
        <Heading title="API" description="API calls for products" />
        <Separator />
        <div className="mt-2 space-y-2">
          <ApiList entityName="products" entityIdName="productId" />
        </div>
        </>
    )
}


