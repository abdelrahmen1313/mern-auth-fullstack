import { connect } from "mongoose";

export async function connectDb() {

    const uri = process.env.muri
    if (!uri) {
        console.log("MDB URI NOT FOUND!")
        process.exit(1)
    }
    connect(uri)
        .then(() => console.log("Db connected"))
        .catch((err) => {
            console.log("Error connecting to db", err)
            process.exit(1)
        })
}