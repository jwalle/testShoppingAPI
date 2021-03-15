/**
 * External Modules
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { userRouter } from './routes/user';
import { debugRouter } from './routes/debug';

/**
 * App variables
 */

const app = express();

/**
 * App config
 */

app.use(helmet());
app.use(cors());
app.use(express.urlencoded());
app.use(userRouter);
app.use(debugRouter);

export default app;
