/**
 * Global Error Handling Middleware.
 * Express nhận diện đây là error middleware khi có đúng 4 tham số (err, req, res, next).
 * Phải được đăng ký CUỐI CÙNG trong app.js / index.js.
 */
const errorMiddleware = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);

    // Lỗi duplicate entry từ MySQL (email đã tồn tại, v.v.)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Dữ liệu đã tồn tại (duplicate entry).',
        });
    }

    // Lỗi foreign key constraint
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu tham chiếu không tồn tại.',
        });
    }

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi máy chủ nội bộ.',
    });
};

module.exports = errorMiddleware;
