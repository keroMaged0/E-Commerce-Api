

//=================================== calc subTotal cart in db ===================================//
/*
    * update subTotal
*/
export const calcSubTotal = async (products) => {

    // to Calculates 
    let subTotal = 0
    for (const product of products) {
        subTotal += product.finalPrice
    }
    return subTotal
}