import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true }),
	);

	// Enable CORS for the specified frontend URL
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

	app.enableCors({
		origin: frontendUrl,
		credentials: true,
	});

	const port = process.env.PORT || 3000;
	const config = new DocumentBuilder()
		.setTitle('Task Management API')
		.setDescription('API for managing tasks')
		.setVersion('1.0')
		.addBearerAuth({
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
			name: 'JWT',
			description: 'Enter JWT token',
			in: 'header',
		})
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	await app.listen(port);
	Logger.log(
		`🚀 API is running on: http://localhost:${port}/${globalPrefix}`,
	);
	console.log(`\n👉 API URL: http://localhost:${port}/${globalPrefix}\n`);
}

bootstrap().catch((error) => {
	Logger.error('Failed to start application', error);
	process.exit(1);
});
