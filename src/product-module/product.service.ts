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
//import { join } from 'path';
//import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { Order } from 'src/order-module/entities/order.entity';
import { v2 as cloudinary } from 'cloudinary';
//import { Stream, Readable } from 'stream';
import * as fs from 'fs';
import * as util from 'util';
import { config } from 'dotenv';
config();

// Configure Cloudinary with your Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);

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
    imageFiles: Express.Multer.File[],
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

    console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET);

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
    const imageUrls = await this.saveImages(imageFiles);

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
      imageUrls,
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
    imageFiles: Express.Multer.File[],
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

    if (foundProduct && foundProduct.id !== id) {
      throw new BadRequestException(
        'Product with the same name already exists',
      );
    }

    // Check if the provided category exists in the database
    const category = await this.categoryService.findOneByName(
      updateProductDto.category,
    );
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    // Convert string booleans to actual booleans if necessary
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

    // Calculate price with discount
    let priceWithDiscount: number = updateProductDto.price; // Default to original price
    if (updateProductDto.discountPercentage > 0 && discountActive) {
      const discount = updateProductDto.discountPercentage / 100;
      priceWithDiscount = +(updateProductDto.price * (1 - discount)).toFixed(2);
    }

    // Initialize the updated image URLs with the existing ones
    let updatedImageUrls: string[] = existingProduct.imageUrls.slice();

    // If there are indices of images to delete, remove those images from Cloudinary and update the image URLs
    if (
      updateProductDto.imageIndicesToDelete &&
      updateProductDto.imageIndicesToDelete.length > 0
    ) {
      const imagesToDelete = updateProductDto.imageIndicesToDelete.map(
        (index) => existingProduct.imageUrls[index],
      );

      // Filter out the images to delete from the existing image URLs
      updatedImageUrls = updatedImageUrls.filter(
        (url) => !imagesToDelete.includes(url),
      );

      // Delete the images from Cloudinary
      await this.deleteImagesFromCloudinary(imagesToDelete);
    }

    // Save new images to Cloudinary if provided and update the image URLs
    if (imageFiles && imageFiles.length > 0) {
      const newImageUrls = await this.saveImages(imageFiles);
      updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
    }

    console.log(updatedImageUrls);

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
    existingProduct.imageUrls = updatedImageUrls; // Assign updated image URLs

    return await this.productRepository.save(existingProduct);
  }

  async remove(id: number) {
    // Find the product to delete
    const productToDelete = await this.productRepository.findOne({
      where: { id },
    });

    if (!productToDelete) {
      throw new NotFoundException('Product not found');
    }

    // Delete the existing images from Cloudinary
    await this.deleteImagesFromCloudinary(productToDelete.imageUrls);

    return await this.productRepository.delete(id);
  }

  // async saveImage(imageFile?: Express.Multer.File): Promise<string> {
  //   try {
  //     if (!imageFile) {
  //       // If no image file is provided, return null or throw an error as per your requirement
  //       return null; // or throw new Error('No image file provided');
  //     }

  //     let domain = 'http://localhost:4000'; // Default domain for development

  //     // Check if the environment is production
  //     if (process.env.NODE_ENV === 'production') {
  //       // Set the production domain based on your actual production domain
  //       domain = 'https://e-commerce-backend-nestjs-postgres.onrender.com';
  //     }

  //     const uploadDir = join(process.cwd(), 'src', 'uploads');
  //     const uploadPath = join(uploadDir, imageFile.originalname);

  //     // Ensure that the uploads directory exists
  //     if (!existsSync(uploadDir)) {
  //       mkdirSync(uploadDir, { recursive: true });
  //     }

  //     const writeStream = createWriteStream(uploadPath);
  //     await new Promise<void>((resolve, reject) => {
  //       writeStream.write(imageFile.buffer);
  //       writeStream.end(resolve); // Call end without any arguments
  //       writeStream.on('error', reject);
  //     });

  //     // Return the absolute URL of the saved image
  //     return `${domain}/${imageFile.originalname}`;
  //   } catch (error) {
  //     console.error('Error saving image:', error);
  //     throw new Error('Failed to save image');
  //   }
  // }

  async saveImages(imageFiles?: Express.Multer.File[]): Promise<string[]> {
    try {
      if (!imageFiles || imageFiles.length === 0) {
        return [];
      }

      const uploadedImageUrls: string[] = [];

      // Upload each file to Cloudinary
      for (const imageFile of imageFiles) {
        const tempFilePath = `temp-${Date.now()}.${imageFile.originalname.split('.').pop()}`;
        await writeFileAsync(tempFilePath, imageFile.buffer);

        // Upload the temporary file to Cloudinary
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'e-commerce-shipshop', // Optional: Specify a folder in Cloudinary to organize your images
        });

        // Collect the URL of the uploaded image
        uploadedImageUrls.push(result.secure_url);

        // Delete the temporary file
        await unlinkAsync(tempFilePath);
      }

      // Return the array of uploaded image URLs
      return uploadedImageUrls;
    } catch (error) {
      console.error('Error saving images to Cloudinary:', error);
      throw new Error('Failed to save image');
    }
  }

  // Method to delete image from Cloudinary
  async deleteImagesFromCloudinary(imageUrls: string[]): Promise<void> {
    try {
      for (const imageUrl of imageUrls) {
        // Extract the public ID of the image from the Cloudinary URL
        const publicId = this.extractPublicIdFromImageUrl(imageUrl);

        if (publicId) {
          // Delete the image from Cloudinary using its public ID
          await cloudinary.uploader.destroy(publicId);
          console.log(`Image deleted from Cloudinary. Public ID: ${publicId}`);
        }
      }
    } catch (error) {
      console.error('Error deleting images from Cloudinary:', error);
      throw new Error('Failed to delete images from Cloudinary');
    }
  }

  // Helper method to extract public ID from Cloudinary image URL along with the folder name
  extractPublicIdFromImageUrl(imageUrl: string): string | null {
    try {
      // Split the URL by '/' and get the last part (public ID)
      const parts = imageUrl.split('/');
      return `e-commerce-shipshop/${parts.pop()?.split('.')[0] || null}`;
    } catch (error) {
      console.error('Error extracting public ID from image URL:', error);
      return null;
    }
  }
}
