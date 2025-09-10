"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import { AlertModal } from "@/components/modals/alert-modal";
import { Trash } from "lucide-react";

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
    initialData?: {
        id: string;
        label: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    } | null;
}

export const BillboardForm = ({ initialData }: BillboardFormProps) => {
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const title = initialData ? "Edit Billboard" : "Create Billboard";
    const description = initialData ? "Edit a billboard" : "Add a new billboard";
    const toastMessage = initialData ? "Billboard updated." : "Billboard created.";
    const action = initialData ? "Save changes" : "Create";

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            label: initialData.label,
            imageUrl: initialData.imageUrl,
        } : {
            label: '',
            imageUrl: '',
        }
    });

    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true);
            console.log("Submitting billboard data:", data);
            console.log("Store ID:", params.storeId);
            
            if (initialData) {
                console.log("Updating billboard:", initialData.id);
                await axios.patch(`/api/${params.storeId}/billboards/${initialData.id}`, data);
                router.refresh();
                router.push(`/${params.storeId}/billboards`);
                toast.success(toastMessage);
            } else {
                console.log("Creating new billboard");
                const response = await axios.post(`/api/${params.storeId}/billboards`, data);
                console.log("Billboard created with ID:", response.data.id);
                console.log("Full response:", response.data);
                router.refresh();
                router.push(`/${params.storeId}/billboards`);
                toast.success(toastMessage);
            }
        } catch (error: any) {
            console.error("Billboard submission error:", error);
            console.error("Error response:", error.response?.data);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/billboards/${initialData?.id}`);
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            toast.success("Billboard deleted.");
        } catch (error) {
            toast.error("Make sure you removed all categories using this billboard first.");
        } finally {
            setLoading(false);
        }
    }



   return(
<>
            <AlertModal 
              isOpen={open}
              onClose={() => setOpen(false)}
              onConfirm={onDelete}
              loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    disabled={loading}
                    onClick={() => setOpen(true)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField 
                            control={form.control}
                            name="imageUrl"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Background image</FormLabel>
                                    <FormControl>
                                       <ImageUpload 
                                       value={field.value ? [field.value] : [] }
                                         disabled={loading}
                                         onChange={(url) => field.onChange(url)}
                                         onRemove={() => field.onChange("")}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                            control={form.control}
                            name="label"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Billboard label" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
            {initialData ? null : <Separator />}
        </>
    );
};
