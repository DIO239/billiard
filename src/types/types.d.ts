export interface ICharacteristicField {
    key: string;
    label: string;
    type: 'string' | 'number';
    placeholder?: string;
}

export interface IType {
    id: number;
    value: string;
    name: string;
    characteristicFields?: ICharacteristicField[] | null;
}