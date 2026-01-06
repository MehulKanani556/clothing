const { Cashfree } = require('cashfree-pg');
console.log('Cashfree keys:', Object.keys(Cashfree));
try {
    console.log('PGPay exists:', !!Cashfree.PGPay);
    console.log('PGCreateOrder exists:', !!Cashfree.PGCreateOrder);
} catch (e) {
    console.error(e);
}
