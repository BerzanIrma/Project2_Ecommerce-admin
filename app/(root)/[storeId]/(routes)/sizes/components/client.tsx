"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { SizeColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";
import { useEffect, useState } from "react";
import { formatDateMDY } from "@/lib/utils";
import axios from "axios";

interface SizesClientProps {
    data: SizeColumn[];
}

export const SizesClient = ({ data }: SizesClientProps) => {
    const router = useRouter();
    const params = useParams();
    const [sizes, setSizes] = useState<SizeColumn[]>(data);

    const getStoreId = () => {
        const raw = (params as any)?.storeId;
        return Array.isArray(raw) ? raw[0] : (raw as string);
    };

    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location) return window.location.origin;
        return "";
    };

    const fetchSizes = async () => {
        try {
            const storeId = getStoreId();
            if (!storeId) throw new Error("Missing storeId in route params");
            const url = `${getBaseUrl()}/api/${storeId}/sizes`;
            const response = await axios.get(url, { params: { t: Date.now() } });
            let formatted = response.data.map((s: any) => ({
                id: s.id,
                name: s.name,
                value: s.value,
                createdAt: formatDateMDY(s.updatedAt ?? s.createdAt),
            }));
            try {
                const rawDeleted = localStorage.getItem('sizes:deletedIds');
                if (rawDeleted) {
                    const deleted: string[] = JSON.parse(rawDeleted);
                    formatted = formatted.filter(r => !deleted.includes(r.id));
                }
            } catch {}
            setSizes(formatted);
        } catch (error) {
            console.error('Error loading sizes:', error);
        }
    };

    useEffect(() => {
        fetchSizes();
    }, [params.storeId]);

    // Listen to deletion events to drop rows instantly
    useEffect(() => {
        const onDeleted = (e: StorageEvent) => {
            if (e.key === 'sizes:deleted' && e.newValue) {
                try {
                    const { id } = JSON.parse(e.newValue);
                    setSizes(prev => prev.filter(r => r.id !== id));
                } catch {}
            }
        };
        const onDeletedCustom = (e: any) => {
            const { id } = e.detail || {};
            if (id) setSizes(prev => prev.filter(r => r.id !== id));
        };
        window.addEventListener('storage', onDeleted);
        window.addEventListener('sizes:deleted' as any, onDeletedCustom as any);
        return () => {
            window.removeEventListener('storage', onDeleted);
            window.removeEventListener('sizes:deleted' as any, onDeletedCustom as any);
        };
    }, []);

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Sizes (${sizes.length})`}
             description="Manage sizes for your store"
          />
          <Button onClick={() => router.push(`/${getStoreId()}/sizes/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={sizes} />
        <Heading title="API" description="API calls for sizes" />
        <Separator />
        <div className="mt-2 space-y-2">
          <ApiList entityName="sizes" entityIdName="sizeId" />
        </div>
        </>
    )
}


