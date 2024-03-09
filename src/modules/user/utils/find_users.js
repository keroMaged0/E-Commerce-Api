import userModel from "../../../../DB/models/user.model.js"


//=============================== Find all Users ==================================//
const findAllUser = async () => {
    //  check if auth user
    let user = await userModel.find()
    console.log(user);
  
    // if !not found user
    if (!user) return null
    return user
}

//=============================== Find one User By Id  ==================================//
const findUser = async (id) => {
    //  check if auth user
    let user = await userModel.findById(id)
  
    // if !not found user
    if (!user) return null;
    return user
}

export {
    findUser,
    findAllUser
} 