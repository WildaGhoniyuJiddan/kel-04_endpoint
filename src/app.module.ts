import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StateModule } from './modules/state/state.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    PaymentsModule,
    StateModule,
  ],
})
export class AppModule {}
