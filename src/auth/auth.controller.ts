import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";

class RegisterDto {
  public email!: string;
  public password!: string;
}

class LoginDto {
  public email!: string;
  public password!: string;
}

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() registerDto: RegisterDto): Promise<string> {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
