import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        // Try to find user (admin/staff)
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (user) {
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Email ou mot de passe incorrect');
            }

            if (!user.isActive) {
                throw new UnauthorizedException('Compte désactivé');
            }

            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                type: 'user',
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        }

        // Try to find customer
        const customer = await this.prisma.customer.findUnique({
            where: { email: loginDto.email },
        });

        if (customer && customer.password) {
            const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Email ou mot de passe incorrect');
            }

            if (!customer.isActive) {
                throw new UnauthorizedException('Compte désactivé');
            }

            const payload = {
                sub: customer.id,
                email: customer.email,
                role: 'CUSTOMER',
                type: 'customer',
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: customer.id,
                    email: customer.email,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    role: 'CUSTOMER',
                    customAddress: customer.customAddress,
                },
            };
        }

        throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    async validateToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Token invalide');
        }
    }
}
