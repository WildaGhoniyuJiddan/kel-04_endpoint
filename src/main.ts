import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Rfc7807ExceptionFilter } from './common/filters/rfc7807-exception.filter';

async function bootstrap() {
  const logger = new Logger('Retail-Toko-SRC-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 2. Global RFC 7807 / RFC 9457 Problem Details Exception Filter
  app.useGlobalFilters(new Rfc7807ExceptionFilter());

  // 3. OpenAPI 3.0 (Swagger UI) dengan Reusable Parameter & Security Scheme
  const config = new DocumentBuilder()
    .setTitle('EAI: RESTful API Kasus Retail Toko SRC')
    .setDescription(
      `### Tugas Praktikum Integrasi Aplikasi Korporasi (EAI) - Kelompok 04
**Studi Kasus: Sistem Ritel Kasir Toko Kelontong Modern SRC (Sampoerna Retail Community)**

**Spesifikasi Praktikum yang Diimplementasikan:**
1. **Resource Modeling (4 Resource Utama)**:
   - \`Customers\` (\`/v1/customers\`): Member pelanggan Toko SRC dan poin reward koin belanja.
   - \`Products\` (\`/v1/products\`): Katalog komoditas sembako (Beras, Minyak, Gula) beserta stok fisik.
   - \`Invoices\` (\`/v1/invoices\`): Nota belanja kasir toko ritel.
   - \`Payment Intents\` (\`/v1/payment_intents\`): Niat pembayaran (Pola Stripe & Midtrans).
2. **Idempotency Pattern (POST Kritikal)**:
   - Header \`Idempotency-Key: <UUID>\` pada \`POST /v1/payment_intents/{id}/confirm\`.
   - Menjamin transaksi retry tidak menyebabkan pemotongan stok ganda atau pemberian poin ganda!
3. **Pagination, Filtering, & Sorting**:
   - Parameter query standar (\`page\`, \`limit\`, \`search\`, \`status\`, \`sortBy\`, \`sortOrder\`) pada seluruh endpoint list.
4. **Error Standard RFC 7807 / RFC 9457**:
   - Seluruh respon error bertipe \`application/problem+json\` dengan skenario: 400 Bad Request, 401 Unauthorized, 404 Not Found, dan 409 Conflict.
5. **OpenAPI Security**:
   - Skema autentikasi Bearer API Key (\`Bearer sk_src_test123\`).`,
    )
    .setVersion('1.0.0')
    .addTag('Customers (Member Toko SRC)')
    .addTag('Products (Katalog Sembako SRC)')
    .addTag('Invoices (Nota Belanja Kasir Toko SRC)')
    .addTag('Payment Intents (Stripe / Midtrans Pattern)')
    .addTag('System State & Testing')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT/API-Key',
        description: 'Masukkan API Key dengan format: Bearer sk_src_test123',
      },
      'bearer-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Toko SRC API Documentation (OpenAPI 3.0)',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`================================================================`);
  logger.log(`Aplikasi Backend Retail Toko SRC aktif di port: ${port}`);
  logger.log(`Swagger UI (OpenAPI 3.0) dapat diakses di: http://localhost:${port}/docs`);
  logger.log(`Spesifikasi OpenAPI JSON: http://localhost:${port}/docs-json`);
  logger.log(`Format Error: RFC 7807 (application/problem+json)`);
  logger.log(`POST Kritikal Idempoten: POST /v1/payment_intents/:id/confirm`);
  logger.log(`================================================================`);
}

bootstrap();
