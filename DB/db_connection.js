import mongoose from "mongoose"


export const db_connection = () => {
    mongoose.connect(process.env.CONNECTION_URL_HOST).then(() => {
        console.log('dbConnection done....');
    }).catch((err) => {
        console.log("error in connection ", err);
    });
}

