import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user-module/user.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './interfaces/userInterface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendEmailService } from 'src/resend-email/resend-email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly resendEmailService: ResendEmailService,
  ) {}

  //Signup
  async signup(signupDto: SignupDto) {
    const userFound = await this.userService.findUserByEmail(signupDto.email);

    if (userFound) {
      throw new BadRequestException('User already exists');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create a new user object with the hashed password
    const newUser = {
      ...signupDto,
      password: hashedPassword,
    };

    // Create the user using the userService
    return await this.userService.create(newUser);
  }

  //Login
  async login(loginDto: LoginDto) {
    // Find the user by email
    const user = await this.userService.findUserByEmail(loginDto.email);

    // If user not found or password does not match, throw UnauthorizedException
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If login successful, generate JWT token
    const token = await this.generateToken(user);

    // Return the token along with user data without password
    return { token, user: { ...user, password: undefined } };
  }

  // Function to generate JWT token
  private async generateToken(user: User): Promise<string> {
    const payload = {
      email: user.email,
      username: user.username,
      sub: user.id,
      role: user.role,
    }; // Customize payload as per your needs
    return await this.jwtService.signAsync(payload); // Sign the payload to generate JWT token
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate and store reset token
    const resetToken = await this.generateResetToken(user.id.toString());

    // Send reset password email with reset token using the email service
    await this.resendEmailService.sendPasswordResetEmail(email, resetToken);
  }

  // Reset Password
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Decode and verify reset token
    const decoded = await this.verifyResetToken(resetPasswordDto.token);

    // Find user by id
    const user = await this.userService.findOne(decoded.sub);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await this.userService.update(user);
  }

  // Generate reset token
  private async generateResetToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };
    return await this.jwtService.signAsync(payload, { expiresIn: '1h' }); // Token expires in 1 hour
  }

  // Verify reset token
  private async verifyResetToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return decoded;
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
