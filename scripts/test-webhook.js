/**
 * Test script to verify Stripe webhook functionality
 * 
 * This script creates a test checkout session and then simulates a webhook event
 * to ensure that the webhook is properly configured and functioning.
 * 
 * Usage: node scripts/test-webhook.js
 */

require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookUrl = process.env.NEXT_PUBLIC_APP_URL + '/api/webhook/stripe';

async function main() {
  console.log('🧪 Testing Stripe webhook functionality');
  console.log('Webhook URL:', webhookUrl);
  
  try {
    // 1. Create a test checkout session
    console.log('Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });
    
    console.log('✅ Test checkout session created:', session.id);
    
    // 2. Create a test event
    console.log('Creating test event...');
    const event = {
      id: 'evt_test_webhook',
      object: 'event',
      api_version: '2023-08-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: session.id,
          object: 'checkout.session',
          client_reference_id: 'test_user_id',
          // Add other necessary fields
        },
      },
      type: 'checkout.session.completed',
      livemode: false,
    };
    
    // 3. Sign the event
    console.log('Signing test event...');
    const payload = JSON.stringify(event);
    const header = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });
    
    // 4. Send the event to the webhook endpoint
    console.log('Sending test event to webhook endpoint...');
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': header,
      },
      body: payload,
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

main(); 