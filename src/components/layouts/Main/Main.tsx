"use client"
import { IProduct } from '@/types/product';
import Card from "../../shared/Card/Card";
import { Spinner } from '@/components/ui/spinner';

type MainPageProps = {
    filteredProducts: IProduct[];
    loading: boolean;
    loadingMore?: boolean;
};

export default function MainPage({ filteredProducts, loading, loadingMore = false }: MainPageProps) {
    // Показываем спиннер пока загружаем данные
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className='size-8' />
            </div>
        );
    }
    
    return(
        <>
            <div className="grid grid-cols-5 gap-20">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <Card key={product.id} {...product} />
                    ))
                ) : (
                    <div className="col-span-5 text-center py-12 text-gray-500">
                        Товары не найдены
                    </div>
                )}
            </div>
            {loadingMore && (
                <div className="flex justify-center items-center py-8">
                    <Spinner className='size-8' />
                </div>
            )}
        </>
    );
}