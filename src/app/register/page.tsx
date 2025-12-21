"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

const formRegisterSchema = z.object({
    fullName: z.string().min(1, { message: "Имя обязательно" }),
    email: z.email({ message: "Неверный адрес электронной почты" }),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
    code: z.string()
});

export default function Register() {
    const formRegister = useForm<z.infer<typeof formRegisterSchema>>({
        resolver: zodResolver(formRegisterSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            code: ""
        },
    });
    return (
        <div className="flex justify-center items-center px-16 mt-30">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>
                        <h1>Регистрация</h1>
                    </CardTitle>
                    <CardDescription>
                        Создайте аккаунт ниже, чтобы использовать все возможности нашего сервиса.
                    </CardDescription>
                    <CardAction>
                        <a href="/login">
                        <Button 
                            variant="link" 
                            className="cursor-pointer">
                            Авторизация
                        </Button>
                        </a>
                    </CardAction>
                </CardHeader>
                <CardContent>
                <Form {...formRegister}>
                        <form 
                        className="flex flex-col gap-4"
                        onSubmit={formRegister.handleSubmit(onSubmitRegister)}>
                            <FormField
                                control={formRegister.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Имя</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} required />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            >
                            </FormField>
                            <FormField
                                control={formRegister.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} required autoComplete="false" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            >
                            </FormField>
                            <FormField
                                control={formRegister.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} required autoComplete="false" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            >
                            </FormField>
                            <FormField
                                control={formRegister.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Код подтверждения</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Input type="text" {...field} required autoComplete="false" />
                                            </FormControl>
                                            <Button className="cursor-pointer">Отправить код</Button>
                                        </div>
                                        
                                    </FormItem>
                                )}
                            >
                            </FormField>
                            <Button 
                             type="submit" 
                             className="w-full cursor-pointer"
                             disabled={!formRegister.formState.isValid}
                            >Зарегистрироваться</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function onSubmitRegister(values: z.infer<typeof formRegisterSchema>) {
    console.log(values)
    toast.success("Успешная регистрация")
}