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
import { typeCreateSchema, typeUpdateSchema } from '@/validation/type';
import { IType, ICharacteristicField } from '@/types/types';
import { X, Plus } from 'lucide-react';

type TypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: IType | null;
  onSuccess: () => void;
};

export function TypeDialog({ open, onOpenChange, type, onSuccess }: TypeDialogProps) {
  const isEditMode = !!type;
  const [loading, setLoading] = useState(false);
  const [characteristicFields, setCharacteristicFields] = useState<ICharacteristicField[]>([]);

  const form = useForm<z.infer<typeof typeCreateSchema>>({
    resolver: zodResolver(typeCreateSchema),
    defaultValues: {
      value: '',
      name: '',
      characteristicFields: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (type && open) {
      form.reset({
        value: type.value,
        name: type.name,
        characteristicFields: type.characteristicFields || [],
      });
      setCharacteristicFields(type.characteristicFields || []);
    } else if (!type && open) {
      form.reset({
        value: '',
        name: '',
        characteristicFields: [],
      });
      setCharacteristicFields([]);
    }
  }, [type, open, form]);

  const addCharacteristicField = () => {
    setCharacteristicFields([...characteristicFields, { key: '', label: '', type: 'string' }]);
  };

  const removeCharacteristicField = (index: number) => {
    setCharacteristicFields(characteristicFields.filter((_, i) => i !== index));
  };

  const updateCharacteristicField = (index: number, field: Partial<ICharacteristicField>) => {
    const updated = [...characteristicFields];
    updated[index] = { ...updated[index], ...field };
    setCharacteristicFields(updated);
  };

  const onSubmit = async (data: z.infer<typeof typeCreateSchema>) => {
    try {
      setLoading(true);
      const submitData = {
        ...data,
        characteristicFields: characteristicFields.length > 0 ? characteristicFields : null,
      };
      if (isEditMode && type) {
        const updateData = typeUpdateSchema.parse(submitData);
        await axios.patch(`/api/types/${type.id}`, updateData);
        toast.success('Тип товара успешно обновлен');
      } else {
        await axios.post('/api/types', submitData);
        toast.success('Тип товара успешно добавлен');
      }
      onOpenChange(false);
      form.reset();
      setCharacteristicFields([]);
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Не удалось ${isEditMode ? 'обновить' : 'добавить'} тип товара`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{isEditMode ? 'Редактировать тип товара' : 'Добавить новый тип товара'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Измените необходимые поля типа товара' 
              : 'Заполните все поля для создания нового типа товара'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 pb-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Значение (value)</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите значение типа (например: cue)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите название типа (например: Кий)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Поля характеристик */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-base font-semibold">Поля характеристик</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCharacteristicField}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить поле
                    </Button>
                  </div>
                  {characteristicFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет полей характеристик. Добавьте поля, которые будут отображаться при создании товара этого типа.</p>
                  ) : (
                    <div className="space-y-3">
                      {characteristicFields.map((field, index) => (
                        <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Ключ (key)</label>
                              <Input
                                placeholder="height"
                                value={field.key}
                                onChange={(e) => updateCharacteristicField(index, { key: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Название (label)</label>
                              <Input
                                placeholder="Высота (см)"
                                value={field.label}
                                onChange={(e) => updateCharacteristicField(index, { label: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Тип</label>
                              <Select
                                value={field.type}
                                onValueChange={(value: 'string' | 'number') => updateCharacteristicField(index, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">Текст</SelectItem>
                                  <SelectItem value="number">Число</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Placeholder (необязательно)</label>
                              <Input
                                placeholder="Введите высоту"
                                value={field.placeholder || ''}
                                onChange={(e) => updateCharacteristicField(index, { placeholder: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCharacteristicField(index)}
                            className="mt-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 pb-6 pt-4 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  setCharacteristicFields([]);
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
                    : 'Создать тип'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
