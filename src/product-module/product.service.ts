import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Not, Repository } from 'typeorm';
import { CategoryService } from 'src/category/category.service';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { Order } from 'src/order-module/entities/order.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    imageFile: Express.Multer.File,
  ): Promise<Product> {
    // Check if the product with the same name already exists
    const foundProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (foundProduct) {
      throw new BadRequestException(
        'Product with the same name already exists',
      );
    }

    // Check if the provided category exists in the database
    const category = await this.categoryService.findOneByName(
      createProductDto.category,
    );
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    // Logging discountPercentage, discountActive, and price before calculation
    console.log('Discount Percentage:', createProductDto.discountPercentage);
    const discountActive =
      typeof createProductDto.discountActive === 'boolean'
        ? createProductDto.discountActive
        : createProductDto.discountActive === 'true';

    const sale =
      typeof createProductDto.sale === 'boolean'
        ? createProductDto.sale
        : createProductDto.sale === 'true';

    const newProduct =
      typeof createProductDto.new === 'boolean'
        ? createProductDto.new
        : createProductDto.new === 'true';

    const inStock =
      typeof createProductDto.inStock === 'boolean'
        ? createProductDto.inStock
        : createProductDto.inStock === 'true';

    const hot =
      typeof createProductDto.hot === 'boolean'
        ? createProductDto.hot
        : createProductDto.hot === 'true';

    console.log('Discount Active:', discountActive);
    console.log('Discount Active Type:', typeof discountActive);
    console.log('Original Price:', createProductDto.price);
    console.log('Original Price Type:', typeof createProductDto.price);

    // Calculate priceWithDiscount if a discount is applicable and discount is active
    let priceWithDiscount: number = createProductDto.price; // By default, set it to the original price
    if (createProductDto.discountPercentage > 0 && discountActive) {
      const discount = createProductDto.discountPercentage / 100;
      priceWithDiscount = +(createProductDto.price * (1 - discount)).toFixed(2);
    }

    // Logging calculated priceWithDiscount
    console.log('Price With Discount:', priceWithDiscount);

    // Save the image to the server
    const imageUrl = await this.saveImage(imageFile);

    // Create and save the new product with the assigned image URL
    const createdProduct = this.productRepository.create({
      ...createProductDto,
      category,
      priceWithDiscount,
      discountActive,
      sale,
      new: newProduct,
      inStock,
      hot,
      imageUrl, // Assign the image URL to the product
    });

    // Logging the created product
    console.log('Created Product:', createdProduct);

    return await this.productRepository.save(createdProduct);
  }

  async findAll() {
    return await this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    const foundProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!foundProduct) {
      throw new NotFoundException('Product not found');
    }
    return foundProduct;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    imageFile?: Express.Multer.File,
  ): Promise<Product> {
    // Find the product to update
    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Check if the product with the same name already exists
    const foundProduct = await this.productRepository.findOne({
      where: {
        name: updateProductDto.name,
        // Exclude the current product by its ID
        id: Not(id), // Assuming you're using TypeORM, you may need to import Not from typeorm
      },
    });

    // If the found product has a different ID than the current product, it means there's another product with the same name
    if (foundProduct && foundProduct.id !== id) {
      throw new BadRequestException(
        'Product with the same name already exists',
      );
    }

    // Check if the provided category exists in the database
    const category = await this.categoryService.findOneByName(
      updateProductDto.category,
    );
    console.log(category);
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    // Logging discountPercentage, discountActive, and price before calculation
    console.log('Discount Percentage:', updateProductDto.discountPercentage);
    const discountActive =
      typeof updateProductDto.discountActive === 'boolean'
        ? updateProductDto.discountActive
        : updateProductDto.discountActive === 'true';

    const sale =
      typeof updateProductDto.sale === 'boolean'
        ? updateProductDto.sale
        : updateProductDto.sale === 'true';

    const newProduct =
      typeof updateProductDto.new === 'boolean'
        ? updateProductDto.new
        : updateProductDto.new === 'true';

    const inStock =
      typeof updateProductDto.inStock === 'boolean'
        ? updateProductDto.inStock
        : updateProductDto.inStock === 'true';

    const hot =
      typeof updateProductDto.hot === 'boolean'
        ? updateProductDto.hot
        : updateProductDto.hot === 'true';

    console.log('Discount Active:', discountActive);
    console.log('Discount Active Type:', typeof discountActive);
    console.log('Original Price:', updateProductDto.price);
    console.log('Original Price Type:', typeof updateProductDto.price);

    // Calculate priceWithDiscount if a discount is applicable and discount is active
    let priceWithDiscount: number = updateProductDto.price; // By default, set it to the original price
    if (updateProductDto.discountPercentage > 0 && discountActive) {
      const discount = updateProductDto.discountPercentage / 100;
      priceWithDiscount = +(updateProductDto.price * (1 - discount)).toFixed(2);
    }

    // Logging calculated priceWithDiscount
    console.log('Price With Discount:', priceWithDiscount);

    // Save the image to the server
    const imageUrl = await this.saveImage(imageFile);

    // Update product properties
    existingProduct.name = updateProductDto.name;
    existingProduct.description = updateProductDto.description;
    existingProduct.category = category;
    existingProduct.price = updateProductDto.price;
    existingProduct.discountPercentage = updateProductDto.discountPercentage;
    existingProduct.priceWithDiscount = priceWithDiscount;
    existingProduct.discountActive = discountActive;
    existingProduct.sale = sale;
    existingProduct.new = newProduct;
    existingProduct.inStock = inStock;
    existingProduct.hot = hot;
    if (imageUrl) {
      existingProduct.imageUrl = imageUrl; // Assign the updated image URL to the product
    }

    // Logging the updated product
    console.log('Updated Product:', existingProduct);

    return await this.productRepository.save(existingProduct);
  }

  async remove(id: number) {
    const foundProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['orders'], // Assuming 'orders' is the relationship name between Product and OrderProduct
    });

    if (!foundProduct) {
      throw new NotFoundException('Product not found');
    }

    // Delete associated records in the 'order_product' table
    if (foundProduct.orders && foundProduct.orders.length > 0) {
      for (const order of foundProduct.orders) {
        await this.orderRepository.delete(order.id);
      }
    }

    // Now delete the product itself
    return await this.productRepository.delete(id);
  }

  async saveImage(imageFile?: Express.Multer.File): Promise<string> {
    try {
      if (!imageFile) {
        // If no image file is provided, return null or throw an error as per your requirement
        return null; // or throw new Error('No image file provided');
      }

      let domain = 'localhost:4000'; // Default domain for development

      // Check if the environment is production
      if (process.env.NODE_ENV === 'production') {
        // Set the production domain based on your actual production domain
        domain = 'your-production-domain.com';
      }

      const uploadDir = join(process.cwd(), 'src', 'uploads');
      const uploadPath = join(uploadDir, imageFile.originalname);

      // Ensure that the uploads directory exists
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      const writeStream = createWriteStream(uploadPath);
      await new Promise<void>((resolve, reject) => {
        writeStream.write(imageFile.buffer);
        writeStream.end(resolve); // Call end without any arguments
        writeStream.on('error', reject);
      });

      // Return the absolute URL of the saved image
      return `http://${domain}/${imageFile.originalname}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }
}
