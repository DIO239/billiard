"use client"
import axios from "axios";
import { useEffect, useState } from "react";

import { IProductResponse } from '@/types/product-response';
import { IProduct } from '@/types/product';
import Card from "../../shared/Card/Card";
import { Spinner } from '@/components/ui/spinner';

export default function MainPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        axios.get('/api/products')
            .then((res: IProductResponse) => setProducts(res.data.products))
            .catch((error) => {
                console.error('Ошибка загрузки товаров:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className='size-8' />
            </div>
        );
    }
    
    return(
        <div className="flex gap-20">
            {products.filter(product => product.visible).map(product => (
                <Card key={product.id} {...product} />
            ))}
        </div>
    );
}