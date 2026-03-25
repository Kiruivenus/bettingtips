const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('ts-node').register();
const User = require('./src/models/User').default;

mongoose.connect('mongodb://127.0.0.1:27017/betting-tips-platform').then(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const user = await User.create({ name: 'test6', email: 'test6@test.com', password: hashedPassword, role: 'user' });
        console.log("Success:", user);
    } catch(e) {
        console.error("DB Error:", e);
    }
    mongoose.disconnect();
});
