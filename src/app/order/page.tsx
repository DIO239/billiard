"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { IDeliveryMethod } from '@/types/delivery-method';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    media: Array<{
      id: number;
      name: string;
      type: string;
      showOnMain: boolean;
    }>;
  };
}

interface Cart {
  id: number;
  totalAmount: number;
  items: CartItem[];
}

const orderFormSchema = z.object({
  fullName: z.string().min(1, 'ФИО обязательно'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(1, 'Телефон обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  comment: z.string().optional(),
  deliveryMethodId: z.string().min(1, 'Выберите способ доставки'),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function Order() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<IDeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      fullName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      comment: '',
      deliveryMethodId: '',
    },
  });

  useEffect(() => {
    loadCart();
    loadDeliveryMethods();
  }, []);

  useEffect(() => {
    if (user) {
      form.setValue('email', user.email || '');
    }
  }, [user, form]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error: any) {
      console.error('Ошибка загрузки корзины:', error);
      toast.error('Не удалось загрузить корзину');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryMethods = async () => {
    try {
      const response = await axios.get('/api/delivery-methods');
      const activeMethods = response.data.filter((m: IDeliveryMethod) => m.active);
      setDeliveryMethods(activeMethods);
    } catch (error) {
      console.error('Ошибка загрузки способов доставки:', error);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        userId: user?.id || null,
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        comment: data.comment || null,
        deliveryMethodId: data.deliveryMethodId ? parseInt(data.deliveryMethodId) : null,
      };

      const response = await axios.post('/api/orders', orderData);
      toast.success('Заказ успешно оформлен!');
      
      // Очищаем корзину
      try {
        await axios.post('/api/cart/clear', { userId: user?.id });
      } catch (error) {
        console.error('Ошибка очистки корзины:', error);
      }

      // Перенаправляем на страницу успеха или обратно в корзину
      router.push('/cart');
    } catch (error: any) {
      console.error('Ошибка оформления заказа:', error);
      toast.error(error.response?.data?.error || 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-6">Добавьте товары в корзину перед оформлением заказа</p>
          <Link href="/">
            <Button>Вернуться к покупкам</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="border rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов Иван Иванович" {...field} />
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
                          <Input type="email" placeholder="example@mail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => {
                      const formatPhone = (value: string) => {
                        // Удаляем все нецифровые символы кроме +
                        let numbers = value.replace(/[^\d+]/g, '');
                        
                        // Если начинается с 8, заменяем на +7
                        if (numbers.startsWith('8')) {
                          numbers = '+7' + numbers.slice(1);
                        } else if (numbers.startsWith('7')) {
                          numbers = '+' + numbers;
                        } else if (!numbers.startsWith('+')) {
                          numbers = '+7' + numbers;
                        }
                        
                        // Ограничиваем до +7 и 10 цифр
                        if (numbers.startsWith('+7')) {
                          numbers = '+7' + numbers.slice(2).replace(/\D/g, '').slice(0, 10);
                        } else {
                          numbers = '+7';
                        }
                        
                        // Форматируем в +7 (999) 999-99-99
                        const digits = numbers.slice(2);
                        if (digits.length === 0) return '+7';
                        if (digits.length <= 3) return `+7 (${digits}`;
                        if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
                        if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                        return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
                      };

                      return (
                        <FormItem>
                          <FormLabel>Телефон</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+7 (999) 123-45-67"
                              value={field.value || ''}
                              onChange={(e) => {
                                const formatted = formatPhone(e.target.value);
                                field.onChange(formatted);
                              }}
                              onBlur={field.onBlur}
                              onKeyDown={(e) => {
                                // Разрешаем удаление, backspace, tab, escape, enter
                                if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
                                  return;
                                }
                                // Разрешаем стрелки и другие служебные клавиши
                                if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
                                  return;
                                }
                                // Разрешаем Ctrl/Cmd комбинации
                                if (e.ctrlKey || e.metaKey) {
                                  return;
                                }
                                // Разрешаем только цифры
                                if (!/^\d$/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Адрес доставки</h2>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Input placeholder="Город, улица, дом, квартира" {...field} />
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
                        <FormLabel>Способ доставки *</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value || undefined} 
                            onValueChange={(value) => field.onChange(value)}
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
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Комментарий к заказу</h2>
                  
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Комментарий (необязательно)</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Дополнительная информация к заказу"
                            {...field}
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Оформление заказа...
                    </>
                  ) : (
                    'Оформить заказ'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Сводка заказа */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => {
                  const productImage = item.product.media.find(m => m.showOnMain === true) || item.product.media[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      {productImage && (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={productImage.name}
                            alt={item.product.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.product.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.product.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого:</span>
                  <span>{cart.totalAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
