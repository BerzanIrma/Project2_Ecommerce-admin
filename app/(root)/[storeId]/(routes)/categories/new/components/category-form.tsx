"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertModal } from "@/components/modals/alert-modal";
import { Trash } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface Billboard {
  id: string;
  label: string;
}

export const CategoryEditForm = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [open, setOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      billboardId: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Always load billboards
        const billboardsRes = await axios.get(`/api/${params.storeId}/billboards`);
        setBillboards(billboardsRes.data);

        // Try to load the category by ID
        try {
          const categoryRes = await axios.get(`/api/${params.storeId}/categories/${params.categoryId}`);
          const category = categoryRes.data;
          form.reset({ name: category.name, billboardId: category.billboardId });
        } catch {
          // Fallback: load all categories and find by id (in case item storage was reset)
          try {
            const listRes = await axios.get(`/api/${params.storeId}/categories`);
            const found = (listRes.data || []).find((c: any) => c.id === params.categoryId);
            if (found) {
              form.reset({ name: found.name, billboardId: found.billboardId });
            } else {
              toast.error("Failed to load category");
            }
          } catch {
            toast.error("Failed to load category");
          }
        }
      } catch (e) {
        toast.error("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [params.storeId, params.categoryId]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
      toast.success("Category updated.");
      // Broadcast immediate update for the table
      try {
        const billboardLabel = billboards.find(b => b.id === data.billboardId)?.label;
        const payload = {
          id: params.categoryId,
          name: data.name,
          billboardLabel,
          updatedAt: new Date().toISOString(),
        };
        // Update other tabs
        localStorage.setItem('categories:updated', JSON.stringify(payload));
        // Persist for next page load in same tab (read by list page)
        sessionStorage.setItem('categories:pendingUpdate', JSON.stringify(payload));
        // Persist durable overrides so refetch cannot overwrite with stale data
        try {
          const raw = localStorage.getItem('categories:overrides');
          const map = raw ? JSON.parse(raw) : {};
          map[payload.id] = payload;
          localStorage.setItem('categories:overrides', JSON.stringify(map));
        } catch {}
        // Update current tab immediately
        window.dispatchEvent(new CustomEvent('categories:updated', { detail: payload }));
      } catch {}
      router.refresh();
      router.push(`/${params.storeId}/categories?refresh=${Date.now()}`);
    } catch (e) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
      // Maintain durable deleted state and cleanup overrides
      try {
        const raw = localStorage.getItem('categories:deletedIds');
        const set: string[] = raw ? JSON.parse(raw) : [];
        const id = String(params.categoryId);
        if (!set.includes(id)) {
          set.push(id);
          localStorage.setItem('categories:deletedIds', JSON.stringify(set));
        }
        const rawOverrides = localStorage.getItem('categories:overrides');
        if (rawOverrides) {
          const map = JSON.parse(rawOverrides);
          delete map[id];
          localStorage.setItem('categories:overrides', JSON.stringify(map));
        }
        localStorage.setItem('categories:deleted', JSON.stringify({ id }));
        window.dispatchEvent(new CustomEvent('categories:deleted', { detail: { id } }));
      } catch {}
      toast.success("Category deleted.");
      router.refresh();
      router.push(`/${params.storeId}/categories?refresh=${Date.now()}`);
    } catch (e) {
      toast.error("Failed to delete category.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const title = "Edit Category";
  const description = "Update category details";
  const action = "Save changes";

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading || initialLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading || initialLoading} placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select disabled={loading || initialLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading || initialLoading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};


