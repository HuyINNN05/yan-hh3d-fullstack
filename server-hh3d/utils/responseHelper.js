/**
 * Trả về response thành công chuẩn
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Thông báo
 * @param {*} data - Dữ liệu trả về
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

/**
 * Trả về response lỗi chuẩn
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Thông báo lỗi
 * @param {*} errors - Chi tiết lỗi (tuỳ chọn)
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const payload = { success: false, message };
    if (errors !== null) payload.errors = errors;
    return res.status(statusCode).json(payload);
};

module.exports = { successResponse, errorResponse };
