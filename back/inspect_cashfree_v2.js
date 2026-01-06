const { Cashfree } = require('cashfree-pg');

console.log("Analyzing Cashfree object...");

try {
    const props = Object.getOwnPropertyNames(Cashfree);
    console.log("Direct Properties (PG*):", props.filter(p => p.startsWith('PG')));

    // Check if it has a prototype with methods
    const proto = Object.getPrototypeOf(Cashfree);
    if (proto) {
        const protoProps = Object.getOwnPropertyNames(proto);
        console.log("Prototype Properties (PG*):", protoProps.filter(p => p.startsWith('PG')));
    }

    // Check specific guessed names
    const guesses = ['PGPay', 'PGOrderPay', 'PGOrdersPay', 'Pay', 'orderPay', 'ordersPay'];
    guesses.forEach(g => {
        if (Cashfree[g]) console.log(`Found: ${g}`);
    });

} catch (e) {
    console.error(e);
}
