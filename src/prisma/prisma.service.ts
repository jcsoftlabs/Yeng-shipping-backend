import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public prisma: PrismaClient;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  // Delegate all Prisma methods to the prisma instance
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get user() {
    return this.prisma.user;
  }

  get customer() {
    return this.prisma.customer;
  }

  get parcel() {
    return this.prisma.parcel;
  }

  get trackingEvent() {
    return this.prisma.trackingEvent;
  }

  get invoice() {
    return this.prisma.invoice;
  }

  get payment() {
    return this.prisma.payment;
  }

  get settings() {
    return this.prisma.settings;
  }
}
