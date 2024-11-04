import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Types } from 'mongoose';
import { AddProductDto } from 'src/dtos/addProduct.dto';
import { Subject } from 'rxjs';
import { OrdersService } from '@orders/orders.service';
import { forwardRef } from '@nestjs/common';
@Injectable()
export class ProductService {
   private restockSubject = new Subject<Product>();
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => OrdersService)) // Use forwardRef to resolve circular dependency
    private readonly ordersService: OrdersService, 
  ) {}
  get restock$() {
    return this.restockSubject.asObservable();
  }
  // Add a new product
  async addProduct(productDto: AddProductDto): Promise<Product> {
    // Use regex for loose matching of the product name
   // Matches exact term "phone" or "cellphone" but not when they are part of a larger word (like "phone cover").
    const regex = new RegExp(`\\b${productDto.name}\\b`, 'i');
    const existingProduct = await this.productModel.findOne({ name: { $regex: regex } });

    if (existingProduct) {
      throw new BadRequestException(`Product with a similar name already exists: ${existingProduct.name}`);
    }

    // If no matching product, create and save the new product
    const newProduct = new this.productModel(productDto);
    return newProduct.save();
  }
// Method to update a product's stock
  async updateProductStock(productId: string, newStock: number): Promise<Product> {
    const prodId= new Types.ObjectId(productId);
    const product = await this.productModel.findById(prodId); 
    product.quantity = newStock;
    await product.save();

    // Notify restock if stock goes from 0 to above 0
    if (newStock > 0 && product.quantity === 0) {
      this.restockSubject.next(product);
    }

    return product;
  }
  async restockProduct(productId: string, quantity: number) {
  const prodId= new Types.ObjectId(productId);
  const product = await this.productModel.findById(prodId);
  if (product) {
    product.quantity += quantity; // Update quantity
    await product.save();
    
    // Notify the OrdersService that this product has been restocked
    this.ordersService.notifyRestockedProduct(product.name); // Pass the product name
  }
}
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  // Get a single product by ID
  async getProductById(productId: string): Promise<Product> {
    
    const prodId= new Types.ObjectId(productId);
    return this.productModel.findById(prodId).exec();
  }

  // Update product details
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const prodId= new Types.ObjectId(productId);
    return this.productModel.findByIdAndUpdate(prodId, updates, { new: true }).exec();
  }

  // Delete a product
  async deleteProduct(productId: string): Promise<any> {
    return this.productModel.findByIdAndDelete(productId).exec();
  }
}
