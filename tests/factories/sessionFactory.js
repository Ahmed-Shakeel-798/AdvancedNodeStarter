const Buffer = require("safe-buffer").Buffer;
const Keygrip = require("keygrip");
const { cookieKey } = require("../../config/keys");
const keygrip = new Keygrip([cookieKey]);

module.exports = (user) => {
  // First we create a sessionString from sessionObject
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  // Now generate signature for the sessionString
  const sig = keygrip.sign("session=" + session);

  return {
    session,
    sig,
  };
};
