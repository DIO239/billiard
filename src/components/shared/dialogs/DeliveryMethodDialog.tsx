"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IDeliveryMethod } from '@/types/delivery-method';
import { deliveryMethodCreateSchema } from '@/validation/delivery-method';

export type DeliveryMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: IDeliveryMethod | null;
  onSuccess: () => void;
};

export function DeliveryMethodDialog({ open, onOpenChange, method, onSuccess }: DeliveryMethodDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof deliveryMethodCreateSchema>>({
    resolver: zodResolver(deliveryMethodCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
  });

  useEffect(() => {
    if (method && open) {
      form.reset({
        name: method.name,
        description: method.description || '',
        active: method.active,
      });
    } else if (!method && open) {
      form.reset({
        name: '',
        description: '',
        active: true,
      });
    }
  }, [method, open, form]);

  const onSubmit = async (data: z.infer<typeof deliveryMethodCreateSchema>) => {
    try {
      setLoading(true);
      if (method) {
        await axios.patch(`/api/delivery-methods/${method.id}`, data);
        toast.success('Способ доставки обновлен');
      } else {
        await axios.post('/api/delivery-methods', data);
        toast.success('Способ доставки создан');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось сохранить способ доставки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {method ? 'Редактировать способ доставки' : 'Добавить способ доставки'}
          </DialogTitle>
          <DialogDescription>
            {method ? 'Измените данные способа доставки' : 'Заполните данные для нового способа доставки'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Курьерская доставка" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Описание способа доставки"
                      {...field}
                      value={field.value || ''}
                      rows={3}
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Активен</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Способ доставки доступен для выбора
                    </div>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {method ? 'Сохранить изменения' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
