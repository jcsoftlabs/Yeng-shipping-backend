"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3001',
            'http://localhost:3002',
            'https://yeng-admin.vercel.app',
            'https://yeng-admin-iowhbql4g-jerome-christophers-projects.vercel.app',
            /^https:\/\/yeng-admin-.*\.vercel\.app$/
        ],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map