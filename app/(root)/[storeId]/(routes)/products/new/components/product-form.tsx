"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(1),
    price: z.string().min(1),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    isFeatured: z.boolean().optional().default(false),
    isArchived: z.boolean().optional().default(false),
    images: z.array(z.string().min(1)).min(1, { message: "At least one image is required" }),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm = () => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
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
      isFeatured: false,
      isArchived: false,
      images: [],
    },
  });

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
      await axios.post(`/api/${params.storeId}/products`, payload);
      toast.success("Product created.");
      router.refresh();
      router.push(`/${params.storeId}/products`);
    } catch (e) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Create Product" description="Add a new product" />
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
                    disabled={loading}
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
                    <Input disabled={loading} placeholder="Product name" {...field} />
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
                    <Input disabled={loading} placeholder="0.00" type="number" step="0.01" min="0" {...field} />
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
                      {sizes.map((c) => (
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
                      The product will appear on the home page.
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
          <Button disabled={loading} className="ml-auto" type="submit">
            Create
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};


