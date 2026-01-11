"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/dialogs/ConfirmDialog';

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

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null); // ID товара, который обновляется
  const [quantityInputs, setQuantityInputs] = useState<Record<number, number>>({});
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

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Cart>('/api/cart');
      const cartData = response.data;
      setCart(cartData);
      // Инициализируем локальные значения для input'ов
      const inputs: Record<number, number> = {};
      if (cartData.items && Array.isArray(cartData.items)) {
        cartData.items.forEach(item => {
          if (item?.product?.id) {
            inputs[item.product.id] = item.quantity;
          }
        });
      }
      setQuantityInputs(inputs);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      toast.error('Не удалось загрузить корзину');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setUpdating(productId);
    try {
      const response = await axios.post<Cart>('/api/cart/update', {
        productId,
        quantity: newQuantity,
        ...(user?.id && { userId: user.id }),
      });
      setCart(response.data);
      // Отправляем событие обновления корзины
      window.dispatchEvent(new Event('cartUpdated'));
      // Обновляем локальное значение input'а
      setQuantityInputs(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
      toast.success('Количество обновлено');
    } catch (error: any) {
      console.error('Ошибка обновления количества:', error);
      toast.error(error.response?.data?.error || 'Не удалось обновить количество');
      // Восстанавливаем исходное значение при ошибке
      const item = cart?.items.find(i => i.product.id === productId);
      if (item) {
        setQuantityInputs(prev => ({
          ...prev,
          [productId]: item.quantity
        }));
      }
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: number) => {
    const product = cart?.items.find(item => item.product.id === productId)?.product;
    const productName = product?.title || 'товар';
    
    setConfirmDialog({
      open: true,
      title: 'Удаление товара',
      description: `Вы уверены, что хотите удалить "${productName}" из корзины?`,
      onConfirm: async () => {
        setUpdating(productId);
        try {
          const response = await axios.post<Cart>('/api/cart/remove', {
            productId,
            ...(user?.id && { userId: user.id }),
          });
          setCart(response.data);
          toast.success('Товар удален из корзины');
          // Отправляем событие обновления корзины
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
          console.error('Ошибка удаления товара:', error);
          toast.error(error.response?.data?.error || 'Не удалось удалить товар');
        } finally {
          setUpdating(null);
        }
      },
      variant: 'destructive',
    });
  };

  const clearCart = async () => {
    setConfirmDialog({
      open: true,
      title: 'Очистка корзины',
      description: 'Вы уверены, что хотите очистить всю корзину? Это действие нельзя отменить.',
      onConfirm: async () => {
        try {
          await axios.post('/api/cart/clear', {
            ...(user?.id && { userId: user.id }),
          });
          setCart({ id: cart?.id || 0, totalAmount: 0, items: [] });
          toast.success('Корзина очищена');
          // Отправляем событие обновления корзины
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
          console.error('Ошибка очистки корзины:', error);
          toast.error('Не удалось очистить корзину');
        }
      },
      variant: 'destructive',
    });
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner className='size-8' />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1 className='text-2xl font-semibold mb-6'>Ваша корзина</h1>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-gray-500 text-lg">Ваша корзина пуста</p>
          <Link href="/">
            <Button>Вернуться к покупкам</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className='text-2xl font-semibold'>Ваша корзина</h1>
        {cart.items.length > 0 && (
          <Button variant="outline" onClick={clearCart}>
            Очистить корзину
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {cart.items.map((item) => {
          const product = item.product;
          if (!product) return null;
          const media = product.media || [];
          const mainImage = media.find((m: any) => m.showOnMain === true) || media[0];
          const isUpdating = updating === product.id;

          return (
            <div
              key={item.id}
              className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Изображение товара */}
              <Link href={`/product/${product.id}`} className="flex-shrink-0">
                <div className="w-24 h-24 relative rounded-md overflow-hidden bg-gray-100">
                  {mainImage ? (
                    <Image
                      src={mainImage.name}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Нет фото
                    </div>
                  )}
                </div>
              </Link>

              {/* Информация о товаре */}
              <div className="flex-1 flex flex-col gap-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm overflow-hidden text-ellipsis line-clamp-2">{product.description}</p>
                <p className="text-xl font-bold text-gray-900">{product.price}₽</p>
              </div>

              {/* Управление количеством */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(product.id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={quantityInputs[product.id] ?? item.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!value.includes('-') && parseInt(value) >= 0)) {
                        const newQty = value === '' ? 0 : parseInt(value) || 0;
                        setQuantityInputs(prev => ({
                          ...prev,
                          [product.id]: newQty
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const newQty = parseInt(e.target.value) || 0;
                      const validQty = newQty >= 0 ? newQty : 0;
                      if (validQty >= 0 && validQty !== item.quantity) {
                        updateQuantity(product.id, validQty);
                      } else {
                        // Восстанавливаем исходное значение, если не изменилось
                        setQuantityInputs(prev => ({
                          ...prev,
                          [product.id]: item.quantity
                        }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-16 text-center"
                    disabled={isUpdating}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(product.id, item.quantity + 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Итого: <span className="font-semibold">{item.quantity * product.price}₽</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(product.id)}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Удалить
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Итоговая сумма */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Итого:</span>
          <span className="text-2xl font-bold">{cart.totalAmount}₽</span>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push('/order')}>
          Оформить заказ
        </Button>
      </div>

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
