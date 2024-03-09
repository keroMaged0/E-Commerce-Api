import Stripe from 'stripe';
import couponModel from '../../DB/models/coupon.model.js';
import { appError } from '../utils/app.Error.js';

// create a stripe session
export const createCheckoutSession = async (
    {
        customer_email,
        metadata,
        line_items,
        discounts
    }
) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        line_items,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        discounts
    });
    return session;
}

// create a stripe coupon
export const createStripeCoupon = async (couponId) => {
    // check if coupon
    const coupon = await couponModel.findById({ _id: couponId.couponId });

    if (!coupon) return next(new appError('coupon not found', 404));

    let couponObj = {}

    if (coupon.isFixed) {
        couponObj = {
            name: coupon.couponCode,
            amount_off: coupon.couponAmount * 100,
            currency: 'EGP'
        }
    }
    if (coupon.isPercentage) {
        couponObj = {
            name: coupon.couponCode,
            percent_off: coupon.couponAmount,
        }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const stripeCoupon = await stripe.coupons.create(couponObj);

    return stripeCoupon;
}

// create payment method
export const createPaymentMethod = async ({ token }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            token
        },
    });
    return paymentMethod;
}

// create Stripe paymentIntent
export const createPaymentIntent = async ({ amount, currency }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentMethod = await createPaymentMethod({ token: 'tok_visa' })

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
        },
        payment_method: paymentMethod.id
    })

    return paymentIntent;
}

// retrieve Stripe paymentIntent
export const retrievePaymentIntent = async ({ paymentIntentId }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
}

// confirm Stripe paymentIntent
export const confirmPaymentIntent = async ({ paymentIntentId }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentDetails = await retrievePaymentIntent({ paymentIntentId })

    const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
            payment_method: paymentDetails.payment_method,
        }
    );

    return paymentIntent;
}

// refund payment intent
export const refundPaymentIntent = async ({ paymentIntentId }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
    })
    return refund
}