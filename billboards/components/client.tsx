"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BillboardColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";
// import { ApiList } from "@/components/ui/api-list";

interface BillboardClientProps {
    data: Array<{
        id: string;
        label: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

export const BillboardClient = ({ data }: BillboardClientProps) => {
    const router = useRouter();
    const params = useParams();
    const tableData = data.map((b) => ({
        ...b,
        createdAt: typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toISOString(),
        updatedAt: typeof b.updatedAt === 'string' ? b.updatedAt : new Date(b.updatedAt).toISOString(),
    }));

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Billboards (${data.length})`}
             description="Manage billboards for your store"
          />
          <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable  searchKey="label"  columns={columns} data={tableData} />
        <Heading title="API" description="API calls for billboards" />
        <Separator />
        <div className="mt-2 space-y-2">
          <ApiList entityName="billboards" entityIdName="billboardId" />
        </div>
        </>
    )
}
