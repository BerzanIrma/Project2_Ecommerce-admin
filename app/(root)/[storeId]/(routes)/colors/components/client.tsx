"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColorColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";
import { useEffect, useState } from "react";
import axios from "axios";

interface ColorsClientProps {
    data: ColorColumn[];
}

export const ColorsClient = ({ data }: ColorsClientProps) => {
    const router = useRouter();
    const params = useParams();
    const [colors, setColors] = useState<ColorColumn[]>(data);

    const getStoreId = () => {
        const raw = (params as any)?.storeId;
        return Array.isArray(raw) ? raw[0] : (raw as string);
    };

    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location) return window.location.origin;
        return "";
    };

    const fetchColors = async () => {
        try {
            const storeId = getStoreId();
            if (!storeId) throw new Error("Missing storeId in route params");
            const url = `${getBaseUrl()}/api/${storeId}/colors`;
            const response = await axios.get(url, { params: { t: Date.now() } });
            let formatted = response.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                value: c.value,
                createdAt: c.updatedAt ?? c.createdAt,
            }));
            try {
                const rawDeleted = localStorage.getItem('colors:deletedIds');
                if (rawDeleted) {
                    const deleted: string[] = JSON.parse(rawDeleted);
                    formatted = formatted.filter(r => !deleted.includes(r.id));
                }
            } catch {}
            setColors(formatted);
        } catch (error) {
            console.error('Error loading colors:', error);
        }
    };

    useEffect(() => {
        fetchColors();
    }, [params.storeId]);

    useEffect(() => {
        const onDeleted = (e: StorageEvent) => {
            if (e.key === 'colors:deleted' && e.newValue) {
                try {
                    const { id } = JSON.parse(e.newValue);
                    setColors(prev => prev.filter(r => r.id !== id));
                } catch {}
            }
        };
        const onDeletedCustom = (e: any) => {
            const { id } = e.detail || {};
            if (id) setColors(prev => prev.filter(r => r.id !== id));
        };
        window.addEventListener('storage', onDeleted);
        window.addEventListener('colors:deleted' as any, onDeletedCustom as any);
        return () => {
            window.removeEventListener('storage', onDeleted);
            window.removeEventListener('colors:deleted' as any, onDeletedCustom as any);
        };
    }, []);

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Colors (${colors.length})`}
             description="Manage colors for your store"
          />
          <Button onClick={() => router.push(`/${getStoreId()}/colors/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={colors} />
        <Heading title="API" description="API calls for colors" />
        <Separator />
        <div className="mt-2 space-y-2">
          <ApiList entityName="colors" entityIdName="colorId" />
        </div>
        </>
    )
}


