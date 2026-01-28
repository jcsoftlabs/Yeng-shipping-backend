import { Module, forwardRef } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [CustomersController],
    providers: [CustomersService],
    exports: [CustomersService],
})
export class CustomersModule { }
