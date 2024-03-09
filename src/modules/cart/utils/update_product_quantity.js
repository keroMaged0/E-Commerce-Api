import cartModel from "../../../../DB/models/cart.model.js"
import { calcSubTotal } from "./calc_subTotal.js"
import { checkProductInCart } from "./check_product_in_cart.js"

//=================================== update user cart in db ===================================//
/*
    * check product found in cart
    * if !not found product cart return null
    * if found product update product
    * to calculate subTotal
*/
export const updateUserCart = async (userCart, productId, quantity) => {
    // check product found in cart
    let isProductCart = await checkProductInCart(userCart, productId)
    // if !not found product cart return null
    if (!isProductCart) return null

    // update product
    userCart?.products.forEach((product) => {
        if (product.productId.toString() === productId) {
            product.quantity = quantity
            product.finalPrice = product.basePrice * quantity
        }
    })

    // to Calculates subTotal
    userCart.subTotal = await calcSubTotal(userCart.products)
    return await userCart.save()

}