/**
 * External Modules
 */

require('dotenv').config();
import app from './app';
import db from './db';

/**
 * App variables
 */

const PORT: number = parseInt(process.env.PORT as string, 10) || 7000;

/**
 * Server start
 */

db.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});
