import fetch from 'node-fetch';
const { URLSearchParams } = require('url');
import products from './products';

const testShopJourney = async (userId: string) => {
    /**
     * Enter Shop
     */

    const enterParams = new URLSearchParams();
    enterParams.append('userId', userId);

    const res = await fetch('http://localhost:7000/api/userEnter', {
        method: 'POST',
        body: enterParams,
    });

    if (!res || res.status === 400) return console.log('error making cart');

    const resJSON = await res.json();

    const cartId = resJSON.cartId;

    /**
     * Interact in the shop
     */

    let interactions = Math.floor(Math.random() * 25); // returns a random integer from 0 to 24

    while (interactions--) {
        var product = products[Math.floor(Math.random() * products.length)]; // return a random product
        var actionParams = new URLSearchParams();
        actionParams.append('cartId', cartId);
        actionParams.append('catId', product.catId);
        actionParams.append('action', Math.random() > 0.1 ? 'USER_TAKE' : 'USER_PUT_BACK'); // give 10% chance for a 'put back on shelf' action

        let makeAction = await fetch('http://localhost:7000/api/userAction', {
            method: 'POST',
            body: actionParams,
        });
        if (!makeAction) {
            return console.log('error adding a product');
        }

        console.log('added %s', product.name);
    }

    /**
     * Leave the shop
     */

    const leaveParams = new URLSearchParams();
    leaveParams.append('cartId', cartId);

    const leaveResponse = await fetch('http://localhost:7000/api/userLeave', {
        method: 'POST',
        body: leaveParams,
    });

    if (!leaveResponse || leaveResponse.status === 400) {
        return console.log('error leaving the shop');
    }

    console.log(' Thanks !');

    /**
     *   print output
     */

    const debugResponse = await fetch('http://localhost:7000/api/cartDebug/' + cartId);
    const debug = await debugResponse.json();

    debug.actions ? printActions(debug.actions) : console.log('ERROR, no debug actions received for cartId: ', cartId);
};

const printActions = (actions: any[]) => {
    const BgGreen = '\x1b[42m';
    const BgWhite = '\x1b[47m';
    const BgYellow = '\x1b[43m';
    const BgRed = '\x1b[41m';
    const FgBlack = '\x1b[30m';
    const reset = '\x1b[0m';
    console.log('-------------------------------');
    console.log('-----     USER ACTIONS    -----');
    console.log('-------------------------------');
    actions.forEach((a) => {
        a.action === 'USER_ENTER' && process.stdout.write(BgWhite);
        a.action === 'USER_TAKE' && process.stdout.write(BgGreen);
        a.action === 'USER_PUT_BACK' && process.stdout.write(BgYellow);
        a.action === 'USER_LEAVE' && process.stdout.write(BgWhite);
        a.error && process.stdout.write(BgRed);
        !a.error && process.stdout.write(FgBlack);
        console.log('action id: ', a._id);
        console.log('action: %s | product: %s' + reset, a.action, a.catId);
        a.error && console.log(BgRed + 'error: %s' + reset, a.error);
        console.log('-------------------------------');
    });
};

testShopJourney('jwalle');
