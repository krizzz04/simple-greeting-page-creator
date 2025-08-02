import mongoose from "mongoose";

const logoSchema = mongoose.Schema({
    logo: {
        type: String,
        default: ""
    }
},
    { timestamps: true }
)


const LogoModel = mongoose.model("Logo",logoSchema);

export default LogoModel