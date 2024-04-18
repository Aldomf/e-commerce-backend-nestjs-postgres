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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
}
