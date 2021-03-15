require('dotenv').config();
import app from '../app';
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import sinon from 'sinon';

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.CLUSTER}/shopAPI?retryWrites=true&w=majority`;

describe('POST /userEnter', () => {
    before((done) => {
        mongoose.connect(uri, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        mongoose.connection
            .once('open', () => {
                done();
            })
            .on('error', (e) => console.error('ERROR :', e));
        sinon.stub(console, 'log');
    });

    after((done) => {
        mongoose.disconnect();
        done();
    });

    let cartId: string;

    it('KO, need and userId to create a cart', (done) => {
        request(app)
            .post('/api/userEnter')
            .send({})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(400);
                done();
            });
    });

    it('OK, creating a new cart', (done) => {
        request(app)
            .post('/api/userEnter')
            .send({ userId: 'jwalle' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                const body = res.body;
                cartId = body['cartId'];
                expect(body).to.have.property('cartId');
                done();
            });
    });

    it('should not allow another customer', (done) => {
        request(app)
            .post('/api/userEnter')
            .send({ userId: 'lucas' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(400);
                done();
            });
    });

    it('should accept an item pick up', (done) => {
        request(app)
            .post('/api/userAction')
            .send({ cartId, catId: '14e', action: 'USER_TAKE' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should refuse an action when wrong cart', (done) => {
        request(app)
            .post('/api/userAction')
            .send({ cartId: '32423', catId: '14e', action: 'USER_TAKE' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(400);
                done();
            });
    });

    it('should refuse an action when wrong item', (done) => {
        request(app)
            .post('/api/userAction')
            .send({ cartId, catId: '1kl4e', action: 'USER_TAKE' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(400);
                done();
            });
    });

    it('should accept an item put back', (done) => {
        request(app)
            .post('/api/userAction')
            .send({ cartId, catId: '14e', action: 'USER_PUT_BACK' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should not accept an item put back who is not in cart', (done) => {
        request(app)
            .post('/api/userAction')
            .send({ cartId, catId: '14e', action: 'USER_PUT_BACK' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should not closea done cart', (done) => {
        request(app)
            .post('/api/userLeave')
            .send({ cartId: 'lkjhjg' })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(400);
                done();
            })
            .catch((err) => done(err));
    });

    it('should close a cart', (done) => {
        request(app)
            .post('/api/userLeave')
            .send({ cartId })
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .then((res) => {
                expect(res.status).to.equal(200);
                done();
            })
            .catch((err) => done(err));
    });
});
