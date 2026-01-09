export interface ICharacteristic {
    id: number;
    attributes?: Record<string, string | number> | null;
}