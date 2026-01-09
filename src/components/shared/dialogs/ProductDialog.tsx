"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { productCreateSchema, productUpdateSchema, ProductResponse } from '@/validation/product';
import { IType } from '@/types/types';
import { IMedia } from '@/types/media';
import { ICharacteristic } from '@/types/characteristic';
import { X, Play } from 'lucide-react';

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
  types: IType[];
  onSuccess: () => void;
};

export function ProductDialog({ open, onOpenChange, product, types, onSuccess }: ProductDialogProps) {
  const isEditMode = !!product;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<IMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingRemoveMedia, setPendingRemoveMedia] = useState<number[]>([]);
  const [attributes, setAttributes] = useState<Record<string, string | number>>({});
  const [mediaShowOnMain, setMediaShowOnMain] = useState<Record<number, boolean>>({});

  const form = useForm<z.infer<typeof productCreateSchema>>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      count: 0,
      visible: true,
      typeId: 0,
    },
    mode: 'onChange',
  });

  const selectedTypeId = form.watch('typeId');
  const selectedType = types.find(t => t.id === selectedTypeId);

  useEffect(() => {
    if (product && open) {
      form.reset({
        title: product.title,
        description: product.description,
        price: product.price,
        count: product.count,
        visible: product.visible,
        typeId: product.typeId,
      });
      setExistingMedia(product.media || []);
      // Загружаем настройки показа медиа на главной
      const showOnMainMap: Record<number, boolean> = {};
      product.media?.forEach(media => {
        showOnMainMap[media.id] = media.showOnMain !== false; // по умолчанию true
      });
      setMediaShowOnMain(showOnMainMap);
      // Загружаем характеристики продукта
      if (product.characteristic) {
        setAttributes(product.characteristic.attributes || {});
      } else {
        setAttributes({});
      }
    } else if (!product && open) {
      form.reset({
        title: '',
        description: '',
        price: 0,
        count: 0,
        visible: true,
        typeId: 0,
      });
      setExistingMedia([]);
      setAttributes({});
      setMediaShowOnMain({});
    }
    setSelectedFiles([]);
    setPendingRemoveMedia([]);
  }, [product, open, form]);

  // Сброс attributes при смене типа товара
  useEffect(() => {
    if (selectedTypeId && selectedTypeId > 0) {
      // При смене типа очищаем attributes, чтобы показать поля для нового типа
      if (!product || product.typeId !== selectedTypeId) {
        setAttributes({});
      }
    }
  }, [selectedTypeId, product]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Новые функции для «удаления»
  const markMediaForRemove = (mediaId: number) => {
    setPendingRemoveMedia((prev) => [...prev, mediaId]);
  };
  const unmarkMediaForRemove = (mediaId: number) => {
    setPendingRemoveMedia((prev) => prev.filter((id) => id !== mediaId));
  };

  // --- Оригинальная removeExistingMedia больше не нужна и не используется ---

  const uploadFile = async (file: File, productId: number): Promise<any> => {
    try {
      // Создаем FormData для загрузки
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId.toString());

      // Загружаем файл локально
      const uploadResponse = await axios.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return uploadResponse.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Ошибка загрузки файла';
      throw new Error(`Не удалось загрузить файл ${file.name}: ${errorMessage}`);
    }
  };

  const onSubmit = async (data: z.infer<typeof productCreateSchema>) => {
    try {
      setUploading(true);
      let productId: number;

      // Удаляем отмеченные медиа только сейчас!
      if (pendingRemoveMedia.length > 0) {
        try {
          await axios.post('/api/media/delete-many', pendingRemoveMedia.map(id => ({ id })));
          setExistingMedia((prev) => prev.filter((m) => !pendingRemoveMedia.includes(m.id)));
          setPendingRemoveMedia([]);
        } catch (error) {
          toast.error('Ошибка удаления медиа');
          return; // Можно прервать полностью
        }
      }

      if (isEditMode && product) {
        // При редактировании отправляем только измененные поля
        const updateData = productUpdateSchema.parse(data);
        await axios.patch(`/api/products/${product.id}`, updateData);
        productId = product.id;
        toast.success('Товар успешно обновлен');
      } else {
        // Создаем продукт
        const response = await axios.post('/api/products', data);
        const createdProduct = response.data;
        productId = createdProduct.id;
        if (!productId) {
          throw new Error('Не удалось получить ID созданного продукта');
        }
        toast.success('Товар успешно добавлен');
      }

      // Сохраняем/обновляем характеристики (только новый формат через attributes)
      if (Object.keys(attributes).length > 0) {
        const attributesData = attributes;
        try {
          // Используем данные продукта, если они есть, иначе делаем запрос
          let existingChar = null;
          if (isEditMode && product?.characteristic) {
            existingChar = product.characteristic;
          } else {
            // Для нового продукта или если характеристика не загружена, проверяем через API
            try {
              const existingCharResponse = await axios.get(`/api/characteristics?productId=${productId}`);
              existingChar = existingCharResponse.data && existingCharResponse.data.length > 0 
                ? existingCharResponse.data[0] 
                : null;
            } catch (fetchError) {
              // Если запрос не удался, предполагаем, что характеристики нет
              existingChar = null;
            }
          }

          if (existingChar) {
            // Обновляем существующую характеристику
            await axios.patch(`/api/characteristics/${existingChar.id}`, {
              attributes: attributesData,
            });
          } else {
            // Создаем новую характеристику
            await axios.post('/api/characteristics', {
              productId,
              attributes: attributesData,
            });
          }
        } catch (error: any) {
          console.error('Ошибка сохранения характеристик:', error);
          let errorMessage = 'Не удалось сохранить характеристики';
          if (error.response?.data) {
            const errorData = error.response.data;
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          toast.error(errorMessage);
        }
      }

      // Обновляем настройки показа медиа на главной странице
      if (Object.keys(mediaShowOnMain).length > 0) {
        try {
          const updatePromises = Object.entries(mediaShowOnMain).map(([mediaId, showOnMain]) =>
            axios.patch(`/api/media/${mediaId}`, { showOnMain })
          );
          await Promise.all(updatePromises);
        } catch (error: any) {
          console.error('Ошибка обновления настроек медиа:', error);
          // Не прерываем сохранение, если не удалось обновить настройки медиа
        }
      }

      // Загружаем медиа файлы
      if (selectedFiles.length > 0) {
        try {
          const uploadPromises = selectedFiles.map((file) => uploadFile(file, productId));
          await Promise.all(uploadPromises);
          toast.success(`Загружено ${selectedFiles.length} файл(ов)`);
        } catch (uploadError: any) {
          // Ошибка загрузки медиа не должна прерывать сохранение продукта
          const errorMessage = uploadError.message || 'Ошибка загрузки медиа файлов';
          toast.error(errorMessage);
          // Продолжаем выполнение, так как продукт уже сохранен
        }
      }

      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      setPendingRemoveMedia([]);
      onSuccess();
    } catch (error: any) {
      // Правильно извлекаем сообщение об ошибке
      let errorMessage = `Не удалось ${isEditMode ? 'обновить' : 'добавить'} товар`;
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{isEditMode ? 'Редактировать товар' : 'Добавить новый товар'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Измените необходимые поля товара' 
              : 'Заполните все поля для создания нового товара'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 pb-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название товара" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите описание товара" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип товара</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value && field.value > 0 ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип товара" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Видимость</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Показывать товар на сайте
                    </div>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Секция характеристик */}
            {selectedType && selectedType.characteristicFields && selectedType.characteristicFields.length > 0 ? (
              <div className="space-y-4 border-t pt-4">
                <FormLabel className="text-base font-semibold">Характеристики товара</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  {selectedType.characteristicFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <FormLabel className="text-sm">{field.label}</FormLabel>
                      <Input
                        type={field.type === 'number' ? 'number' : 'text'}
                        step={field.type === 'number' ? '0.1' : undefined}
                        placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                        value={field.type === 'number' 
                          ? (attributes[field.key] !== undefined ? attributes[field.key] : '')
                          : (attributes[field.key] || '')}
                        onChange={(e) => {
                          const newAttributes = { ...attributes };
                          if (field.type === 'number') {
                            const numValue = e.target.value ? parseFloat(e.target.value) : undefined;
                            if (numValue !== undefined && !isNaN(numValue)) {
                              newAttributes[field.key] = numValue;
                            } else {
                              delete newAttributes[field.key];
                            }
                          } else {
                            if (e.target.value) {
                              newAttributes[field.key] = e.target.value;
                            } else {
                              delete newAttributes[field.key];
                            }
                          }
                          setAttributes(newAttributes);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedTypeId > 0 ? (
              <div className="space-y-4 border-t pt-4">
                <FormLabel className="text-base font-semibold">Характеристики товара</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Для этого типа товара не настроены поля характеристик. Настройте их в разделе "Типы товаров".
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              <FormLabel>Медиа файлы</FormLabel>
              {/* Существующие медиа */}
              {existingMedia.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {[...existingMedia]
                    .sort((a, b) => {
                      // Сначала медиа для главной страницы, потом остальные
                      const aShowOnMain = mediaShowOnMain[a.id] !== false;
                      const bShowOnMain = mediaShowOnMain[b.id] !== false;
                      if (aShowOnMain && !bShowOnMain) return -1;
                      if (!aShowOnMain && bShowOnMain) return 1;
                      
                      // Внутри группы: сначала видео, потом картинки
                      if (a.type === 'video' && b.type !== 'video') return -1;
                      if (a.type !== 'video' && b.type === 'video') return 1;
                      return 0;
                    })
                    .map((media) => {
                    const marked = pendingRemoveMedia.includes(media.id);
                    const showOnMain = mediaShowOnMain[media.id] !== false; // по умолчанию true
                    return (
                      <div
                        key={media.id}
                        className="relative group"
                        style={{ opacity: marked ? 0.4 : 1 }}
                      >
                        {media.type === 'image' ? (
                          <Image
                            src={media.name}
                            alt="Media"
                            width={100}
                            height={100}
                            className="rounded-md object-cover w-full h-24"
                          />
                        ) : (
                          <div className="relative w-full h-24">
                            <video
                              src={media.name}
                              className="w-full h-24 object-cover rounded-md"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                              <Play className="h-8 w-8 text-white" fill="white" />
                            </div>
                          </div>
                        )}
                        {marked ? (
                          <Button
                            type="button"
                            size="sm"
                            className="absolute top-1 right-1 opacity-100 transition-opacity p-1 h-6 w-24 bg-yellow-200 text-xs"
                            onClick={() => unmarkMediaForRemove(media.id)}
                          >
                            Отменить
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                              onClick={() => markMediaForRemove(media.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Checkbox
                                checked={showOnMain}
                                onCheckedChange={(checked) => {
                                  setMediaShowOnMain(prev => ({
                                    ...prev,
                                    [media.id]: checked === true
                                  }));
                                }}
                                className="bg-white"
                              />
                            </div>
                            {showOnMain && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                Главная
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Выбранные файлы для загрузки */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="rounded-md object-cover w-full h-24"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs">{file.name}</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={() => removeSelectedFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* Поле для выбора файлов */}
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Выберите изображения или видео для товара
              </p>
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
                  setPendingRemoveMedia([]);
                }}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={uploading || !form.formState.isValid || (form.watch('typeId') === 0 && !isEditMode)}
              >
                {uploading 
                  ? 'Сохранение...' 
                  : isEditMode 
                    ? 'Сохранить изменения' 
                    : 'Создать товар'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

