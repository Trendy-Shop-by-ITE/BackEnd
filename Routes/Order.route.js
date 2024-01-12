const orderController = require('../controller/Order.controller')
const {userGuard} = require('../middleware/auth.middleware')

const order = (app) =>{
    app.get('/api/order/initiate',userGuard, orderController.checkOutCart)
}

module.exports = order