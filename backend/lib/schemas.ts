import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    featured: z.boolean().optional(),
});

export const orderItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional().nullable(),
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().nonnegative('Price cannot be negative')
});

export const orderSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
    subtotal: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    total: z.number().nonnegative(),
    shippingAddress: z.union([
        z.string().min(1),
        z.object({
            name: z.string().min(1),
            email: z.string().email().optional(),
            street: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            zip: z.string().min(1),
            country: z.string().min(1)
        })
    ])
});

export const statusUpdateSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});
