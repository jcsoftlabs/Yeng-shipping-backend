"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let CustomersService = class CustomersService {
    prisma;
    WAREHOUSE_ADDRESS = {
        street: '7829 NW 72nd Ave',
        city: 'Miami',
        state: 'FL',
        zipCode: '33166',
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCustomAddress(firstName, lastName) {
        const firstLetterLastName = lastName.charAt(0).toUpperCase();
        const uniqueCode = Math.floor(1000 + Math.random() * 9000);
        let customAddress = `YENGSHIPPING ${firstLetterLastName}${firstName}/${uniqueCode}`;
        const existing = await this.prisma.customer.findUnique({
            where: { customAddress },
        });
        if (existing) {
            return this.generateCustomAddress(firstName, lastName);
        }
        return customAddress;
    }
    generateFullUSAAddress(customAddress) {
        return `${customAddress}\n${this.WAREHOUSE_ADDRESS.street}\n${this.WAREHOUSE_ADDRESS.city}, ${this.WAREHOUSE_ADDRESS.state} ${this.WAREHOUSE_ADDRESS.zipCode}`;
    }
    async create(createCustomerDto) {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { email: createCustomerDto.email },
        });
        if (existingCustomer) {
            throw new common_1.ConflictException('Un client avec cet email existe déjà');
        }
        const customAddress = await this.generateCustomAddress(createCustomerDto.firstName, createCustomerDto.lastName);
        const fullUSAAddress = this.generateFullUSAAddress(customAddress);
        let hashedPassword;
        if (createCustomerDto.password) {
            hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);
        }
        const customer = await this.prisma.customer.create({
            data: {
                email: createCustomerDto.email,
                firstName: createCustomerDto.firstName,
                lastName: createCustomerDto.lastName,
                phone: createCustomerDto.phone,
                customAddress,
                fullUSAAddress,
                password: hashedPassword,
                addressLine1: createCustomerDto.addressLine1,
                addressLine2: createCustomerDto.addressLine2,
                city: createCustomerDto.city,
            },
        });
        const { password, ...result } = customer;
        return result;
    }
    async findAll(search) {
        const where = search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { customAddress: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const customers = await this.prisma.customer.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                fullUSAAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { parcels: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return customers;
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                fullUSAAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                parcels: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return customer;
    }
    async findByEmail(email) {
        return this.prisma.customer.findUnique({
            where: { email },
        });
    }
    async findByCustomAddress(customAddress) {
        const customer = await this.prisma.customer.findUnique({
            where: { customAddress },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return customer;
    }
    async getUSAAddress(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                customAddress: true,
                fullUSAAddress: true,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return {
            customerId: customer.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customAddress: customer.customAddress,
            fullAddress: customer.fullUSAAddress,
            formattedAddress: customer.fullUSAAddress?.split('\n') || [],
        };
    }
    async searchByCode(searchTerm) {
        const customers = await this.prisma.customer.findMany({
            where: {
                OR: [
                    { customAddress: { contains: searchTerm, mode: 'insensitive' } },
                    { customAddress: { endsWith: `/${searchTerm}` } },
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                fullUSAAddress: true,
                addressLine1: true,
                city: true,
                country: true,
            },
            take: 10,
        });
        return customers;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map