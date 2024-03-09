import productModel from "../../../../DB/models/product.model.js"

//=================================== check product if found in db ===================================//
/*
    * check if product found 
    * if !not found return null
    * if found return product
*/
export const checkProduct = async (productId, quantity) => {
    // check product found
    const product = await productModel.findById(productId)
    if (!product || product.stock < quantity) return null

    return product

}