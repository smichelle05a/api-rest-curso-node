function authenticator(req, res, next) {
    console.log('Autenticando...');
    next();
}

module.exports = authenticator;