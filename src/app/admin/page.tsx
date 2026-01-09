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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/shared/dialogs/ProductDialog';
import { OrderDialog } from '@/components/shared/dialogs/OrderDialog';
import { TypeDialog } from '@/components/shared/dialogs/TypeDialog';
import { DeliveryMethodDialog } from '@/components/shared/dialogs/DeliveryMethodDialog';
import { ConfirmDialog } from '@/components/shared/dialogs/ConfirmDialog';
import { IType } from '@/types/types';
import { IDeliveryMethod } from '@/types/delivery-method';
import { Accordion } from '@radix-ui/react-accordion';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Order } from '@/types/order.d';
import { Pencil, Trash2, ChevronDownIcon } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

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
  const [isDeliveryMethodDialogOpen, setIsDeliveryMethodDialogOpen] = useState(false);
  const [editingDeliveryMethod, setEditingDeliveryMethod] = useState<IDeliveryMethod | null>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<IDeliveryMethod[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  
  // Фильтры для товаров
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'count' | 'type' | 'visible'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [filterPriceMin, setFilterPriceMin] = useState<string>('');
  const [filterPriceMax, setFilterPriceMax] = useState<string>('');
  const [filterCountMin, setFilterCountMin] = useState<string>('');
  const [filterCountMax, setFilterCountMax] = useState<string>('');
  const [filterTitle, setFilterTitle] = useState<string>('');
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
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
      loadDeliveryMethods();
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

  const loadDeliveryMethods = async () => {
    try {
      const response = await axios.get('/api/delivery-methods');
      setDeliveryMethods(response.data);
    } catch (error) {
      console.error('Ошибка загрузки способов доставки:', error);
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

  const handleDeleteProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    const productName = product?.title || 'товар';
    
    setConfirmDialog({
      open: true,
      title: 'Удаление товара',
      description: `Вы уверены, что хотите удалить товар "${productName}"? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/products/${id}`);
          toast.success('Продукт удалён');
          await loadProducts();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Не удалось удалить продукт');
        }
      },
      variant: 'destructive',
    });
  };

  const handleDeleteOrder = (id: number) => {
    const order = orders.find(o => o.id === id);
    const orderInfo = order ? `заказ #${order.id} (${order.email})` : 'заказ';
    
    setConfirmDialog({
      open: true,
      title: 'Удаление заказа',
      description: `Вы уверены, что хотите удалить ${orderInfo}? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/orders/${id}`);
          toast.success('Заказ удалён');
          await loadOrders();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Не удалось удалить заказ');
        }
      },
      variant: 'destructive',
    });
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

  const handleDeleteType = (id: number) => {
    const type = types.find(t => t.id === id);
    const typeName = type ? `"${type.name}" (${type.value})` : 'тип товара';
    
    setConfirmDialog({
      open: true,
      title: 'Удаление типа товара',
      description: `Вы уверены, что хотите удалить тип товара ${typeName}? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/types/${id}`);
          toast.success('Тип товара удалён');
          await loadTypes();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Не удалось удалить тип товара');
        }
      },
      variant: 'destructive',
    });
  };

  const handleEditDeliveryMethod = (method: IDeliveryMethod) => {
    setEditingDeliveryMethod(method);
    setIsDeliveryMethodDialogOpen(true);
  };

  const handleDeleteDeliveryMethod = (id: number) => {
    const method = deliveryMethods.find(m => m.id === id);
    const methodName = method ? `"${method.name}"` : 'способ доставки';
    
    setConfirmDialog({
      open: true,
      title: 'Удаление способа доставки',
      description: `Вы уверены, что хотите удалить способ доставки ${methodName}? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/delivery-methods/${id}`);
          toast.success('Способ доставки удалён');
          await loadDeliveryMethods();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Не удалось удалить способ доставки');
        }
      },
      variant: 'destructive',
    });
  };

  const handleDeliveryMethodDialogClose = (open: boolean) => {
    setIsDeliveryMethodDialogOpen(open);
    if (!open) setEditingDeliveryMethod(null);
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

  // Фильтрация и сортировка товаров
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Фильтр по названию
    if (filterTitle.trim()) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(filterTitle.toLowerCase().trim())
      );
    }

    // Фильтр по типу
    if (filterType !== 'all') {
      const typeId = parseInt(filterType);
      filtered = filtered.filter(p => p.type?.id === typeId);
    }

    // Фильтр по видимости
    if (filterVisible !== 'all') {
      const isVisible = filterVisible === 'true';
      filtered = filtered.filter(p => p.visible === isVisible);
    }

    // Фильтр по цене
    if (filterPriceMin) {
      const min = parseFloat(filterPriceMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
      }
    }
    if (filterPriceMax) {
      const max = parseFloat(filterPriceMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    // Фильтр по количеству
    if (filterCountMin) {
      const min = parseInt(filterCountMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.count >= min);
      }
    }
    if (filterCountMax) {
      const max = parseInt(filterCountMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.count <= max);
      }
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'count':
          aValue = a.count;
          bValue = b.count;
          break;
        case 'type':
          aValue = a.type?.name || '';
          bValue = b.type?.name || '';
          break;
        case 'visible':
          aValue = a.visible ? 1 : 0;
          bValue = b.visible ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
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
                            <Button variant="outline" size="icon" onClick={() => handleEditType(type)} title="Редактировать">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteType(type.id)} title="Удалить">
                              <Trash2 className="h-4 w-4" />
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

        {/* Способы доставки */}
        <AccordionItem value="item-4">
          <AccordionTrigger>
            <h1 className='text-2xl font-bold'>Способы доставки</h1>
          </AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <Button onClick={() => {
                  setEditingDeliveryMethod(null);
                  setIsDeliveryMethodDialogOpen(true);
                }}>
                  Добавить способ доставки
                </Button>
              </div>
              <DeliveryMethodDialog
                open={isDeliveryMethodDialogOpen}
                onOpenChange={handleDeliveryMethodDialogClose}
                method={editingDeliveryMethod}
                onSuccess={loadDeliveryMethods}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        Нет способов доставки
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveryMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell>{method.id}</TableCell>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{method.description || '-'}</TableCell>
                        <TableCell>
                          <span className={method.active ? 'text-green-600' : 'text-red-600'}>
                            {method.active ? 'Активен' : 'Неактивен'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEditDeliveryMethod(method)} title="Редактировать">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteDeliveryMethod(method.id)} title="Удалить">
                              <Trash2 className="h-4 w-4" />
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
              
              {/* Фильтры в аккордеоне */}
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="filters" className="border-none">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <h3 className='text-lg font-semibold'>Фильтры и сортировка</h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className='space-y-4'>
                      {/* Строка 1: Поиск по названию, Сортировать по, Порядок, Тип, Видимость */}
                      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Поиск по названию</label>
                          <Input
                            placeholder='Введите название...'
                            value={filterTitle}
                            onChange={(e) => setFilterTitle(e.target.value)}
                          />
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Сортировать по</label>
                          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title">Название</SelectItem>
                              <SelectItem value="price">Цена</SelectItem>
                              <SelectItem value="count">Количество</SelectItem>
                              <SelectItem value="type">Тип</SelectItem>
                              <SelectItem value="visible">Видимость</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Порядок</label>
                          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">По возрастанию</SelectItem>
                              <SelectItem value="desc">По убыванию</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Тип</label>
                          <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все типы</SelectItem>
                              {types.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Видимость</label>
                          <Select value={filterVisible} onValueChange={setFilterVisible}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все</SelectItem>
                              <SelectItem value="true">Видимые</SelectItem>
                              <SelectItem value="false">Скрытые</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Строка 3: Цена от/до */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>Цена (₽)</label>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <label className='text-xs text-muted-foreground'>От</label>
                            <Input
                              type='number'
                              min='0'
                              placeholder='0'
                              value={filterPriceMin}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (!value.includes('-') && parseFloat(value) >= 0)) {
                                  setFilterPriceMin(value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-xs text-muted-foreground'>До</label>
                            <Input
                              type='number'
                              min='0'
                              placeholder='∞'
                              value={filterPriceMax}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (!value.includes('-') && parseFloat(value) >= 0)) {
                                  setFilterPriceMax(value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Строка 4: Количество от/до */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>Количество</label>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <label className='text-xs text-muted-foreground'>От</label>
                            <Input
                              type='number'
                              min='0'
                              placeholder='0'
                              value={filterCountMin}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (!value.includes('-') && parseInt(value) >= 0)) {
                                  setFilterCountMin(value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-xs text-muted-foreground'>До</label>
                            <Input
                              type='number'
                              min='0'
                              placeholder='∞'
                              value={filterCountMax}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (!value.includes('-') && parseInt(value) >= 0)) {
                                  setFilterCountMax(value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Кнопка сброса фильтров */}
                      <div className='flex justify-end pt-2'>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setSortBy('title');
                            setSortOrder('asc');
                            setFilterType('all');
                            setFilterVisible('all');
                            setFilterPriceMin('');
                            setFilterPriceMax('');
                            setFilterCountMin('');
                            setFilterCountMax('');
                            setFilterTitle('');
                          }}
                        >
                          Сбросить фильтры
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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
                  {(() => {
                    const filteredProducts = getFilteredAndSortedProducts();
                    if (filteredProducts.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500">
                            {products.length === 0 ? 'Нет товаров' : 'Товары не найдены по заданным фильтрам'}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return filteredProducts.map((product) => {
                      const validatedProduct = productResponseSchema.parse(product);
                      return (
                        <TableRow key={validatedProduct.id}>
                          <TableCell>{validatedProduct.id}</TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/product/${validatedProduct.id}`}>{validatedProduct.title}</Link>
                          </TableCell>
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
                              <Button variant="outline" size="icon" onClick={() => handleEditProduct(validatedProduct)} title="Редактировать">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(validatedProduct.id)} title="Удалить">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
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
                    <TableHead className="w-10">Товары</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Получатель</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Адрес</TableHead>
                    <TableHead>Способ доставки</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-gray-500">
                        Нет заказов
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id);
                      return (
                        <React.Fragment key={order.id}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setExpandedOrders(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(order.id)) {
                                      newSet.delete(order.id);
                                    } else {
                                      newSet.add(order.id);
                                    }
                                    return newSet;
                                  });
                                }}
                              >
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                            </TableCell>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.email}</TableCell>
                            <TableCell>{(order as any).fullName}</TableCell>
                            <TableCell>{(order as any).phone}</TableCell>
                            <TableCell>{(order as any).address}</TableCell>
                            <TableCell>
                              {(order as any).deliveryMethod?.name || '-'}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const status = (order as any).status || 'PENDING';
                                const statusConfig = {
                                  PENDING: { label: 'В ожидании', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                                  SUCCEEDED: { label: 'Оплачен', className: 'bg-green-100 text-green-800 border-green-300' },
                                  IN_TRANSIT: { label: 'В пути', className: 'bg-blue-100 text-blue-800 border-blue-300' },
                                  CANCELLED: { label: 'Отменен', className: 'bg-red-100 text-red-800 border-red-300' },
                                };
                                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
                                
                                return (
                                  <Select
                                    value={status}
                                    onValueChange={async (newStatus) => {
                                      try {
                                        await axios.patch(`/api/orders/${order.id}`, { status: newStatus });
                                        toast.success('Статус заказа обновлен');
                                        await loadOrders();
                                      } catch (error: any) {
                                        toast.error(error.response?.data?.error || 'Не удалось обновить статус');
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-auto h-auto border-0 p-0 bg-transparent hover:bg-transparent shadow-none focus:ring-0">
                                      <SelectValue>
                                        <Badge variant="outline" className={`${config.className} cursor-pointer`}>
                                          {config.label}
                                        </Badge>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                          В ожидании
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="SUCCEEDED">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                          Оплачен
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="IN_TRANSIT">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                          В пути
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="CANCELLED">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                          Отменен
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                );
                              })()}
                            </TableCell>
                            <TableCell>{order.totalAmount?.toLocaleString('ru-RU')} ₽</TableCell>
                            <TableCell>{order.createdAt && (new Date(order.createdAt)).toLocaleString('ru-RU')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEditOrder(order)} title="Просмотр/редактирование">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteOrder(order.id)} title="Удалить">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={11} className="bg-gray-50 p-4">
                                <div className="py-2">
                                  <h4 className="font-semibold mb-3">Товары в заказе:</h4>
                                  {order.items && order.items.length > 0 ? (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>ID товара</TableHead>
                                          <TableHead>Название</TableHead>
                                          <TableHead>Количество</TableHead>
                                          <TableHead>Цена за единицу</TableHead>
                                          <TableHead>Сумма</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.items.map((item: any) => (
                                          <TableRow key={item.id}>
                                            <TableCell>{item.productId}</TableCell>
                                            <TableCell>{item.product?.title || '–'}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.price?.toLocaleString('ru-RU')} ₽</TableCell>
                                            <TableCell>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <p className="text-gray-500">Товары не найдены</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Диалог подтверждения */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant || 'default'}
      />
    </div>
  );
}
