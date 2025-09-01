import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: [
        {
            productId: {
                type: String
            },
            productTitle: {
                type: String
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            image: {
                type: String
            },
            subTotal: {
                type: Number
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    order_status : {
        type : String,
        default : "confirm"
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    // 🚚 Delhivery Integration Fields
    delhiveryWaybill: {
        type: String,
        default: ""
    },
    delhiveryTrackingUrl: {
        type: String,
        default: ""
    },
    shippingStatus: {
        type: String,
        default: "Pending"
    },
    shippingDate: {
        type: Date
    },
    estimatedDelivery: {
        type: Date
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model('order', orderSchema)

export default OrderModel