"use client";

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';
import { productsListResponseSchema, productResponseSchema, ProductResponse } from '@/validation/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/shared/dialogs/ProductDialog';
import { OrderDialog } from '@/components/shared/dialogs/OrderDialog';
import { TypeDialog } from '@/components/shared/dialogs/TypeDialog';
import { IType } from '@/types/types';
import { Accordion } from '@radix-ui/react-accordion';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Order } from '@/types/order.d';

export default function Admin() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<IType | null>(null);
  const [types, setTypes] = useState<IType[]>([]);
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      notFound();
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadProducts();
      loadTypes();
      loadOrders();
    }
  }, [isAuthenticated, isAdmin]);

  const loadTypes = async () => {
    try {
      const response = await axios.get('/api/types');
      setTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      const validatedData = productsListResponseSchema.parse(response.data);
      setProducts(validatedData.products);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      toast.error('Не удалось загрузить продукты');
      if (error instanceof Error) {
        console.error('Детали ошибки:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Не удалось загрузить заказы');
      if (error instanceof Error) {
        console.error('Ошибка загрузки заказов:', error.message);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Продукт удалён');
      await loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось удалить продукт');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return;
    }
    try {
      await axios.delete(`/api/orders/${id}`);
      toast.success('Заказ удалён');
      await loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось удалить заказ');
    }
  };

  const handleEditProduct = (product: ProductResponse) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleEditType = (type: IType) => {
    setEditingType(type);
    setIsTypeDialogOpen(true);
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тип товара?')) {
      return;
    }
    try {
      await axios.delete(`/api/types/${id}`);
      toast.success('Тип товара удалён');
      await loadTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось удалить тип товара');
    }
  };

  const handleOrderDialogClose = (open: boolean) => {
    setIsOrderDialogOpen(open);
    if (!open) setEditingOrder(null);
  };

  const handleTypeDialogClose = (open: boolean) => {
    setIsTypeDialogOpen(open);
    if (!open) setEditingType(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingProduct(null);
  };

  if (isLoading || loading || ordersLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className='size-8' />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className='px-16 mt-8'>
      <Accordion type="multiple">
        {/* Типы товаров */}
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <h1 className='text-2xl font-bold'>Типы товаров</h1>
          </AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <Button onClick={() => {
                  setEditingType(null);
                  setIsTypeDialogOpen(true);
                }}>
                  Добавить тип товара
                </Button>
              </div>
              <TypeDialog
                open={isTypeDialogOpen}
                onOpenChange={handleTypeDialogClose}
                type={editingType}
                onSuccess={loadTypes}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Значение (value)</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Нет типов товаров
                      </TableCell>
                    </TableRow>
                  ) : (
                    types.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>{type.id}</TableCell>
                        <TableCell className="font-medium">{type.value}</TableCell>
                        <TableCell>{type.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditType(type)}>
                              Редактировать
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteType(type.id)}>
                              Удалить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Товары */}
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h1 className='text-2xl font-bold'>Товары</h1>
          </AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <Button onClick={() => {
                  setEditingProduct(null);
                  setIsDialogOpen(true);
                }}>
                  Добавить товар
                </Button>
              </div>
              <ProductDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                product={editingProduct}
                types={types}
                onSuccess={loadProducts}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Видимость</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        Нет товаров
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const validatedProduct = productResponseSchema.parse(product);
                      return (
                        <TableRow key={validatedProduct.id}>
                          <TableCell>{validatedProduct.id}</TableCell>
                          <TableCell className="font-medium">{validatedProduct.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{validatedProduct.description}</TableCell>
                          <TableCell>{validatedProduct.price.toLocaleString('ru-RU')} ₽</TableCell>
                          <TableCell>{validatedProduct.count}</TableCell>
                          <TableCell>{validatedProduct.type?.name || 'Не указан'}</TableCell>
                          <TableCell>
                            <span className={validatedProduct.visible ? 'text-green-600' : 'text-red-600'}>
                              {validatedProduct.visible ? 'Видимый' : 'Скрытый'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditProduct(validatedProduct)}>
                                Редактировать
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(validatedProduct.id)}>
                                Удалить
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Заказы */}
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <h1 className='text-2xl font-bold'>Заказы</h1>
          </AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-4'>
              <OrderDialog
                open={isOrderDialogOpen}
                onOpenChange={handleOrderDialogClose}
                order={editingOrder}
                onSuccess={loadOrders}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Получатель</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Адрес</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500">
                        Нет заказов
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>{(order as any).fullName}</TableCell>
                        <TableCell>{(order as any).phone}</TableCell>
                        <TableCell>{(order as any).address}</TableCell>
                        <TableCell>{(order as any).status}</TableCell>
                        <TableCell>{order.totalAmount?.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell>{order.createdAt && (new Date(order.createdAt)).toLocaleString('ru-RU')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                              Просмотр/ред.
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                              Удалить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
