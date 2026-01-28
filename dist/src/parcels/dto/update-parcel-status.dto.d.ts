import { ParcelStatus } from '@prisma/client';
export declare class UpdateParcelStatusDto {
    status: ParcelStatus;
    location?: string;
    description?: string;
}
