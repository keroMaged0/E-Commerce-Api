

//=================================== update user cart in db ===================================//

import { calcSubTotal } from "./calc_subTotal.js"

/*
    * check product found in cart
    * if !not found product cart return null
    * if found product update product
    * to calculate subTotal
*/
export const addProductToCart = async (userCart, product, quantity) => {

    userCart.products.push({
        productId: product._id,
        quantity,
        basePrice: product.appliedPrice,
        title: product.title,
        finalPrice: product.appliedPrice * quantity
    })

    // to Calculates subTotal
    userCart.subTotal = await calcSubTotal(userCart.products)
    return await userCart.save()
}