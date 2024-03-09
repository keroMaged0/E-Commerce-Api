import cartModel from "../../../../DB/models/cart.model.js"

//=================================== check product in cart ===================================//
/*
    * check if cart found in cart

    
*/
export const checkProductInCart = async (userCart, productId) => {
    // check product found in cart
    // some return true or false
    return userCart.products.some(
        (product) => product.productId.toString() === productId
    )

}