import { create } from 'zustand';

interface ICartState {
    // TODO: Добавить типизацию корзины 
    items: any[];
    setItems: (items: any[]) => void;
    addItem: (item: any) => void;
}

export const useCartStore = create<ICartState>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  }));