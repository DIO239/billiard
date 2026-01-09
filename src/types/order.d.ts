export interface Order {
  id: number;
  userId?: number | null;
  user?: any;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product?: any;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'SUCCEEDED' | 'CANCELLED' | 'IN_TRANSIT';
  createdAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment?: string | null;
  orderNumber: string;
  trackingCode?: string | null;
  paymentId?: string | null;
  deliveryMethodId?: number | null;
  deliveryMethod?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
}
