"use client";

import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { CategoryColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
    data: CategoryColumn;
};

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Category Id copied to the clipboard.");
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/categories/${data.id}`);
            // Update local caches so the row disappears immediately
            try {
                // Maintain a durable set of deleted IDs
                const raw = localStorage.getItem('categories:deletedIds');
                const set: string[] = raw ? JSON.parse(raw) : [];
                if (!set.includes(data.id)) {
                    set.push(data.id);
                    localStorage.setItem('categories:deletedIds', JSON.stringify(set));
                }
                // Remove any overrides for this id
                const rawOverrides = localStorage.getItem('categories:overrides');
                if (rawOverrides) {
                    const map = JSON.parse(rawOverrides);
                    delete map[data.id];
                    localStorage.setItem('categories:overrides', JSON.stringify(map));
                }
                // Broadcast deletion
                localStorage.setItem('categories:deleted', JSON.stringify({ id: data.id }));
                window.dispatchEvent(new CustomEvent('categories:deleted', { detail: { id: data.id } }));
            } catch {}
            router.refresh();
            toast.success("Category deleted.");
        } catch (error) {
            toast.error("Failed to delete category.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
        <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-8">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCopy(data.id)}>
                    <Copy className="mr-2 h-4 w-4"/> Copy Id
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/categories/${data.id}`)}>
                    <Edit className="mr-2 h-4 w-4"/> Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Trash className="mr-2 h-4 w-4"/> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    );
};


