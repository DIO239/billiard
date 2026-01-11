"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem, NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IType } from "@/types/types";
import { IProduct } from "@/types/product";
import { FaFilterCircleXmark } from "react-icons/fa6";

type NavigationProps = {
    onFilteredProductsChange?: (products: IProduct[]) => void;
    onLoadingChange?: (loading: boolean) => void;
    onLoadingMoreChange?: (loading: boolean) => void;
};

export default function Navigation({ onFilteredProductsChange, onLoadingChange, onLoadingMoreChange }: NavigationProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    
    const [products, setProducts] = useState<IProduct[]>([]);
    const [types, setTypes] = useState<IType[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [typeId, setTypeId] = useState<string>('all');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'price'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Загрузка типов для фильтра
    useEffect(() => {
        if (isHomePage) {
            const loadTypes = async () => {
                try {
                    const response = await axios.get('/api/types');
                    setTypes(response.data);
                } catch (error) {
                    console.error('Ошибка загрузки типов:', error);
                }
            };
            loadTypes();
        }
    }, [isHomePage]);

    // Загрузка продуктов с учетом фильтров
    const loadProducts = useCallback(async (page: number = 0, reset: boolean = false) => {
        if (!isHomePage) return;
        
        if (reset) {
            setProductsLoading(true);
            setProducts([]);
            setCurrentPage(0);
            setHasMore(true);
            setLoadingMore(false);
        }
        
        try {
            const params: any = {
                skip: page * 20,
                take: 20,
            };
            
            // Применяем фильтры на сервере
            // Если typeId === 'all', параметр typeId НЕ передаем вообще (загружаем все типы)
            if (typeId && typeId !== 'all') {
                const typeIdNum = parseInt(typeId);
                if (!isNaN(typeIdNum)) {
                    params.typeId = typeIdNum;
                }
            }
            
            if (priceMin) {
                const min = parseFloat(priceMin);
                if (!isNaN(min)) {
                    params.priceMin = min;
                }
            }
            
            if (priceMax) {
                const max = parseFloat(priceMax);
                if (!isNaN(max)) {
                    params.priceMax = max;
                }
            }
            
            // Передаем параметры сортировки на сервер (всегда передаем, так как есть значения по умолчанию)
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;
            
            const res = await axios.get<{ products: IProduct[] }>('/api/products', { params });
            
            if (reset) {
                setProducts(res.data.products);
                setCurrentPage(0);
            } else {
                setProducts(prev => [...prev, ...res.data.products]);
            }
            
            // hasMore = true только если загружено ровно 20 продуктов (значит, могут быть еще)
            setHasMore(res.data.products.length === 20);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            if (reset) {
                setHasMore(false);
            }
        } finally {
            if (reset) {
                setProductsLoading(false);
            }
        }
    }, [isHomePage, typeId, priceMin, priceMax, sortBy, sortOrder]);

    // Загрузка первой порции продуктов при загрузке страницы и при изменении фильтров
    useEffect(() => {
        if (!isHomePage) return;
        
        // Полностью сбрасываем состояние при изменении фильтров
        setProducts([]);
        setCurrentPage(0);
        setHasMore(true);
        setLoadingMore(false);
        setProductsLoading(true);
        
        const params: any = {
            skip: 0,
            take: 20,
        };
        
        // Если выбраны "все типы", не передаем typeId вообще
        // Иначе применяем фильтр по типу
        if (typeId && typeId !== 'all') {
            const typeIdNum = parseInt(typeId);
            if (!isNaN(typeIdNum)) {
                params.typeId = typeIdNum;
            }
        }
        
        // Применяем фильтры по цене
        if (priceMin) {
            const min = parseFloat(priceMin);
            if (!isNaN(min)) {
                params.priceMin = min;
            }
        }
        
        if (priceMax) {
            const max = parseFloat(priceMax);
            if (!isNaN(max)) {
                params.priceMax = max;
            }
        }
        
        // Передаем параметры сортировки на сервер (всегда передаем, так как есть значения по умолчанию)
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
        
        // Загружаем продукты с учетом фильтров и сортировки
        axios.get<{ products: IProduct[] }>('/api/products', { params })
            .then((res) => {
                setProducts(res.data.products);
                setCurrentPage(0);
                setHasMore(res.data.products.length === 20);
            })
            .catch((error) => {
                console.error('Ошибка загрузки товаров:', error);
                setHasMore(false);
            })
            .finally(() => {
                setProductsLoading(false);
            });
    }, [isHomePage, typeId, priceMin, priceMax, sortBy, sortOrder]);

    // Отслеживание скролла для загрузки следующей порции
    useEffect(() => {
        if (!isHomePage || !hasMore || loadingMore || productsLoading) return;

        const handleScroll = async () => {
            // Проверяем, достиг ли пользователь нижней части страницы (за 200px до конца)
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollHeight - scrollTop - clientHeight < 200) {
                setLoadingMore(true);
                try {
                    const nextPage = currentPage + 1;
                    await loadProducts(nextPage, false);
                    setCurrentPage(nextPage);
                } catch (error) {
                    console.error('Ошибка загрузки дополнительных товаров:', error);
                    setHasMore(false);
                } finally {
                    setLoadingMore(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage, hasMore, loadingMore, currentPage, productsLoading, loadProducts, sortBy, sortOrder]);

    // Передаем состояние загрузки в Main
    useEffect(() => {
        if (isHomePage && onLoadingChange) {
            onLoadingChange(productsLoading);
        }
    }, [productsLoading, isHomePage, onLoadingChange]);

    // Фильтрация продуктов (сортировка происходит на сервере)
    const filteredProducts = useMemo(() => {
        if (!isHomePage) return [];

        // Фильтруем только по видимости (на сервере уже применены фильтры по типу, цене и сортировка)
        return products.filter(product => product.visible);
    }, [products, isHomePage]);

    // Передаем отфильтрованные продукты в Main
    useEffect(() => {
        if (isHomePage && onFilteredProductsChange) {
            onFilteredProductsChange(filteredProducts);
        }
    }, [filteredProducts, isHomePage, onFilteredProductsChange]);

    // Передаем состояние загрузки в Main
    useEffect(() => {
        if (isHomePage && onLoadingChange) {
            onLoadingChange(productsLoading);
        }
    }, [productsLoading, isHomePage, onLoadingChange]);

    // Передаем состояние загрузки дополнительных продуктов
    useEffect(() => {
        if (isHomePage && onLoadingMoreChange) {
            onLoadingMoreChange(loadingMore);
        }
    }, [loadingMore, isHomePage, onLoadingMoreChange]);

    const clearFilters = () => {
        setTypeId('all');
        setPriceMin('');
        setPriceMax('');
        setSortBy('title');
        setSortOrder('asc');
        // Перезагружаем продукты без фильтров
        loadProducts(0, true);
    };

    return (
        <div className='flex items-center gap-4 mb-10'>
            {/* Фильтрация - показываем только на главной и после загрузки товаров, в одной строке с меню */}
            {isHomePage && !productsLoading && (
                <div className="flex flex-wrap items-center gap-4 flex-1">
                    {/* Фильтр по типу */}
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="type-filter">Тип товара</Label>
                        <Select value={typeId} onValueChange={setTypeId}>
                            <SelectTrigger id="type-filter" className="w-[180px]">
                                <SelectValue placeholder="Тип товара" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все типы</SelectItem>
                                {types.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Фильтр по цене */}
                    <div className="flex flex-col gap-1">
                        <Label>Цена</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="От"
                                value={priceMin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[+\-]/g, '');
                                    setPriceMin(value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === '+' || e.key === '-') {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-[120px]"
                                min="0"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                                type="number"
                                placeholder="До"
                                value={priceMax}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[+\-]/g, '');
                                    setPriceMax(value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === '+' || e.key === '-') {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-[120px]"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Сортировка */}
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="sort-by">Сортировать по</Label>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'title' | 'price')}>
                            <SelectTrigger id="sort-by" className="w-[150px]">
                                <SelectValue placeholder="Сортировать по" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">Названию</SelectItem>
                                <SelectItem value="price">Цене</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="sort-order">Порядок</Label>
                        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                            <SelectTrigger id="sort-order" className="w-[170px]">
                                <SelectValue placeholder="Порядок" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">По возрастанию</SelectItem>
                                <SelectItem value="desc">По убыванию</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Кнопка сброса фильтров */}
                    {(typeId !== 'all' || priceMin || priceMax) && (
                        <div className="flex flex-col gap-1 self-end">
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex"
                                >
                                    <FaFilterCircleXmark className="h-10 w-10" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Сбросить фильтры</p>
                            </TooltipContent>
                        </Tooltip>
                        </div>
                    )}
                </div>
            )}

            {/* Основное меню навигации - всегда справа */}
            <div className='flex justify-end ml-auto'>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Информация</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <NavigationMenuLink asChild>
                                    <Link href="/contacts">Контакты</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/">Оплата</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/">Доставка</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/">Оформление заказа</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/">Гарантия</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/">Пользовательское соглашение</Link>
                                </NavigationMenuLink>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}