const bcrypt = require('bcrypt');
const db = require('./config/db');

async function addAdmin() {
    try {
        const email = 'admin@hh3d.com';
        const password = 'Admin@123';
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if email exists
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            console.log('✅ Admin account đã tồn tại');
            process.exit(0);
        }
        
        // Insert admin user
        const [result] = await db.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            ['admin', email, hashedPassword, 'admin']
        );
        
        console.log('✅ Admin account tạo thành công!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

addAdmin();
