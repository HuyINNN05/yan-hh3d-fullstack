const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware kiểm tra quyền Admin.
 * PHẢI dùng SAU authMiddleware.
 * Chỉ cho phép user có role = 'admin' tiếp tục.
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 401, 'Chưa xác thực. Vui lòng đăng nhập.');
    }

    if (req.user.role !== 'admin') {
        return errorResponse(res, 403, 'Truy cập bị từ chối. Chỉ Admin mới có quyền thực hiện.');
    }

    next();
};

module.exports = adminMiddleware;
