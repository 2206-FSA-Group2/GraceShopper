module.exports = {
    ...require('./address'), // adds key/values from address.js
    ...require('./cart_items'), // adds key/values from cart_items.js
    ...require('./carts'), // etc
    ...require('./orders'), // etc
    ...require('./products'),
    ...require('./reviews'),
    ...require('./users'),
    ...require('./wishlist_items'),
  }