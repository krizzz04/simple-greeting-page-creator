import mongoose from "mongoose";

const bannerList2Schema = new mongoose.Schema({
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
    }
},{
    timestamps : true
})


const BannerList2Model = mongoose.model('bannerList2',bannerList2Schema)

export default BannerList2Model