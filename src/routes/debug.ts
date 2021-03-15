import express, { Request, Response } from 'express';
import { Cart } from '../models/carts';

const router = express.Router();

// @route GET api/cartDebug/:cartId
// @desc send a cart Data
// @access Private
router.get('/api/cartDebug/:cartId', async (req: Request, res: Response) => {
    try {
        const { cartId } = req.params;
        const newCart = await Cart.findOne({ _id: cartId });
        if (!newCart) throw new Error('no corresponding cart found');

        res.status(200).send(newCart);
    } catch (e) {
        res.status(400).send({ mag: e.message });
    }
});

export { router as debugRouter };
