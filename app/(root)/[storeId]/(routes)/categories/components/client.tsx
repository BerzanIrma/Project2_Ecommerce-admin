"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { CategoryColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";
import { useState, useEffect } from "react";
import axios from "axios";
import { formatDateMDY } from "@/lib/utils";

interface CategoriesClientProps {
    data: CategoryColumn[];
}

export const CategoriesClient = ({ data }: CategoriesClientProps) => {
    const router = useRouter();
    const params = useParams();
    const [categories, setCategories] = useState<CategoryColumn[]>(data);
    const searchParams = useSearchParams();

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`/api/${params.storeId}/categories`, { params: { t: Date.now() } });
            
            // Also fetch billboards to get their labels
            const billboardsResponse = await axios.get(`/api/${params.storeId}/billboards`);
            const billboardsMap = billboardsResponse.data.reduce((acc: any, billboard: any) => {
                acc[billboard.id] = billboard.label;
                return acc;
            }, {});
            
            let formatted = response.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                billboard: billboardsMap[c.billboardId] || 'Unknown Billboard',
                createdAt: formatDateMDY((c.updatedAt as any) ?? (c.createdAt as any)),
            }));
            // Drop deleted rows based on durable deleted IDs
            try {
                const rawDeleted = localStorage.getItem('categories:deletedIds');
                if (rawDeleted) {
                    const deleted: string[] = JSON.parse(rawDeleted);
                    formatted = formatted.filter(r => !deleted.includes(r.id));
                }
            } catch {}
            // Merge durable overrides
            try {
                const rawOverrides = localStorage.getItem('categories:overrides');
                if (rawOverrides) {
                    const overrides = JSON.parse(rawOverrides);
                    formatted = formatted.map(row => overrides[row.id] ? {
                        ...row,
                        name: overrides[row.id].name ?? row.name,
                        billboard: overrides[row.id].billboardLabel ?? row.billboard,
                        createdAt: overrides[row.id].updatedAt ? formatDateMDY(overrides[row.id].updatedAt) : row.createdAt,
                    } : row);
                }
            } catch {}
            setCategories(formatted);
            console.log('Categories loaded:', formatted.length);

            // Apply any pending update persisted during navigation
            try {
                const pending = sessionStorage.getItem('categories:pendingUpdate');
                if (pending) {
                    const payload = JSON.parse(pending);
                    setCategories(prev => prev.map(row => row.id === payload.id ? {
                        ...row,
                        name: payload.name ?? row.name,
                        billboard: payload.billboardLabel ?? row.billboard,
                        createdAt: payload.updatedAt ? formatDateMDY(payload.updatedAt) : row.createdAt,
                    } : row));
                    sessionStorage.removeItem('categories:pendingUpdate');
                }
            } catch {}
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
        // If we have a refresh param, refetch shortly after navigation to avoid any race
        const hasRefresh = searchParams?.get('refresh');
        let timeoutId: any;
        if (hasRefresh) {
            timeoutId = setTimeout(() => {
                fetchCategories();
            }, 300);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [params.storeId, searchParams?.toString()]);

    // Refresh categories when page becomes visible (after navigation)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchCategories();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [params.storeId]);

    // Listen for edit broadcasts and patch locally for instant update
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key !== 'categories:updated' || !e.newValue) return;
            try {
                const payload = JSON.parse(e.newValue);
                setCategories(prev => prev.map(row => row.id === payload.id ? {
                    ...row,
                    name: payload.name ?? row.name,
                    billboard: payload.billboardLabel ?? row.billboard,
                    // update displayed Date as last updated
                    createdAt: payload.updatedAt ?? row.createdAt,
                } : row));
                // also refresh durable overrides
                try {
                    const raw = localStorage.getItem('categories:overrides');
                    const map = raw ? JSON.parse(raw) : {};
                    map[payload.id] = payload;
                    localStorage.setItem('categories:overrides', JSON.stringify(map));
                } catch {}
            } catch {}
        };
        window.addEventListener('storage', onStorage);
        // Same-tab updates
        const onCustom = (e: any) => {
            const payload = e.detail;
            setCategories(prev => prev.map(row => row.id === payload.id ? {
                ...row,
                name: payload.name ?? row.name,
                billboard: payload.billboardLabel ?? row.billboard,
                createdAt: payload.updatedAt ?? row.createdAt,
            } : row));
        };
        window.addEventListener('categories:updated' as any, onCustom as any);
        // Deletion events
        const onDeleted = (e: StorageEvent) => {
            if (e.key === 'categories:deleted' && e.newValue) {
                try {
                    const { id } = JSON.parse(e.newValue);
                    setCategories(prev => prev.filter(r => r.id !== id));
                } catch {}
            }
        };
        const onDeletedCustom = (e: any) => {
            const { id } = e.detail || {};
            if (id) setCategories(prev => prev.filter(r => r.id !== id));
        };
        window.addEventListener('storage', onDeleted);
        window.addEventListener('categories:deleted' as any, onDeletedCustom as any);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('categories:updated' as any, onCustom as any);
            window.removeEventListener('storage', onDeleted);
            window.removeEventListener('categories:deleted' as any, onDeletedCustom as any);
        };
    }, []);

    return(
        <>
        <div className="flex items-center justify-between">
          <Heading 
             title={`Categories (${categories.length})`}
             description="Manage categories for your store"
          />
          <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={categories} />
        <Heading title="API" description="API calls for categories" />
        <Separator />
        <div className="mt-2 space-y-2">
          <ApiList entityName="categories" entityIdName="categoryId" />
        </div>
        </>
    )
}


