import mongoose from "mongoose";

const bannerV1Schema = new mongoose.Schema({
    bannerTitle : {
        type : String,
        default : '',
        required:true
    },
    images:[
        {
            type:String,
        }
    ],
    catId : {
        type : String,
        default : '',
    },
    subCatId : {
        type : String,
        default : '',
    },
    thirdsubCatId : {
        type : String,
        default : '',
    },
    price : {
        type : Number,
        default : '',
        required:true
    },
    alignInfo : {
        type : String,
        default : '',
        required:true
    },
},{
    timestamps : true
})


const BannerV1Model = mongoose.model('bannerV1',bannerV1Schema)

export default BannerV1Model