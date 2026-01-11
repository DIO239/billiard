import { IProduct } from '@/types/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import BuyButton from '@/components/ui/buyButton';
import Link from 'next/link';

export default function Card(props: IProduct) {
    // Фильтруем медиа, которые должны показываться на главной странице
    const visibleMedia = props.media.filter(m => m.showOnMain === true);
    
    // Разделяем медиа на видео и картинки
    const videos = visibleMedia.filter(m => m.type === 'video');
    const images = visibleMedia.filter(m => m.type === 'image');
    
    // Объединяем: сначала все видео, потом все картинки
    const sortedMedia = [...videos, ...images];

    return (
        <div className="flex flex-col w-[215px] gap-6">
            <Link href={`/product/${props.id}`} className="w-[215px] h-[395px] block">
                {sortedMedia.length > 0 ? (
                    <Swiper 
                    spaceBetween={10} 
                    slidesPerView={1} 
                    className="w-full h-full"
                    loop={sortedMedia.length > 1}
                >
                    {sortedMedia.map(media => (
                        <SwiperSlide key={media.id}>
                            {media.type === 'video' ? (
                                <video
                                    src={media.name}
                                    className="object-cover w-full h-full rounded-md"
                                    muted
                                    loop
                                    playsInline
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onMouseEnter={(e) => {
                                        e.currentTarget.play();
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                            ) : (
                                <img
                                    src={media.name}
                                    alt={media.name}
                                    className="object-cover w-full h-full rounded-md"
                                />
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-md text-gray-400">
                        Нет изображений
                    </div>
                )}
            </Link>
            <div className="flex flex-col gap-2 w-[215px]">
                <Link href={`/product/${props.id}`} className="flex flex-col hover:opacity-80 transition-opacity">
                    <p className="text-sm text-gray-500 truncate">{props.type.name}</p>
                    <h3 className="text-lg font-semibold truncate">{props.title}</h3>
                </Link>
                <BuyButton price={props.price} productId={props.id} />
            </div>
        </div>
    );
}
