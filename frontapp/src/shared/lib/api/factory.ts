import { IHomeRepository } from './contracts/IHomeRepository';
import { IProductRepository } from './contracts/IProductRepository';
import { IOrderRepository } from './contracts/IOrderRepository';
import { IUserRepository } from './contracts/IUserRepository';
import { IAuthRepository } from './contracts/IAuthRepository';

import { WPHomeRepository } from './wp/WPHomeRepository';
import { WPProductRepository } from './wp/WPProductRepository';
import { WPOrderRepository } from './wp/WPOrderRepository';
import { WPUserRepository } from './wp/WPUserRepository';
import { WPAuthRepository } from './wp/WPAuthRepository';

import { LaravelHomeRepository } from './laravel/LaravelHomeRepository';
import { LaravelProductRepository } from './laravel/LaravelProductRepository';
import { LaravelOrderRepository } from './laravel/LaravelOrderRepository';
import { LaravelUserRepository } from './laravel/LaravelUserRepository';
import { LaravelAuthRepository } from './laravel/LaravelAuthRepository';

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'wp';

export interface ApiFactory {
    homeRepository: IHomeRepository;
    productRepository: IProductRepository;
    orderRepository: IOrderRepository;
    userRepository: IUserRepository;
    authRepository: IAuthRepository;
}

function createApiFactory(): ApiFactory {
    if (API_MODE === 'laravel') {
        console.log('[API Factory] Using Laravel backend');
        return {
            homeRepository: new LaravelHomeRepository(),
            productRepository: new LaravelProductRepository(),
            orderRepository: new LaravelOrderRepository(),
            userRepository: new LaravelUserRepository(),
            authRepository: new LaravelAuthRepository(),
        };
    }

    console.log('[API Factory] Using WordPress backend');
    return {
        homeRepository: new WPHomeRepository(),
        productRepository: new WPProductRepository(),
        orderRepository: new WPOrderRepository(),
        userRepository: new WPUserRepository(),
        authRepository: new WPAuthRepository(),
    };
}

export const apiFactory = createApiFactory();

export const homeRepository = apiFactory.homeRepository;
export const productRepository = apiFactory.productRepository;
export const orderRepository = apiFactory.orderRepository;
export const userRepository = apiFactory.userRepository;
export const authRepository = apiFactory.authRepository;
