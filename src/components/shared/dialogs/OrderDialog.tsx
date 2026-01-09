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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/types/order.d';
import { IDeliveryMethod } from '@/types/delivery-method';

const statuses = [
  { value: 'PENDING', label: 'В ожидании' },
  { value: 'SUCCEEDED', label: 'Оплачен' },
  { value: 'IN_TRANSIT', label: 'В пути' },
  { value: 'CANCELLED', label: 'Отменен' },
];

export type OrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSuccess: () => void;
};

export function OrderDialog({ open, onOpenChange, order, onSuccess }: OrderDialogProps) {
  const isEditMode = !!order;
  const [loading, setLoading] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<IDeliveryMethod[]>([]);

  const orderSchema = z.object({
    fullName: z.string().min(1, 'ФИО обязательно'),
    email: z.string().email('Некорректный email'),
    phone: z.string().min(3, 'Телефон обязателен'),
    address: z.string().min(3, 'Адрес обязателен'),
    status: z.enum(['PENDING', 'SUCCEEDED', 'CANCELLED', 'IN_TRANSIT']),
    comment: z.string().optional(),
    totalAmount: z.number().nonnegative(),
    deliveryMethodId: z.number().nullable().optional(),
  });

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: order?.fullName || '',
      email: order?.email || '',
      phone: order?.phone || '',
      address: order?.address || '',
      status: order?.status || 'PENDING',
      comment: order?.comment || '',
      totalAmount: order?.totalAmount || 0,
      deliveryMethodId: order?.deliveryMethodId || null,
    },
  });

  useEffect(() => {
    loadDeliveryMethods();
  }, []);

  useEffect(() => {
    if (order && open) {
      form.reset({
        fullName: order.fullName || '',
        email: order.email || '',
        phone: order.phone || '',
        address: order.address || '',
        status: order.status || 'PENDING',
        comment: order.comment || '',
        totalAmount: order.totalAmount || 0,
        deliveryMethodId: order.deliveryMethodId || null,
      });
    }
  }, [order, open, form]);

  const loadDeliveryMethods = async () => {
    try {
      const response = await axios.get('/api/delivery-methods');
      setDeliveryMethods(response.data);
    } catch (error) {
      console.error('Ошибка загрузки способов доставки:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof orderSchema>) => {
    if (!order) return;
    try {
      setLoading(true);
      await axios.patch(`/api/orders/${order.id}`, data);
      toast.success('Заказ обновлен');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось обновить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{isEditMode ? `Заказ #${order?.id}` : 'Добавить заказ'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Редактируйте поля и сохраняйте изменения' : 'Заполните все поля заказа'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ФИО получателя</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адрес доставки</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Способ доставки</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value?.toString() || undefined} 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите способ доставки" />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id.toString()}>
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус заказа</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(s => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма заказа (₽)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Комментарий к заказу</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Товары в заказе (только просмотр) */}
                {order?.items && (
                  <div>
                    <div className="font-semibold mb-2">Товары:</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID товара</TableHead>
                          <TableHead>Название</TableHead>
                          <TableHead>Кол-во</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item: any) => (
                          <TableRow key={item.productId}>
                            <TableCell>{item.productId}</TableCell>
                            <TableCell>{item.product?.title || '–'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 pb-6 pt-4 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Отмена
              </Button>
              {isEditMode && (
                <Button type="submit" disabled={loading || !form.formState.isValid}>
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
