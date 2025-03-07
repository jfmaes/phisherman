// hostGuardMiddleware.js
function hostGuard(req, res, next) {
  // Example: if not running locally, block writes
  if (process.env.ENV !== 'local') {
    return res.status(405).send('Not supported in hosted mode');
  }
  next();
}

module.exports = { hostGuard };
