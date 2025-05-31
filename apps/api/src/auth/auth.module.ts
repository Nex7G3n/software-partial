import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AuthController } from './application/controllers/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RefreshToken } from './domain/entities/refresh-token.entity';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';
import { UserEntity } from './domain/entities/user.entity';
import { LoggerModule } from '../logger/logger.module';
import { AuthApplicationService } from './application/services/auth.application.service';
import { JwtRefreshGuard } from './infrastructure/guards/refresh.guard';

@Module({
	imports: [
		TypeOrmModule.forFeature([RefreshToken, UserEntity]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				secret: config.get('JWT_SECRET'),
				signOptions: { expiresIn: '15m' },
			}),
			inject: [ConfigService],
		}),
		LoggerModule,
	],
	providers: [
		AuthApplicationService,
		GoogleStrategy,
		JwtStrategy,
		JwtRefreshStrategy,
		JwtAuthGuard,
		JwtRefreshGuard,
		PermissionsGuard, // Add PermissionsGuard here
	],
	controllers: [AuthController],
	exports: [JwtModule, AuthApplicationService],
})
export class AuthModule {}
