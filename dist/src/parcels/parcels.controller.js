"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsController = void 0;
const common_1 = require("@nestjs/common");
const parcels_service_1 = require("./parcels.service");
const auth_service_1 = require("../auth/auth.service");
const create_parcel_dto_1 = require("./dto/create-parcel.dto");
const update_parcel_status_dto_1 = require("./dto/update-parcel-status.dto");
const client_1 = require("@prisma/client");
let ParcelsController = class ParcelsController {
    parcelsService;
    authService;
    constructor(parcelsService, authService) {
        this.parcelsService = parcelsService;
        this.authService = authService;
    }
    create(createParcelDto) {
        return this.parcelsService.create(createParcelDto);
    }
    async findAll(status, customerId, search, req) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Authentification requise');
        }
        let finalCustomerId = customerId;
        try {
            const token = authHeader.split(' ')[1];
            const payload = await this.authService.validateToken(token);
            if (payload.role === 'CUSTOMER') {
                finalCustomerId = payload.sub;
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Session invalide');
        }
        return this.parcelsService.findAll({ status, customerId: finalCustomerId, search });
    }
    findByTracking(trackingNumber) {
        return this.parcelsService.findByTracking(trackingNumber);
    }
    findByBarcode(barcode) {
        return this.parcelsService.findByBarcode(barcode);
    }
    findOne(id) {
        return this.parcelsService.findOne(id);
    }
    updateStatus(id, updateStatusDto) {
        return this.parcelsService.updateStatus(id, updateStatusDto);
    }
};
exports.ParcelsController = ParcelsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parcel_dto_1.CreateParcelDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('customerId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParcelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tracking/:trackingNumber'),
    __param(0, (0, common_1.Param)('trackingNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "findByTracking", null);
__decorate([
    (0, common_1.Get)('barcode/:barcode'),
    __param(0, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_parcel_status_dto_1.UpdateParcelStatusDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "updateStatus", null);
exports.ParcelsController = ParcelsController = __decorate([
    (0, common_1.Controller)('parcels'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService,
        auth_service_1.AuthService])
], ParcelsController);
//# sourceMappingURL=parcels.controller.js.map