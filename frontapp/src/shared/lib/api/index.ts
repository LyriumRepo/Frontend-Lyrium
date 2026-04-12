import { apiFactory, homeRepository, productRepository, orderRepository, userRepository, authRepository } from './factory';
import { LaravelHomeRepository } from './laravel';
import { LaravelProductRepository } from './laravel';
import { LaravelOrderRepository } from './laravel';
import { LaravelUserRepository } from './laravel';
import { LaravelAuthRepository } from './laravel';
import { WPHomeRepository } from './wp';
import { WPProductRepository } from './wp';
import { WPOrderRepository } from './wp';
import { WPUserRepository } from './wp';
import { WPAuthRepository } from './wp';
import { cartApi, type CartResource, type CartItem, type CartItemProduct } from './cartRepository';

export async function updateProductStatus(id: string, status: string, reason?: string) {
    const repo = productRepository as LaravelProductRepository;
    return repo.updateProductStatus(id, status, reason);
}

export {
    apiFactory,
    homeRepository,
    productRepository,
    orderRepository,
    userRepository,
    authRepository,
    LaravelHomeRepository,
    LaravelProductRepository,
    LaravelOrderRepository,
    LaravelUserRepository,
    LaravelAuthRepository,
    WPHomeRepository,
    WPProductRepository,
    WPOrderRepository,
    WPUserRepository,
    WPAuthRepository,
    cartApi,
    CartResource,
    CartItem,
    CartItemProduct,
};
