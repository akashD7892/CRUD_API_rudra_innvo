const mongoose = require('mongoose')
const mongoURI = "mongodb+srv://erakash:akashD7892@cluster0.wgdzjmo.mongodb.net/rudra_inno?retryWrites=true&w=majority"

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000
});