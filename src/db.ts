import mongoose from 'mongoose';

const connect = () => {
    const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.CLUSTER}/shopAPI?retryWrites=true&w=majority`;
    return new Promise((resolve, reject) => {
        mongoose
            .connect(uri, {
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then((res) => {
                console.log('database connected !');
                resolve(res);
            })
            .catch((err) => reject(err));
    });
};

const close = () => {
    return mongoose.disconnect();
};

export default { connect, close };
