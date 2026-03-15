require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

async function hashAllPasswords() {
    try {
        console.log('🔐 Bắt đầu hash password cho tất cả users...');
        
        // Lấy tất cả users
        const [users] = await db.query('SELECT id, password FROM users');
        
        let updated = 0;
        
        for (const user of users) {
            // Nếu password không phải là hash (không bắt đầu bằng $2a$, $2b$, $2x$, hoặc $2y$)
            if (!user.password.startsWith('$2')) {
                const hashed = await bcrypt.hash(user.password, 10);
                await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
                console.log(`✅ Updated user ID ${user.id}: ${user.password.substring(0, 10)}... → hashed`);
                updated++;
            } else {
                console.log(`⏭️  User ID ${user.id} đã là hashed, bỏ qua`);
            }
        }
        
        console.log(`\n✨ Hoàn thành! Đã hash ${updated} password(s)`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

hashAllPasswords();
