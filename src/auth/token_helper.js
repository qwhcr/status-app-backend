const jwt = require('jsonwebtoken')
const fs = require('fs')
const secret = fs.readFileSync('./secrets/token_secret')

exports.sign = async (payload) => {
  return new Promise((rs, rj) => {
    jwt.sign(payload, secret, (err, token) => {
      if (err) {
        rj(err);
      }
      rs(token)
    })
  });
}

exports.verify = async (token) => {
  return new Promise((rs, rj) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        rj(err);
      }
      rs(decoded);
    })
  });
}




