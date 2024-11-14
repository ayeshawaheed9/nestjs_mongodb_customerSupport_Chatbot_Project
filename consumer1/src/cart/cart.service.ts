import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Request } from 'express';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

 async getCartByUserId(userId: string): Promise<CartDocument> {
  let cart = await this.cartModel.findOne({ user: userId, isCheckedOut: false }).exec();
  if (!cart) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log('cart created against user :',user)
    cart = new this.cartModel({ 
      user: userId, 
      userName: user.userName, 
      products: [] 
    });

    return await cart.save();
  }
  return cart;
}

  async addToCart(
    userId: string, productId: string,quantity: number,request: any ): Promise<{  message: string; cart: CartDocument }> {
    if (!request.userId) {
      throw new UnauthorizedException('You need to log in to proceed with your cart.');
    }

    let cart = await this.getCartByUserId(userId);
    const prodId = new Types.ObjectId(productId);
    const product = await this.productModel.findById(prodId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const user = await this.userModel.findById(new Types.ObjectId(userId)).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === prodId.toString()
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
      existingProduct.totalPrice = product.price * existingProduct.quantity;
    } else {
      const totalPrice = product.price * quantity;
      cart.products.push({
        product: prodId,
        productName: product.name,
        quantity,
        totalPrice,
      });
    }

    product.quantity -= quantity;
    await product.save();
    await cart.save();

    user.cartId = new Types.ObjectId(cart._id);
    await user.save(); 

    return {
      message: `Product "${product.name}" added to cart successfully`,
      cart
    };
  }

  async removeFromCart(userId: string, productId: string): Promise<CartDocument> {
    const cart = await this.getCartByUserId(userId);
    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);
    if (productIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.quantity += cart.products[productIndex].quantity;
    await product.save();
    cart.products.splice(productIndex, 1);
    return await cart.save();
  }

  async checkoutCart(request: Request): Promise<any> {
    const userId = request.session?.userId;
    if (!userId) {
      throw new UnauthorizedException('You need to log in before checking out.');
    }
    const cart = await this.getCartByUserId(userId);
    if (cart.products.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }
    cart.isCheckedOut = true;
    await cart.save();
    return {
      message: 'Checked out successfully',
      cart,
    };
  }
}
