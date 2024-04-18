import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const foundCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (foundCategory) {
      throw new BadRequestException(
        'Category with the same name already exists',
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: number) {
    // Check if the product exists
    const categoryExist = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!categoryExist) {
      throw new NotFoundException('Category not found');
    }
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Check if the product exists
    const categoryExist = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!categoryExist) {
      throw new NotFoundException('Product not found');
    }
    //Check if the product name already exist
    const categoryName = await this.categoryRepository.findOne({
      where: { name: updateCategoryDto.name },
    });
    if (categoryName) {
      throw new BadRequestException(
        'Category with the same name already exists',
      );
    }
    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: number) {
    // Check if the product exists
    const categoryExist = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!categoryExist) {
      throw new NotFoundException('Product not found');
    }

    if (categoryExist.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated products',
      );
    }

    return await this.categoryRepository.delete(id);
  }

  async findOneByName(name: string): Promise<Category> {
    return this.categoryRepository.findOne({ where: { name } });
  }
}
