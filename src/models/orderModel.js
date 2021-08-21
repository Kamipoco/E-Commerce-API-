const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    postalCode: {
      //Mã bưu điện
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  user: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: ObjectId,
        required: true,
        ref: "Product",
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  paidAt: {
    //Thời điểm thanh toán đơn hàng
    type: Date,
  },
  itemsPrice: {
    //Tổng tiền hàng chưa tính thuê và phí ship
    type: Number,
    required: true,
    default: 0.0,
  },
  taxPrice: {
    //Giá thuế
    type: Number,
    required: true,
    default: 0.0,
  },
  shippingPrice: {
    //Phí giao hàng
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    //Tổng tiền tính cả thuế và phí ship
    type: Number,
    required: true,
    default: 0.0,
  },
  orderStatus: {
    //Trạng thái đơn hàng
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: {
    //Thời điểm admin chuyển hàng đi giao
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", orderSchema);
