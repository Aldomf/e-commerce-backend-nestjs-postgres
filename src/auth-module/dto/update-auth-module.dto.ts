import { PartialType } from '@nestjs/mapped-types';
import { SignupDto } from './signup.dto';

export class UpdateAuthModuleDto extends PartialType(SignupDto) {}
