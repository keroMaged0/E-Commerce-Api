import cartModel from "../../../../DB/models/cart.model.js"
import { appError } from "../../../utils/app.Error.js"
import { checkProduct } from "./checkProductDb.js"

//=================================== add user cart in db ===================================//
/*
    * create obj
    * create cart in db
*/
export const addUserCart = async (userId,quantity, product, productId) => {
    // create obj
    const cartObj = {
        userId,
        products: [{
            productId,
            quantity,
            basePrice: product.appliedPrice,
            title: product.title,
            finalPrice: product.appliedPrice * quantity
        }],
        subTotal: product.appliedPrice * quantity
    }
    // create cart in db
    const newCart = await cartModel.create(cartObj)

    return newCart
}