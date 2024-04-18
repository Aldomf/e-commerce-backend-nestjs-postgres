import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingAddressDto } from './createShippingAddress.dto';

export class UpdateShippingAddressDto extends PartialType(
  CreateShippingAddressDto,
) {}
