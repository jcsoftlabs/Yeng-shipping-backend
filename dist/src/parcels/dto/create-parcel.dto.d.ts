export declare class CreateParcelDto {
    customerId: string;
    barcode?: string;
    senderName: string;
    senderAddress: string;
    senderCity: string;
    senderState: string;
    senderZipCode: string;
    description: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    declaredValue: number;
    shippingFee?: number;
    discount?: number;
    taxAmount?: number;
    notes?: string;
}
