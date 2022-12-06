module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        uid: String,
        method: { type: String, enum: ['mail_pass', 'username_pass', 'smart_card', 'pin'], default: 'username_pass' },
        time: Number,
    });

    const model = app.database.mongoDB.model('auth_log', schema);

    app.model.authLog = {
        create: async (data) => {
            const newData = await model.create(data);
            await newData.save();
            return { data: newData };
        },

        get: async (condition) => {
            if (typeof condition == 'string') {
                return await model.findById(condition).select().exec();
            } else {
                return await model.findOne(condition).select().exec();
            }
        },

        getAllDistinct: async () => {
            return await model.aggregate([
                { $sort: { 'time': -1 } },
                { $group: { _id: { method: '$method', uid: '$uid', }, doc: { $first: '$$ROOT' } } },
                { $project: { _id: 0, uid: '$doc.uid', method: '$doc.method', time: '$doc.time' } }
            ]);
            // return await model.find(condition || {}).sort({ time: 1 }).select().exec();
        },
    };

};