"use client";

import { Check, ChevronsUpDown, PlusCircle, Store as StoreIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useParams, usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";




type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherItem { id: string; name: string }
interface StoreSwitcherProps extends PopoverTriggerProps {
  items: StoreSwitcherItem[];
}

export default function StoreSwitcher({
  className,
   items = []
 }: StoreSwitcherProps
) {
  const storeModal = useStoreModal();
  const params = useParams();
  const pathname = usePathname(); // ensure re-render on route change
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

   const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id,
   }));

   const rawId = (params as any)?.storeId;
   const storeId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
   const currentStore = formattedItems.find((item) => item.value === storeId);

   const [open, setOpen] = useState(false);

   const onStoreSelect = (store: { value: string; label: string }) => {
     setOpen(false);
        router.push(`/${store.value}`);
   }

   if (!mounted) {
     return null;
   }

    return (
        <Popover open={open} onOpenChange={setOpen}>
   <PopoverTrigger asChild>
   <Button
     variant={"outline"}
        size={"sm"}
        role="combobox"
        aria-expanded={open}
        aria-label="Current Store"
        className={cn( "w-[200px] justify-between ", className)}
        >
      <StoreIcon  className= "mr-2 h-4 w-4" />
      {currentStore?.label ?? "Select a store"}
      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
   </Button>
   </PopoverTrigger>
  <PopoverContent className= "w-[200px] p-0">
  <Command>
  <CommandList>
  <CommandInput placeholder="Search store..." />
  <CommandEmpty>No store found.</CommandEmpty>
  <CommandGroup heading="Stores">
  {formattedItems.map((option) => (
    <CommandItem
     key={option.value}
     onSelect={() => onStoreSelect(option)}
     className="text-sm"
    >
      <StoreIcon className="mr-2 h-4 w-4"/>
   {option.label}
    <Check 
      className={cn(
        "ml-auto h-4 w-4",
        currentStore?.value === option.value
          ? "opacity-100"
          : "opacity-0"
    )}
    />
    </CommandItem>
  ))}
  </CommandGroup>
  </CommandList>
  <CommandSeparator />
   <CommandList>
    <CommandGroup>
        <CommandItem
          onSelect={() => {
            setOpen(false);
            storeModal.onOpen();
          }}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Store
         </CommandItem>
    </CommandGroup>
   </CommandList>
  </Command>
  </PopoverContent>
        </Popover>
    );
};
