import mongoose from 'mongoose';

interface IProduct {
    catId: string;
    name: string;
    price: number;
}

interface ProductModelInterface extends mongoose.Model<ProductDocument> {
    build(attr: IProduct): ProductDocument;
}

type ProductDocument = mongoose.Document & IProduct;

const productSchema = new mongoose.Schema({
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

productSchema.statics.build = (attr: IProduct) => new Product(attr);

const Product = mongoose.model<ProductDocument, ProductModelInterface>('Products', productSchema);

export { Product, IProduct };
