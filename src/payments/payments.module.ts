import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ReceiptService } from './receipt.service';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, ReceiptService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
