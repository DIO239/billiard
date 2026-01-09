"use client"
import axios from "axios";
import { useEffect, useState } from "react";

import { IProduct } from '@/types/product';
import Card from "../../shared/Card/Card";
import { Spinner } from '@/components/ui/spinner';

export default function MainPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        let isMounted = true;
        let cancelled = false;
        
        const loadProducts = async () => {
            if (cancelled) return;
            
            setLoading(true);
            try {
                const res = await axios.get<{ products: IProduct[] }>('/api/products', { 
                    params: { 
                        take: 100,
                        // Явно не передаем search, чтобы не влиять на основной список
                    } 
                });
                
                if (isMounted && !cancelled) {
                    setProducts(res.data.products);
                }
            } catch (error) {
                if (isMounted && !cancelled) {
                    console.error('Ошибка загрузки товаров:', error);
                }
            } finally {
                if (isMounted && !cancelled) {
                    setLoading(false);
                }
            }
        };
        
        loadProducts();
        
        return () => {
            isMounted = false;
            cancelled = true;
        };
    }, []);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className='size-8' />
            </div>
        );
    }
    
    return(
        <div className="grid grid-cols-5 gap-20">
            {products.filter(product => product.visible).map(product => (
                <Card key={product.id} {...product} />
            ))}
        </div>
    );
}