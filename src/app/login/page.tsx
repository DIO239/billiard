"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"


const formLoginSchema = z.object({
    email: z.email({ message: "Неверный адрес электронной почты" }),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
});

export default function Login() {
    const formLogin = useForm<z.infer<typeof formLoginSchema>>({
        resolver: zodResolver(formLoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    return (
        <div className="flex justify-center items-center px-16 mt-30">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>
                        <h1>Авторизация</h1>
                    </CardTitle>
                    <CardDescription>
                        Введите свой адрес электронной почты ниже, чтобы войти в свой аккаунт.
                    </CardDescription>
                    <CardAction>
                        <a href="/register">
                            <Button 
                            variant="link"
                            className="cursor-pointer">Зарегистрироваться</Button> 
                        </a>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Form {...formLogin}>
                        <form 
                        className="flex flex-col gap-4"
                        onSubmit={formLogin.handleSubmit(onSubmitLogin)}>
                            <FormField
                                control={formLogin.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            >
                            </FormField>
                            <FormField
                                control={formLogin.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            >
                            </FormField>
                            <Button type="submit" className="w-full cursor-pointer">Войти</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function onSubmitLogin(values: z.infer<typeof formLoginSchema>) {
    console.log(values);
    toast.success("Вы успешно вошли в систему");
}