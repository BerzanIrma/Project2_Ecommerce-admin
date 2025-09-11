"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { OrderColumn, columns } from "./columns";

interface OrdersClientProps {
    data: OrderColumn[];
}

export const OrdersClient = ({ data }: OrdersClientProps) => {
    const params = useParams();

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Orders (${data.length})`}
             description="Manage orders for your store"
          />
        </div>
        <Separator />
        <DataTable searchKey="products" columns={columns} data={data} />
       
        </>
    )
}


