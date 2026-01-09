import { IProduct } from '@/types/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import BuyButton from '@/components/ui/buyButton';

export default function Card(props: IProduct) {
    // Фильтруем медиа, которые должны показываться на главной странице
    const visibleMedia = props.media.filter(m => m.showOnMain !== false);
    
    // Разделяем медиа на видео и картинки
    const videos = visibleMedia.filter(m => m.type === 'video');
    const images = visibleMedia.filter(m => m.type === 'image');
    
    // Объединяем: сначала все видео, потом все картинки
    const sortedMedia = [...videos, ...images];

    return (
        <div className="flex flex-col w-[215px] gap-6">
            <div className="w-[215px] h-[395px]">
                <Swiper 
                    spaceBetween={10} 
                    slidesPerView={1} 
                    className="w-full h-full"
                    loop
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
            </div>
            <div className="flex flex-col gap-2">
                <div className='flex flex-col'>
                    <p className="text-sm text-gray-500">{props.type.name}</p>
                    <h3 className="text-lg font-semibold">{props.title}</h3>
                </div>
                <BuyButton price={props.price} />
            </div>
        </div>
    );
}
