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
        }
    };

};