import { ICharacteristic } from "./characteristic";
import { IMedia } from "./media";
import { IType } from "./types";

export interface IProduct {
    characteristic: ICharacteristic | null;
    count: number;
    createdAt: Date;
    description: string;
    id: number;
    media: IMedia[];
    price: number;
    title: string;
    type: IType;
    typeId: number;
    updatedAt: Date;
    visible: boolean;
}