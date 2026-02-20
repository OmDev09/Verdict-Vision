import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterLawyerDto, LoginDto, RefreshDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.auth.registerUser(dto);
  }

  @Post('register/lawyer')
  registerLawyer(@Body() dto: RegisterLawyerDto) {
    return this.auth.registerLawyer(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }
}
