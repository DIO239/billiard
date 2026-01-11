"use client"

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IProduct } from "@/types/product";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BuyButton from "@/components/ui/buyButton";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';

export default function Product() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

    useEffect(() => {
        const loadProduct = async () => {
          const id = params.id;
          if (!id || typeof id !== 'string') {
            setError('Некорректный ID продукта');
            setLoading(false);
            return;
          }
    
          try {
            setLoading(true);
            const response = await axios.get<IProduct>(`/api/products/${id}`);
            setProduct(response.data);
          } catch (err: any) {
            if (err.response?.status === 404) {
              // Для 404 используем сообщение из API или стандартное
              const errorMessage = err.response?.data?.error || 'Продукт не найден';
              setError(errorMessage);
            } else {
              setError('Не удалось загрузить продукт');
            }
          } finally {
            setLoading(false);
          }
        };
    
        loadProduct();
      }, [params.id]);

    if (loading) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <Spinner className="h-12 w-12" />
          </div>
        );
    }
    
    if (error || !product) {
        // Определяем, является ли это ошибкой 404
        const isNotFound = error === 'Продукт не найден' || error?.includes('не найден');
        
        return (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">{isNotFound ? 'Продукт не найден' : 'Ошибка'}</h1>
              <p className="text-gray-600 mb-6">{error || 'Продукт не найден'}</p>
              <Button onClick={() => router.push('/')}>Вернуться на главную</Button>
            </div>
          </div>
        );
    }
    
    // Разделяем медиа на видео и изображения
    const videos = product.media.filter(m => m.type === 'video');
    const images = product.media.filter(m => m.type === 'image');
    // Сначала видео, потом изображения
    const sortedMedia = [...videos, ...images];

    // Характеристики
    const characteristics = product.characteristic?.attributes || {};
    const characteristicFields = product.type?.characteristicFields || [];

    return(
        <div className='py-8'>
            <div className="flex gap-8">
                {/* Левая колонка - Галерея */}
                <div className="flex gap-4">
                    {/* Миниатюры слева с Swiper Thumbs */}
                    {sortedMedia.length > 1 && (
                        <Swiper
                            modules={[Thumbs]}
                            onSwiper={setThumbsSwiper}
                            spaceBetween={12}
                            slidesPerView={5}
                            direction="vertical"
                            className="w-20 h-[650px]"
                            watchSlidesProgress
                            loop={sortedMedia.length > 5}
                            freeMode={true}
                        >
                            {sortedMedia.map((media, index) => (
                                <SwiperSlide key={media.id}>
                                    <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gray-300 transition-all">
                                        {media.type === 'video' ? (
                                            <div className="relative w-full h-full bg-black">
                                                <video
                                                    src={media.name}
                                                    className="object-cover w-full h-full"
                                                    muted
                                                    preload="metadata"
                                                />
                                            </div>
                                        ) : (
                                            <Image
                                                src={media.name}
                                                alt={`Миниатюра ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        )}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}

                    {/* Основное изображение с Swiper, Thumbs и Zoom */}
                    <div className="relative w-[730px] h-[650px] rounded-lg overflow-hidden bg-gray-100">
                        {sortedMedia.length > 0 ? (
                            <Swiper
                                modules={[Thumbs, Zoom]}
                                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                zoom={{
                                    maxRatio: 3,
                                    minRatio: 1,
                                }}
                                spaceBetween={10}
                                slidesPerView={1}
                                direction="vertical"
                                className="w-full h-full"
                                loop={sortedMedia.length > 1}
                            >
                                {sortedMedia.map((media, index) => (
                                    <SwiperSlide key={media.id}>
                                        <div className="swiper-zoom-container relative w-full h-full">
                                            {media.type === 'video' ? (
                                                <video
                                                    src={media.name}
                                                    className="object-cover w-full h-full"
                                                    controls={false}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <div className="relative w-full h-full cursor-zoom-in">
                                                    <Image
                                                        src={media.name}
                                                        alt={`${product.title} - изображение ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="500px"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Нет изображений
                            </div>
                        )}
                    </div>
                </div>

                {/* Правая колонка - Информация */}
                <div className="flex-1 space-y-6">
                    {/* Название */}
                    <div>
                        <h1 className="text-3xl font-semibold mb-3">{product.title}</h1>
                        {/* Разделительная линия */}
                        <div className="w-full h-0.5 bg-[#5F0707] mb-6"></div>
                    </div>

                    {/* Описание */}
                    <div>
                        <p className="text-[#000000CC] leading-relaxed whitespace-pre-line text-xl font-normal">
                            {product.description}
                        </p>
                    </div>

                    {/* Характеристики */}
                    {characteristicFields.length > 0 && Object.keys(characteristics).length > 0 && (
                        <div className="relative">
                            <h2 className="text-2xl font-semibold mb-3">Характеристики:</h2>
                            <ul className="space-y-2">
                                {characteristicFields.map((field) => {
                                    const value = characteristics[field.key];
                                    if (value === undefined || value === null || value === '') return null;
                                    
                                    return (
                                        <li key={field.key} className="flex items-center px-5">
                                            <div className="bg-[#5F0707] mr-4 rounded-full w-2 h-2 flex items-center justify-center"></div>
                                            <div className="text-gray-700 flex gap-2">
                                                <span className="font-normal text-lg">{field.label}:</span> 
                                                <span className="font-normal text-lg">{String(value)}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* Кнопка добавления в корзину */}
                    <div className="pt-4">
                        <BuyButton price={product.price} productId={product.id}></BuyButton>
                    </div>
                </div>
            </div>
        </div>
    );
}