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
import { AlertModal } from "@/components/modals/alert-modal";
import { Trash } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type ColorFormValues = z.infer<typeof formSchema>;

export const ColorEditForm = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        try {
          const res = await axios.get(`/api/${params.storeId}/colors/${params.colorId}`);
          form.reset({ name: res.data.name, value: res.data.value });
        } catch {
          const list = await axios.get(`/api/${params.storeId}/colors`);
          const found = (list.data || []).find((c: any) => c.id === params.colorId);
          if (found) form.reset({ name: found.name, value: found.value });
          else toast.error("Failed to load color");
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [params.storeId, params.colorId]);

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data);
      toast.success("Color updated.");
      router.refresh();
      router.push(`/${params.storeId}/colors?refresh=${Date.now()}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
      toast.success("Color deleted.");
      router.refresh();
      router.push(`/${params.storeId}/colors?refresh=${Date.now()}`);
    } catch {
      toast.error("Failed to delete color.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const title = "Edit Color";
  const description = "Update color details";
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
                    <Input disabled={loading || initialLoading} placeholder="Color name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => {
                const val = (field.value || "") as string;
                const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val);
                const previewColor = isHex ? val : "transparent";
                return (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input disabled={loading || initialLoading} placeholder="#000000" {...field} />
                        <div
                          aria-label="color preview"
                          className="h-6 w-6 rounded-full border"
                          style={{ backgroundColor: previewColor }}
                          title={isHex ? val : "Enter hex like #fff or #ffffff"}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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


