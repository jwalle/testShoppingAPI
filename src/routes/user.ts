import express, { Request, Response } from 'express';
import { Cart, ICarts, IProducts } from '../models/carts';
import { Product } from '../models/product';

const router = express.Router();

// @route POST api/userEnter
// @desc create a Cart when user enter
// @access Private
router.post('/api/userEnter', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const userActive = await Cart.findOne({ status: 'active' });

        if (userActive) throw Error('Customer already shopping');

        const newCart = Cart.build({
            userId,
            status: 'active',
            actions: [{ action: 'USER_ENTER' }],
            products: [],
        });

        const savedCart = await newCart.save();
        if (!savedCart) throw Error('Something went wrong during cart creation');

        res.status(200).json({ cartId: savedCart._id });
    } catch (e) {
        console.log(e);
        res.status(400).send({ msg: e });
    }
});

// @route POST api/userAction
// @desc update the cart from user action
// @access Private
router.post('/api/userAction', async (req: Request, res: Response) => {
    try {
        const { cartId, catId, action } = req.body;
        let error: string | undefined;

        if (action === 'USER_PUT_BACK') {
            const productInCart = await Cart.findOne({ _id: cartId, 'products.catId': catId });
            if (!productInCart) {
                error = 'Product was not in cart';
            }
        }

        const newCart = await Cart.updateOne(
            { _id: cartId },
            {
                $push: {
                    actions: {
                        catId,
                        action,
                        error,
                    },
                },
            },
        );

        if (!newCart || !newCart.nModified) throw Error('Something went wrong during cart action update');

        if (error) throw Error(error);

        const alreadyInCart = await Cart.findOne({ _id: cartId, 'products.catId': catId });

        if (!alreadyInCart) {
            const productAdded = await Product.findOne({ catId });
            if (!productAdded) throw Error('Product does not exist');

            const updateCart = await Cart.updateOne(
                { _id: cartId },
                {
                    $push: {
                        products: {
                            qty: 1,
                            catId,
                            price: productAdded.price,
                            name: productAdded.name,
                        },
                    },
                },
            );
            if (!updateCart || !newCart.nModified)
                throw Error('Something went wrong while adding a product to the cart');
            res.status(200).end();
        } else {
            const updateCart = await Cart.updateOne(
                { _id: cartId, 'products.catId': catId },
                { $inc: { 'products.$.qty': action === 'USER_TAKE' ? 1 : -1 } },
            );
            if (!updateCart || !newCart.nModified) throw Error('Something went wrong while updating a cart product');
            res.status(200).end();
        }
    } catch (e) {
        res.status(400).send({ msg: e.message });
    }
});

// @route POST api/userLeave
// @desc handle user leaving
// @access Private
router.post('/api/userLeave', async (req: Request, res: Response) => {
    try {
        const { cartId } = req.body;
        let error;

        const unlockShop = async () => {
            const unlockedShop = await Cart.updateOne({ _id: cartId }, { status: 'done' });
            if (!unlockedShop) throw Error(`Can't unlock the shop`);
        };

        const activeCart = await Cart.findOne({ _id: cartId, status: 'active' });
        if (!activeCart) throw Error('no active cart corresponding');

        const totalProducts = +activeCart.products.map((product) => product.qty);
        if (!activeCart.products || totalProducts === 0) {
            unlockShop();
            return res.status(200).send('exit without purchase');
        }

        const updatedCart = await Cart.updateOne(
            { _id: cartId },
            {
                $push: {
                    actions: {
                        action: 'USER_LEAVE',
                        error,
                    },
                },
            },
        );
        if (!updatedCart || !updatedCart.nModified) throw Error('Something went wrong while closing the cart');

        sendBill(activeCart);
        unlockShop();
        res.status(200).end('thank you for your purchase !');
    } catch (e) {
        res.status(400).send({ msg: e.message });
    }
});

const sendBill = (cart: ICarts) => {
    let totalPrice = 0;
    console.log('qty     price             products');
    cart.products
        .filter((product: IProducts) => product.qty !== 0)
        .forEach((p: IProducts) => {
            totalPrice += p.qty * p.price;
            console.log(`%i        %f             %s`, p.qty, p.price, p.name);
        });
    console.log('\n%f € bill send to %s.', totalPrice.toFixed(2), cart.userId);
};

export { router as userRouter };
