import { IProduct } from "./product";

export interface IProductResponse {
    data: {
        products: IProduct[];
    }
}