import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TenantHealthGuard } from './guards/tenant-health.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // <--- JWT is now Global!
    },
    {
      provide: APP_GUARD,
      useClass: TenantHealthGuard, // Are you and your gym "healthy"?
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
