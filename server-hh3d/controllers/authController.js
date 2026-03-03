const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
const register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Validate
        if (!email || !password) {
            return errorResponse(res, 400, 'Email và mật khẩu là bắt buộc');
        }
        if (password.length < 6) {
            return errorResponse(res, 400, 'Mật khẩu phải có ít nhất 6 ký tự');
        }

        // Kiểm tra email đã tồn tại chưa
        const existing = await UserModel.findByEmail(email);
        if (existing) {
            return errorResponse(res, 409, 'Email đã được sử dụng');
        }

        // Hash mật khẩu trước khi lưu vào DB
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, rounds);

        // Chỉ cho phép admin tạo role admin (mặc định là 'user')
        const userRole = role === 'admin' ? 'admin' : 'user';

        // Sinh username từ email nếu người dùng không cung cấp
        const username = req.body.username || null;
        const newId = await UserModel.create(email, hashedPassword, userRole, username);
        const newUser = await UserModel.findById(newId);

        return successResponse(res, 201, 'Đăng ký thành công', newUser);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/login
 * Đăng nhập và nhận JWT token
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 400, 'Email và mật khẩu là bắt buộc');
        }

        // Tìm user theo email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            // Trả thông báo chung để không lộ thông tin
            return errorResponse(res, 401, 'Email hoặc mật khẩu không đúng');
        }

        // So sánh mật khẩu với hash đã lưu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse(res, 401, 'Email hoặc mật khẩu không đúng');
        }

        // Tạo JWT token chứa id và role
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return successResponse(res, 200, 'Đăng nhập thành công', {
            token,
            user: {
                id:   user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại từ token
 */
const getMe = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return errorResponse(res, 404, 'Không tìm thấy người dùng');
        }
        return successResponse(res, 200, 'Lấy thông tin thành công', user);
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe };
