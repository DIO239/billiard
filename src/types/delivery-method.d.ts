export interface IDeliveryMethod {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
