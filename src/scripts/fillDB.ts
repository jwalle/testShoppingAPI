import db from '../db';
import { Product } from '../models/product';
import products from './products';

const fillDb = async () => {
    await db.connect();
    await Product.insertMany(products)
        .then((res) => console.log('Products inserted : ', res))
        .catch((err) => console.log(err));
    db.close();
    process.exit();
};

fillDb();
