"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const userCreateSchema = z.object({
  fullName: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  role: z.enum(['USER', 'ADMIN']),
});

const userUpdateSchema = z.object({
  fullName: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  role: z.enum(['USER', 'ADMIN']),
});

type User = {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  verified: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
};

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const isEditMode = !!user;
  const [loading, setLoading] = useState(false);

  const createForm = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'USER',
    },
    mode: 'onChange',
  });

  const updateForm = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'USER',
    },
    mode: 'onChange',
  });

  const form = isEditMode ? updateForm : createForm;

  useEffect(() => {
    if (user && open) {
      updateForm.reset({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    } else if (!user && open) {
      createForm.reset({
        fullName: '',
        email: '',
        password: '',
        role: 'USER',
      });
    }
  }, [user, open, createForm, updateForm]);

  const onSubmit = async (data: z.infer<typeof userCreateSchema> | z.infer<typeof userUpdateSchema>) => {
    try {
      setLoading(true);
      if (isEditMode && user) {
        await axios.patch(`/api/users/${user.id}`, data);
        toast.success('Пользователь обновлён');
      } else {
        await axios.post('/api/users', data);
        toast.success('Пользователь создан');
      }
      onSuccess();
      onOpenChange(false);
      if (!isEditMode) {
        createForm.reset();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Не удалось ${isEditMode ? 'обновить' : 'создать'} пользователя`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {isEditMode ? 'Редактировать пользователя' : 'Добавить нового пользователя'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Измените необходимые поля пользователя' 
              : 'Заполните все поля для создания нового пользователя'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Имя пользователя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditMode && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Минимум 6 символов" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Роль</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USER">Пользователь</SelectItem>
                          <SelectItem value="ADMIN">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 pb-6 pt-4 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  if (!isEditMode) {
                    createForm.reset();
                  }
                }}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !form.formState.isValid}
              >
                {loading 
                  ? 'Сохранение...' 
                  : isEditMode 
                    ? 'Сохранить изменения' 
                    : 'Создать пользователя'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
