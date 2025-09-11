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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertModal } from "@/components/modals/alert-modal";
import { Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  categoryId: z.string().min(1),
  sizeId: z.string().min(1),
  colorId: z.string().min(1),
  images: z.array(z.string().min(1)).min(1, { message: "At least one image is required" }),
  isFeatured: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductEditForm = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ id: string; name: string }>>([]);
  const [colors, setColors] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      categoryId: "",
      sizeId: "",
      colorId: "",
      images: [],
      isFeatured: false,
      isArchived: false,
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        try {
          const res = await axios.get(`/api/${params.storeId}/products/${params.productId}`);
          const imgs: string[] = Array.isArray(res.data.images)
            ? (res.data.images || []).map((im: any) => (typeof im === 'string' ? im : String(im?.url || ''))).filter(Boolean)
            : (res.data.imageUrl ? [res.data.imageUrl] : []);
          form.reset({
            name: res.data.name ?? res.data.label,
            price: String(res.data.price ?? ''),
            categoryId: String(res.data.categoryId ?? ''),
            sizeId: String(res.data.sizeId ?? ''),
            colorId: String(res.data.colorId ?? ''),
            images: imgs,
            isFeatured: !!res.data.isFeatured,
            isArchived: !!res.data.isArchived,
          });
        } catch {
          const list = await axios.get(`/api/${params.storeId}/products`);
          const found = (list.data || []).find((p: any) => p.id === params.productId);
          if (found) form.reset({
            name: found.name ?? found.label,
            price: String(found.price ?? ''),
            categoryId: String(found.categoryId ?? ''),
            sizeId: String(found.sizeId ?? ''),
            colorId: String(found.colorId ?? ''),
            images: (found.images || []).map((im: any) => (typeof im === 'string' ? im : String(im?.url || ''))).filter(Boolean) ?? (found.imageUrl ? [found.imageUrl] : []),
            isFeatured: !!found.isFeatured,
            isArchived: !!found.isArchived,
          });
          else toast.error("Failed to load product");
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [params.storeId, params.productId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(`/api/${params.storeId}/categories`, { params: { t: Date.now() } });
        const list = (res.data || []).map((c: any) => ({ id: c.id, name: c.name }));
        setCategories(list);
      } catch {}
    };
    loadCategories();
  }, [params.storeId]);

  useEffect(() => {
    const loadSizes = async () => {
      try {
        const res = await axios.get(`/api/${params.storeId}/sizes`, { params: { t: Date.now() } });
        const list = (res.data || []).map((s: any) => ({ id: s.id, name: s.name }));
        setSizes(list);
      } catch {}
    };
    loadSizes();
  }, [params.storeId]);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const res = await axios.get(`/api/${params.storeId}/colors`, { params: { t: Date.now() } });
        const list = (res.data || []).map((c: any) => ({ id: c.id, name: c.name }));
        setColors(list);
      } catch {}
    };
    loadColors();
  }, [params.storeId]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const payload = { 
        name: data.name,
        images: (data.images || []).map((url) => ({ url })),
        price: data.price,
        categoryId: data.categoryId,
        sizeId: data.sizeId,
        colorId: data.colorId,
        isFeatured: !!data.isFeatured,
        isArchived: !!data.isArchived,
      };
      await axios.patch(`/api/${params.storeId}/products/${params.productId}`, payload);
      toast.success("Product updated.");
      router.refresh();
      router.push(`/${params.storeId}/products?refresh=${Date.now()}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      toast.success("Product deleted.");
      router.refresh();
      router.push(`/${params.storeId}/products?refresh=${Date.now()}`);
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title="Edit Product" description="Update product details" />
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading || initialLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField 
            control={form.control}
            name="images"
            render={({field}) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value}
                    disabled={loading || initialLoading}
                    onChange={(url) => field.onChange([...(field.value || []), url])}
                    onChangeMany={(urls) => field.onChange([...(field.value || []), ...urls])}
                    onRemove={(url) => field.onChange((field.value || []).filter((u: string) => u !== url))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading || initialLoading} placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input disabled={loading || initialLoading} placeholder="0.00" type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      // @ts-ignore
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>
                      Featured
                    </FormLabel>
                    <FormDescription>
                      This product will appear on the home page.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md'>
                  <FormControl>
                    <Checkbox
                      // @ts-ignore
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>
                      Archived
                    </FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading || initialLoading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};


