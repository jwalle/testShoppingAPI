import mongoose from 'mongoose';
import { IProduct } from './product';

interface ICarts {
    userId: string;
    status: 'active' | 'done';
    actions: IAction[];
    products: IProducts[];
}

export interface IProducts extends IProduct {
    qty: number;
}

export interface IAction {
    action: 'USER_ENTER' | 'USER_TAKE' | 'USER_PUT_BACK' | 'USER_LEAVE';
    catId?: string;
    error?: string;
}

interface CartModelInterface extends mongoose.Model<CartDocument> {
    build(attr: ICarts): CartDocument;
}

type CartDocument = mongoose.Document & ICarts;

const actionSchema = new mongoose.Schema({
    action: {
        type: 'string',
        required: true,
    },
    catId: {
        type: 'string',
        required: false,
    },
    error: {
        type: 'string',
        required: false,
    },
});

const productsSchema = new mongoose.Schema({
    qty: {
        type: 'number',
        required: true,
    },
    catId: {
        type: 'string',
        required: true,
    },
    name: {
        type: 'string',
        required: true,
    },
    price: {
        type: 'number',
        required: true,
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: 'string',
        required: true,
    },
    status: {
        type: 'string',
        required: true,
    },
    actions: {
        type: [actionSchema],
        required: true,
    },
    products: {
        type: [productsSchema],
        required: false,
    },
});

cartSchema.statics.build = (attr: ICarts) => new Cart(attr);

const Cart = mongoose.model<CartDocument, CartModelInterface>('Carts', cartSchema);

export { Cart, ICarts };
