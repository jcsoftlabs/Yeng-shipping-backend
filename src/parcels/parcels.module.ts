import { Module, forwardRef } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { ParcelsController } from './parcels.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [ParcelsController],
    providers: [ParcelsService],
    exports: [ParcelsService],
})
export class ParcelsModule { }
