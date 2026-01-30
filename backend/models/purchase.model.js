import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 10,
  },
  color: {
    type: String,
    required: false,
    default: '',
  },
  city: {
    type: String, // Changed from ObjectId to String to match your frontend
    required: true,
  },
  streetAddress: {
    type: String,
    required: false,
  },
  deliveryType: {
    type: String,
    enum: ['مستعجل', 'عادي'],
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  numOfItems: {
    type: Number,
    required: false,
  },
  products: [
    {
      productId: String,
      quantity: Number,
      color: String,
      id: String,
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
}, { timestamps: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;