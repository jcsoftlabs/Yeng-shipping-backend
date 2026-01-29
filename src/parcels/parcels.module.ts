import { Module, forwardRef } from '@nestjs/common';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomersModule } from '../customers/customers.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, CustomersModule, forwardRef(() => AuthModule), EmailModule],
    controllers: [ParcelsController],
    providers: [ParcelsService],
})
export class ParcelsModule { }
