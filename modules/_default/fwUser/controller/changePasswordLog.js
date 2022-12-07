module.exports = (app) => {
    const schema = app.database.mongoDB.Schema({
        uid: String,
        success: Boolean,
        time: Number,
    });

    const model = app.database.mongoDB.model('change_pass_log', schema);

    app.model.changePassLog = {
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

        getAll: async (condition) => {
            return await model.find(condition || {}).sort({ time: -1 }).exec();
        },
    };

};