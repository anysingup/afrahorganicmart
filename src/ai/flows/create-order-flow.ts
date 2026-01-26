'use server';
/**
 * @fileOverview A flow to handle creating an order and saving it.
 *
 * - createOrder - A function that handles the order creation process.
 * - CreateOrderInput - The input type for the createOrder function.
 * - CreateOrderOutput - The return type for the createOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This is the schema for the data we expect from the frontend form.
const CreateOrderInputSchema = z.object({
  productName: z.string().describe('The name of the product being ordered.'),
  quantity: z.number().describe('The quantity of the product being ordered.'),
  totalPrice: z.number().describe('The total price of the order.'),
  customerName: z.string().describe("The customer's full name."),
  address: z.string().describe("The customer's delivery address."),
  phone: z.string().describe("The customer's phone number."),
  paymentMethod: z.string().describe('The selected payment method.'),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// This is the schema for the data we'll return to the frontend.
const CreateOrderOutputSchema = z.object({
  success: z.boolean().describe('Whether the order was created successfully.'),
  message: z.string().describe('A message to show to the user.'),
  orderId: z.string().optional().describe('The ID of the created order.'),
});
export type CreateOrderOutput = z.infer<typeof CreateOrderOutputSchema>;


const createOrderFlow = ai.defineFlow(
  {
    name: 'createOrderFlow',
    inputSchema: CreateOrderInputSchema,
    outputSchema: CreateOrderOutputSchema,
  },
  async (input) => {
    console.log('Received order:', JSON.stringify(input, null, 2));

    // This flow now only simulates a process. The actual database write
    // is handled on the client-side to comply with security rules.
    return {
      success: true,
      message: "We have received your order and will contact you shortly to confirm.",
      orderId: `sim_order_${new Date().getTime()}`,
    };
  }
);

// This is the main function the frontend can call.
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderOutput> {
  return createOrderFlow(input);
}
