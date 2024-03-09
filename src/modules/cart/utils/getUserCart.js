import cartModel from "../../../../DB/models/cart.model.js"

//=================================== get user cart in db ===================================//
/*
    * check if cart found 
    * if !not found cart return null
    * if found return cart
*/
export const getUserCart = async (_id) => {
    // check product found
    const userCart = await cartModel.findOne({ userId: _id })
    return userCart
}