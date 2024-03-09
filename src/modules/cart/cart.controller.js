
import { catchError } from "../../middleware/global-response.middleware.js";
import { appError } from "../../utils/app.Error.js";


import cartModel from "../../../DB/models/cart.model.js";
import { checkProduct } from "./utils/checkProductDb.js";
import { getUserCart } from "./utils/getUserCart.js";
import { addUserCart } from "./utils/addUserCart.js";
import { checkProductInCart } from "./utils/check_product_in_cart.js";
import { updateUserCart } from "./utils/update_product_quantity.js";
import { addProductToCart } from "./utils/add_product_cart.js";
import { calcSubTotal } from "./utils/calc_subTotal.js";


//=================================== Add product to cart===================================//
/*
    * destruct required data
    * check if product found 
    * check if logged user 
    * if !not cart
    * if found product exit 

*/
const addToCart = catchError(
    async (req, res, next) => {
        // destruct required data
        const { productId, quantity } = req.body
        const { _id } = req.user

        // check product found
        const product = await checkProduct(productId, quantity)
        if (!product) return next(new appError('product is not available', 400))

        // check if logged user
        const userCart = await getUserCart(_id)
        if (!userCart) {
            const newCart = await addUserCart(_id, quantity, product, productId)
            res.json({ success: true, message: "cart created successfully", data: newCart })
        }

        // if found product exit 
        const isUpdatedProduct = await updateUserCart(userCart, productId, quantity)

        if (!isUpdatedProduct) {
            const addProduct = await addProductToCart(userCart, product, quantity)
            if (!addProduct) return next(new appError('!not add product in cart', 400))
        }

        res.json({ success: true, message: "successfully", data: userCart })
    }
)

//=================================== remove product from cart ===================================//
/*
    * destruct required data
    * check cart exist 
    * delete product
    * to Calculates subTotal
    * remove cart if empty
    
*/
const removeFromCart = catchError(
    async (req, res, next) => {
        // destruct required data
        const { productId } = req.params
        const { _id } = req.user

        // check cart exist 
        const userCart = await cartModel.findOne({ userId: _id, 'products.productId': productId })
        if (!userCart) return next(new appError('!not found cart this user', 401))

        // delete product 
        userCart.products = userCart.products.filter(product => product.productId.toString() !== productId)

        // to Calculates subTotal
        userCart.subTotal = await calcSubTotal(userCart.products)

        const newCart = await userCart.save()

        // if cart empty 
        if (newCart.products.length === 0) {
            await cartModel.findByIdAndDelete(newCart._id)
        }

        res.json({ success: true, message: "successfully", data: newCart })

    }
)




export {
    addToCart,
    removeFromCart
}



