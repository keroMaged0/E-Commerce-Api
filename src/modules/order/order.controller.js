import orderModel from "../../../DB/models/order.model.js";
import coupon_userModel from "../../../DB/models/coupon_user.model.js";
import productModel from "../../../DB/models/product.model.js";

import { applyCouponValidation } from "../../utils/coupon-validation.js";
import { checkProduct } from "../cart/utils/checkProductDb.js";
import { getUserCart } from "../cart/utils/getUserCart.js";

import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";

import { DateTime } from "luxon";
import { confirmPaymentIntent, createCheckoutSession, createPaymentIntent, createStripeCoupon, refundPaymentIntent } from "../../payment_handler/stripe_payment.js";

//============================== Create order controller ==============================//
/* 
    * destruct required data
    * coupon check  
    * check product
    * create order item
    * price
    * if send coupon
    * check older status and update
    * create order object
    * create order in db
    * update product stock
*/
const createOrder = catchError(
    async (req, res, next) => {

        // destruct required data
        const { _id } = req.user
        const { product, quantity, couponCode, shippingAddress, phoneNumbers, paymentMethod } = req.body

        let coupon = null;

        // coupon check
        if (couponCode) {
            const isCouponValid = await applyCouponValidation(couponCode, _id)
            if (isCouponValid.cause) return next({ success: isCouponValid.success, message: isCouponValid.message, cause: isCouponValid.status });
            coupon = isCouponValid
        }

        // check product
        const isProduct = await checkProduct(product, quantity)
        if (!isProduct) return next(new appError('Product not found', 400));

        // create order item
        let orderItems = [{
            title: isProduct.title,
            quantity,
            price: isProduct.appliedPrice,
            product
        }]

        // price
        let shippingPrice = orderItems[0].price * quantity
        let totalPrice = shippingPrice

        // if send coupon
        if (coupon?.isFixed && coupon.couponAmount <= shippingPrice) return next(new appError(' coupon not valid', 400));

        if (coupon?.isFixed) {
            totalPrice = shippingPrice - coupon.couponAmount
        } else if (coupon?.isPercentage) {
            totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount / 100)
        }

        // check older status and update
        let orderStatus;
        if (paymentMethod === 'cash') orderStatus = 'Placed';

        // create order object
        const order = new orderModel({
            user: _id,
            orderItems,
            shippingAddress,
            phoneNumbers,
            shippingPrice,
            couponCode: coupon?._id,
            totalPrice,
            orderStatus,
            paymentMethod,
        })

        // create order in db
        await order.save()

        // update product stock
        isProduct.stock -= quantity;
        await isProduct.save()

        // if send coupon code update maxUsed 
        if (coupon) {
            await coupon_userModel.updateOne(
                { couponId: coupon._id, userId: _id },
                { $inc: { maxUsage: 1 } }
            )
        }

        res.status(201).json({ success: true, message: 'successfully', data: order })

    }
)

//============================== convert cart to order controller ==============================//
/*
    * destruct require data
    * check cart
    * coupon check
    * create order item
    * price
    * if send coupon
    * check order status and update
    * create order obj
    * create order in db
    * update product 
    * update maxUsed
*/
const convertCartToOrder = catchError(
    async (req, res, next) => {

        // destruct required data
        const { _id } = req.user
        const { couponCode, shippingAddress, phoneNumbers, paymentMethod } = req.body

        // check cart  
        const userCart = await getUserCart(_id)
        if (!userCart) return next(new appError('Cart not found', 400));

        let coupon = null;
        // coupon check
        if (couponCode) {
            const isCouponValid = await applyCouponValidation(couponCode, _id)
            if (isCouponValid.cause) return next({ success: isCouponValid.success, message: isCouponValid.message, cause: isCouponValid.status });
            coupon = isCouponValid
        }

        // create order item
        let orderItems = userCart.products.map(cartItem => {
            return {
                title: cartItem.title,
                quantity: cartItem.quantity,
                price: cartItem.finalPrice,
                product: cartItem.productId
            }
        })

        // price
        let shippingPrice = userCart.subTotal
        let totalPrice = shippingPrice

        // if send coupon
        if (coupon?.isFixed && coupon.couponAmount <= shippingPrice) return next(new appError(' coupon not valid', 400));

        if (coupon?.isFixed) {
            totalPrice = shippingPrice - coupon.couponAmount
        } else if (coupon?.isPercentage) {
            totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount / 100)
        }

        // check older status and update
        let orderStatus;
        if (paymentMethod === 'cash') orderStatus = 'Placed';

        // create order object
        const order = new orderModel({
            user: _id,
            orderItems,
            shippingAddress,
            phoneNumbers,
            shippingPrice,
            couponCode: coupon?._id,
            totalPrice,
            orderStatus,
            paymentMethod,
        })

        // create order in db
        await order.save()

        // update product stock
        for (const item of order.orderItems) {
            console.log(item.product);
            let productCheck = await checkProduct(item.product.toString(), item.quantity)
            if (!productCheck) return next(new appError('Product not found', 400));
            console.log(item.product.toString());
            await productModel.updateMany({ _id: { $in: item.product } }, { $inc: { stock: -item.quantity } },)
        }

        // update maxUsed coupon 
        if (coupon) {
            await coupon_userModel.updateOne({ couponId: coupon._id, userId: _id }, { $inc: { usageCount: 1 } })
        }

        res.status(201).json({ success: true, message: 'successfully', data: order })

    }
)

//============================== delivery order controller ==============================//
/* 
    * destruct required data
    * check order   
    * if not found order
*/
const orderDelivered = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.user
        const { orderId } = req.params

        // check order
        const order = await orderModel.findOneAndUpdate(
            { _id: orderId, orderStatus: { $in: ['Placed', 'paid'] } },
            {
                orderStatus: 'Delivered',
                deliveredAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
                deliveredBy: _id,
            },
            { new: true }
        )
        // if not found order
        if (!order) return next(new appError('Order not found', 400));

        res.status(201).json({ success: true, message: 'successfully', data: order })

    }
)

//============================== cancel order controller ==============================//
/* 
    * destruct required data
    * check order 
    * check time
    * canceled order
*/
const orderCanceled = catchError(
    async (req, res, next) => {
        // destruct required data
        const { _id } = req.user
        const { orderId } = req.params

        // check order
        const orderCanceled = await orderModel.findOne({
            _id: orderId,
            orderStatus: { $in: ['Placed', 'paid'] },
        })

        // order created At 
        const createdOrderAt = DateTime.fromJSDate(orderCanceled.createdAt)

        // difference between time created order time now
        const timeDifference = DateTime.now() - createdOrderAt

        // one day time
        const oneDay = 24 * 60 * 60 * 1000;

        // if time more than one day 
        if (timeDifference > oneDay) return next(new appError("It will be canceled order within one day ", 409))


        // // refund order
        // if (orderCanceled.orderStatus == 'paid') {
        // }



        // check order and replace from orderStatus: 'Canceled',
        const order = await orderModel.findOneAndUpdate(
            {
                _id: orderId, orderStatus: { $in: ['Placed', 'paid'] }
            },
            {
                orderStatus: 'Canceled',
                canceledAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
                canceledBy: _id,
            },
            { new: true }
        )

        // if not found order
        if (!orderCanceled) return next(new appError('Order not found', 400));

        res.status(201).json({ success: true, message: 'successfully', data: order })

    }
)

//============================== get All order controller ==============================//
/*
    * destruct required data
    * check order
*/
const getAllOrder = catchError(
    async (req, res, next) => {
        // check order
        const orders = await orderModel.find().populate([
            {
                path: 'user'
            }
        ])
        // if not found order
        if (!orders) return next(new appError('not found order delivery', 400));

        res.status(201).json({ success: true, message: 'successfully', data: orders })

    }
)

//============================== get specific order controller ==============================//
/*
    * destruct order id params
    * check order
    * if not found order
*/
const getSpecificOrder = catchError(
    async (req, res, next) => {
        // destruct order id params
        const { orderId } = req.params

        // check order
        const order = await orderModel.findById({ _id: orderId }).populate([
            {
                path: 'user'
            }
        ])
        // if not found order
        if (!order) return next(new appError('not found order delivery', 400));

        res.status(201).json({ success: true, message: 'successfully', data: order })

    }
)

//============================== get All delivery order controller ==============================//
/* 
    * check order   
    * if not found order
*/
const getAllOrderDelivery = catchError(
    async (req, res, next) => {
        // check order
        const allOrderDelivery = await orderModel.find(
            { orderStatus: { $in: ['Delivered'] } }
        ).populate([
            {
                path: 'user'
            }
        ])
        // if not found order
        if (!allOrderDelivery) return next(new appError('not found order delivery', 400));

        res.status(201).json({ success: true, message: 'successfully', data: allOrderDelivery })

    }
)

//============================== order payment with stripe controller ==============================//
/*
    * destruct required data
    * check order
    * if not found order
    * create payment object
    * checkout session
*/
const payWithStripe = catchError(
    async (req, res, next) => {
        // destruct order id params
        const { orderId } = req.params
        const { _id: user } = req.user

        // check order
        const order = await orderModel.findOne({ _id: orderId, user, orderStatus: 'Pending' })

        // if not found order
        if (!order) return next(new appError('not found order', 400));

        // create payment object
        const paymentObj = {
            customer_email: user.email,
            metadata: { orderId: order._id.toString() },
            discounts: [],
            line_items: order.orderItems.map(item => {
                return {
                    price_data: {
                        currency: 'EGP',
                        product_data: {
                            name: item.title
                        },
                        unit_amount: item.price * 100
                    },
                    quantity: item.quantity
                };
            })
        };

        // check if coupon
        if (order.couponCode.toString()) {
            const stripeCoupon = await createStripeCoupon({ couponId: order.couponCode.toString() })
            if (stripeCoupon.status) return next(new appError(stripeCoupon.message, 400));

            paymentObj.discounts.push({
                coupon: stripeCoupon.id
            })
        }

        // Checkout sessions
        const checkoutSession = await createCheckoutSession(paymentObj);

        // Check Payment Intent
        const paymentIntent = await createPaymentIntent({ amount: order.totalPrice, currency: 'EGP' });

        order.payment_intent = paymentIntent.id;
        await order.save();

        res.json({ success: true, message: 'successfully', data: checkoutSession, paymentIntent: paymentIntent })
    }
)

//============================== order payment with stripe controller ==============================//
/*
    * destruct required data
    * check order
    * if not found order
    * create payment object
    * checkout session
*/
const stripeWebhook = catchError(
    async (req, res, next) => {
        // destruct order id params

        let orderId = req.body.data.object.metadata.orderId

        let confirmOrder = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            {
                orderStatus: 'Paid',
                paidAt: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
                isPaid: true
            },
            {
                new: true
            }
        )

        // confirm payment intent
        const confirmPaymentIntents = await confirmPaymentIntent({ paymentIntentId: confirmOrder.payment_intent })

        res.json({ success: true, message: 'webhook successfully', confirmOrder })
    }
)

//============================== order payment with stripe controller ==============================//
/*
    * destruct required data
    * check order
    * if not found order
    * create payment object
    * checkout session
*/
const refundOrder = catchError(
    async (req, res, next) => {

        // destruct required data
        const { _id } = req.user
        const { orderId } = req.params

        // check order
        const findOrder = await orderModel.findOne({
            _id: orderId,
            user: _id,
            orderStatus: 'Paid',
        })
        // console.log('found order' , findOrder);
        if (!findOrder) return next(new appError('order not found', 404))

        // refund order
        const refund = await refundPaymentIntent({ paymentIntentId: findOrder.payment_intent })
        if (refund.status !== 'succeeded') return next(new appError('refund not success', 404))

        findOrder.orderStatus = 'refunded'

        res.json({ success: true, message: 'refund successfully', refund })
    }
)


export {
    createOrder,
    convertCartToOrder,
    orderDelivered,
    getAllOrder,
    getSpecificOrder,
    getAllOrderDelivery,
    orderCanceled,
    payWithStripe,
    stripeWebhook,
    refundOrder
}