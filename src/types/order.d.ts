export interface Order {
  id: number;
  userId: number;
  items: Array<{ productId: number; quantity: number }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
