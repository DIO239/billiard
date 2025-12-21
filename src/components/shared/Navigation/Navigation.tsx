"use client";

import Link from "next/link";
import {
    NavigationMenu, NavigationMenuContent,
    NavigationMenuItem, NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/components/ui/navigation-menu";

export default function Navigation() {
    return (
        <div className='flex justify-end'>
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
    );
}