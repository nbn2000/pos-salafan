import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeasurementType, Priority } from 'src/common/enums/enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './services/product.service';

// images removed

@ApiTags('Product')
@Controller('api/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: Object.values(MeasurementType) }, // required
        cost: { type: 'number', nullable: true },
        amount: { type: 'number' },
        sellPrice: { type: 'number', nullable: true },
        priority: { type: 'string', enum: Object.values(Priority) },
      },
      required: ['name', 'type', 'amount'],
    },
  })
  @ApiResponse({ status: 201, description: 'Product created' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get('find-to-fill-store')
  @ApiResponse({
    status: 200,
    description: "Omborni to'ldirish kerak bo'lgan mahsulotlar ro'yxati",
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          link: { type: 'string', example: '/products/{productId}' },
        },
      },
    },
  })
  findToFillStore() {
    return this.productService.findToFillStore();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
