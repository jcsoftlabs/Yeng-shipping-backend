import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService,
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
                    fullUSAAddress: customer.fullUSAAddress,
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

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const customer = await this.prisma.customer.findUnique({
            where: { email: forgotPasswordDto.email },
        });

        if (!customer) {
            // Don't reveal if user exists
            return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
        }

        // Generate reset token
        const resetToken = uuidv4();
        // Expires in 30 minutes
        const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                resetToken,
                resetTokenExpires,
            },
        });

        // Send email
        await this.emailService.sendPasswordResetEmail(customer, resetToken);

        return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        // Find user with valid token
        const customer = await this.prisma.customer.findFirst({
            where: {
                resetToken: resetPasswordDto.token,
                resetTokenExpires: {
                    gt: new Date(),
                },
            },
        });

        if (!customer) {
            throw new BadRequestException('Lien invalide ou expiré');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

        // Update customer
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null,
            },
        });

        return { message: 'Mot de passe réinitialisé avec succès' };
    }
}
