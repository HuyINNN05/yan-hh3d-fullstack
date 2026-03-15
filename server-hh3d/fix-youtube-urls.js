const db = require('./config/db');

async function fixYouTubeUrls() {
    try {
        console.log('🔧 Corrigindo YouTube URLs no database...\n');
        
        // Query para pegar todas as URLs de vídeo
        const [movies] = await db.query("SELECT id, title, video_url FROM movies WHERE video_url LIKE '%embed%'");
        
        if (movies.length === 0) {
            console.log('✅ Nenhuma URL para corrigir!');
            process.exit(0);
        }
        
        console.log(`📝 Encontrado ${movies.length} movies com video_url\n`);
        
        for (const movie of movies) {
            let newUrl = movie.video_url;
            
            // Fix: https://www.youtube.com/embed/watch?v=ID → https://www.youtube.com/embed/ID
            if (newUrl.includes('/embed/watch?v=')) {
                newUrl = newUrl.replace('/embed/watch?v=', '/embed/');
                console.log(`🎬 ${movie.title}`);
                console.log(`   ❌ Antes: ${movie.video_url}`);
                console.log(`   ✅ Depois: ${newUrl}\n`);
                
                await db.query("UPDATE movies SET video_url = ? WHERE id = ?", [newUrl, movie.id]);
            }
        }
        
        console.log('✅ Hoàn thành! Tất cả YouTube URLs đã được sửa.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

fixYouTubeUrls();
