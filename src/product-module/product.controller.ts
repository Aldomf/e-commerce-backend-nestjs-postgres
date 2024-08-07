import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('images')) // Intercept the 'image' file from the request
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() imageFiles: Express.Multer.File[], // Inject the uploaded image file
  ) {
    // Call the service method to create the product and pass both the DTO and the image file
    return this.productService.create(createProductDto, imageFiles);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() imageFiles: Express.Multer.File[],
  ) {
    return await this.productService.update(id, updateProductDto, imageFiles);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  @Post('upload-image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImage(@UploadedFiles() imageFiles: Express.Multer.File[]) {
    // Handle the uploaded image file and save it to the server
    const imageUrl = await this.productService.saveImages(imageFiles);
    return { imageUrl };
  }
}
