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

type SizeFormValues = z.infer<typeof formSchema>;

export const SizeEditForm = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<SizeFormValues>({
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
          const res = await axios.get(`/api/${params.storeId}/sizes/${params.sizeId}`);
          form.reset({ name: res.data.name, value: res.data.value });
        } catch {
          const list = await axios.get(`/api/${params.storeId}/sizes`);
          const found = (list.data || []).find((s: any) => s.id === params.sizeId);
          if (found) form.reset({ name: found.name, value: found.value });
          else toast.error("Failed to load size");
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [params.storeId, params.sizeId]);

  const onSubmit = async (data: SizeFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data);
      toast.success("Size updated.");
      router.refresh();
      router.push(`/${params.storeId}/sizes?refresh=${Date.now()}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
      toast.success("Size deleted.");
      router.refresh();
      router.push(`/${params.storeId}/sizes?refresh=${Date.now()}`);
    } catch {
      toast.error("Failed to delete size.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const title = "Edit Size";
  const description = "Update size details";
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
                    <Input disabled={loading || initialLoading} placeholder="Size name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input disabled={loading || initialLoading} placeholder="e.g. XL, 42, 10" {...field} />
                  </FormControl>
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






