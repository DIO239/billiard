"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { IoIosSearch, IoIosClose, IoLogoWhatsapp } from "react-icons/io";
import { FaVk, FaTelegramPlane, FaPhoneAlt, FaEnvelope, FaShoppingCart } from "react-icons/fa";
import axios from 'axios';

import { useCartStore } from '@/store/cart';
import { Input } from "@/components/ui/input";
import { IProduct } from '@/types/product';
import { IProductResponse } from '@/types/product-response';
import { Badge } from '@/components/ui/badge';

export default function Header() {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!search) {
            setSearchResults([]);
            setSearched(false);
            return;
        }

        const delayDebounce = setTimeout(() => {
            setLoading(true);
            axios.get('/api/products', { params: { search } })
                .then((res: IProductResponse) => {
                    return setSearchResults(
                        res.data.products.filter((product) => product.visible) ?? []
                    );
                })
                .catch(() => setSearchResults([]))
                .finally(() => {
                    setLoading(false);
                    setSearched(true);
                });
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    const count = useCartStore((state) => state.items.length);

    return (
        <header className='w-full pt-4 px-16'>
            <div className='flex gap-12'>
                   <div className='h-fit'>
                    <Image priority src="/logos/floyd.png" alt="logo" width={80} height={94} className='object-contain object-top cursor-pointer' />
                   </div>
                   <div className='flex flex-col mt-3'>
                    <div className='relative w-90 h-10'>
                        <Input className={
                            !search 
                            ? 'w-full h-full rounded-2xl shadow-xl focus-visible:ring-0 focus-visible:border-none' 
                            : 'w-full h-full rounded-tr-2xl rounded-tl-2xl rounded-br-none rounded-bl-none focus-visible:ring-0 focus-visible:border-none'} 
                            type='text' 
                            placeholder='Поиск' 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} />
                        { !search 
                            ? 
                            <IoIosSearch className='absolute right-2 top-2 w-6 h-6' /> 
                            : 
                            <IoIosClose className='absolute right-2 top-2 w-6 h-6 cursor-pointer' onClick={() => setSearch('')} /> 
                        }
                    </div>
                    {(search && !loading && searched) && (
                        <div className='flex flex-col gap-2 w-full h-60 px-3 py-1 rounded-br-2xl rounded-bl-2xl shadow-xl overflow-auto'>
                            {searchResults.length > 0 ? (
                                searchResults.map((product: IProduct) => (
                                    <span key={product.id} className='cursor-pointer'>{product.title}</span>
                                ))
                            ) : (
                                <span className="text-gray-400">Ничего не найдено</span>
                            )}
                        </div>
                    )}
                   </div>
                   <div className='flex gap-5 mt-3 items-start'>
                    <div className='
                    bg-black 
                    w-10 
                    h-10 
                    rounded-full 
                    flex 
                    justify-center 
                    items-center 
                    cursor-pointer
                    hover:bg-[#0077ff] transition-colors
                    '>
                        <FaVk className='text-white' size={22}/>
                    </div>
                    <div className='
                    bg-black 
                    w-10 
                    h-10 
                    rounded-full 
                    flex 
                    justify-center 
                    items-center 
                    cursor-pointer
                    hover:bg-[#1c93e3] transition-colors
                    '>
                        <FaTelegramPlane className='text-white' size={22}/>
                    </div>
                    <IoLogoWhatsapp className='text-black cursor-pointer hover:text-[#25D366] transition-colors' size={43}/>
                   </div>
                   <div className='flex gap-5 mt-4 items-start gap-6'>
                    <div className='flex justify-center items-center gap-2'>
                        <FaPhoneAlt size={32}/>
                        <a className='text-lg' href='tel:+79999999999'>+7-000-000-00-00</a>
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <FaEnvelope size={32}/>
                        <a className='text-lg' href='mailto:test@test.com'>floydbilliard@example.com</a>
                    </div>
                   </div>
                   <div className='mt-3 relative w-15'>
                    <div className='bg-[#5F0707D9] rounded-full w-10 h-10 flex justify-center items-center cursor-pointer'>
                        <FaShoppingCart className='text-white' size={22}/>
                    </div>
                    {count > 0 && (
                        <Badge className='absolute top-[-10px] right-0 h-5 min-w-5 rounded-full px-1 tabular-nums' variant="outline">
                            {count}
                        </Badge>
                    )}
                   </div>
            </div>
        </header>
    );
}