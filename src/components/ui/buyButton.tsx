"use client";

import { IProduct } from "@/types/product";
import { FaShoppingCart } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface BuyButtonProps {
    price: number;
    productId: number;
}

export default function BuyButton({ price, productId }: BuyButtonProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await axios.post('/api/cart/add', {
                productId,
                quantity: 1,
                ...(user?.id && { userId: user.id }),
            });
            toast.success('Товар добавлен в корзину');
            // Отправляем событие обновления корзины
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            console.error('Ошибка добавления в корзину:', error);
            const errorMessage = error.response?.data?.error || 'Не удалось добавить товар в корзину';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div 
            className='
                cursor-pointer
                relative
                flex 
                items-center 
                w-[150px] 
                h-[45px] 
                rounded-full 
                bg-[#000000] 
                pl-4 
                pt-1 
                pb-1
                hover:bg-[#1a1a1a]
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
            '
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
            }}
        >
            <p className='text-white text-xl font-medium'>{price}₽</p>
            <div className='
                absolute 
                right-0 
                flex 
                items-center 
                justify-center 
                bg-white
                rounded-full 
                h-full
                w-[45px]
                shadow-xs
                inset-shadow-black
                shadow-black'
            >
                {loading ? (
                    <Spinner className="h-5 w-5 text-black" />
                ) : (
                    <FaShoppingCart className='text-black text-xl' />
                )}
            </div>
        </div>
    );
}