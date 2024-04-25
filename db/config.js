require('dotenv').config();
module.exports = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    getUrl: function() {
        console.log(this.user,this.password,this.dbName);
        console.log(`mongodb+srv://${this.user}:${this.password}@schedules.nxuidm2.mongodb.net/${this.dbName}?retryWrites=true&w=majority&appName=Schedules`)
        return `mongodb+srv://${this.user}:${this.password}@schedules.nxuidm2.mongodb.net/${this.dbName}?retryWrites=true&w=majority&appName=Schedules`
    }
}