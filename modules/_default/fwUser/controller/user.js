module.exports = app => {
    const schema = app.database.mongoDB.Schema({
        uid: String,
        gender: { type: String, enum: ['Male', 'Female', 'Unknow'], default: 'Male' },
        pinCode: String,
    });

    const model = app.database.mongoDB.model('user_info', schema);

    app.model.user = {
        create: async (data) => {
            const checkUser = await app.model.user.get({ uid: data.uid });
            if (!checkUser) {
                const newData = await model.create(data);
                await newData.save();
                return { user: newData };
            }
        },

        get: async (condition) => {
            if (typeof condition == 'string') {
                return await model.findById(condition).select().exec();
            } else {
                return await model.findOne(condition).select().exec();
            }
        },
    };
};