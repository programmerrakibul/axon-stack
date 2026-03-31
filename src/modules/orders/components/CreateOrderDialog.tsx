"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateOrderForm } from "./CreateOrderForm";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new order.
          </DialogDescription>
        </DialogHeader>
        <CreateOrderForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
