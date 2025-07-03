const JWT = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).send({
        message: "Auth Failed: No token provided",
        success: false 
      });
    }
    const token = authHeader.split(" ")[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          message: "Auth Failed: Invalid token",
          success: false 
        });
      } else {
        // Always set req.userId for all routes (GET, POST, etc.)
        req.userId = decode.id;

        // Optionally set req.body.userId for POST/PUT requests only if req.body exists
        if (req.body) {
          req.body.userId = decode.id;
        }
        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Auth Failed: Server error",
      success: false 
    });
  }
};
