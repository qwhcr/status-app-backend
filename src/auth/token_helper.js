const jwt = require('jsonwebtoken')
const fs = require('fs')
const identityStore = require('./identity_store')
const secret = fs.readFileSync('./secrets/token_secret')

exports.signAuthToken = async (user_id) => {
  return new Promise((rs, rj) => {
    jwt.sign({id: user_id}, secret, (err, token) => {
      if (err) {
        rj(err);
      }
      rs(token)
    })
  });
}

var verify = async (token) => {
  return new Promise((rs, rj) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        rj(err);
      }
      rs(decoded);
    })
  });
}

exports.verifyUser = async (authToken, userID) => {
  let decodedTokenPayload;
  try {
    decodedTokenPayload = await verify(authToken);
  } catch (e) {
    return false;
  }
  if (decodedTokenPayload == null || userID !== decodedTokenPayload.id) {
    return false
  }
  return await identityStore.
    checkIDExists(decodedTokenPayload.id);
}

