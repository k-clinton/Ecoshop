import { z } from 'zod';
import { orderSchema } from './lib/schemas';

const mockPayload = {
    items: [
        {
            productId: "test-prod",
            variantId: "test-var",
            quantity: 1,
            price: 19.99,
            productName: "Test",
            productImage: "test.jpg"
        }
    ],
    subtotal: 19.99,
    shipping: 5.99,
    tax: 1.60,
    total: 27.58,
    shippingAddress: {
        name: "John Doe ",
        // email is omitted
        street: "123 Main",
        city: "Test",
        state: "TS",
        zip: "12345",
        country: "USA"
    }
};

try {
    orderSchema.parse(mockPayload);
    console.log("Validation successful");
} catch (e) {
    if (e instanceof z.ZodError) {
        console.error("Validation failed:", JSON.stringify(e.issues, null, 2));
    } else {
        console.error(e);
    }
}
