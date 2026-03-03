const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware xác thực JWT token.
 * Lấy token từ header Authorization: Bearer <token>
 * Gắn thông tin user vào req.user nếu token hợp lệ.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'Không có token xác thực. Vui lòng đăng nhập.');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
        return errorResponse(res, 401, 'Token không hợp lệ.');
    }
};

module.exports = authMiddleware;
