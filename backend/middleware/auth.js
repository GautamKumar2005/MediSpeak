const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token, authorization denied' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token is not valid' 
      });
    }
    
    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Token is not valid' 
    });
  }
};

module.exports = auth;
