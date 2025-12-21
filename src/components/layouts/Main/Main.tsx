"use client"
import axios from "axios";
import { useEffect, useState } from "react";

import { IProductResponse } from '@/types/product-response';
import { IProduct } from '@/types/product';
import Card from "../../shared/Card/Card";

export default function MainPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    useEffect(() => {
        axios.get('/api/products')
        .then((res: IProductResponse) => setProducts(res.data.products))
    }, []);
    return(
        <div className="flex">
            {products.map(product => (
                <Card key={product.id} {...product} />
            ))}
        </div>
    );
}