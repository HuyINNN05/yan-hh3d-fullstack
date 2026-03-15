# 🎬 GUIA RÁPIDO - Sistema de Gerenciamento de Episódios

## ✨ O Que Foi Implementado

### 1️⃣ Campo "Tổng Số Tập" em Adicionar Phim
```
Form: Thêm phim mới
├─ Tên bộ phim *
├─ Poster/Ảnh *
├─ Mô tả
├─ Thể loại *
├─ Chất lượng (4K/FHD/HD)
├─ Trạng thái (Đang/Hoàn thành)
├─ ** TỔNG SỐ TẬP ** ← NEW! [Input: 0-999]
├─ Link Video (YouTube/GDrive)
└─ [Lưu và đăng phim]
```

### 2️⃣ Sistema Completo de Gerenciar Episódios
```
Kho Phim → Clicar 🎬 (Play) em qualquer filme
     ⬇
┌──────────────────────────────────────┐
│   EPISODE MANAGER                     │
├──────────────────────────────────────┤
│                                      │
│  FORMULÁRIO ESQUERDO:     LISTA DIR: │
│  ┌──────────────────┐    ┌─────────┐ │
│  │ + Thêm tập mới  │    │ Tập 1   │ │
│  │                  │    │ Tập 2   │ │
│  │ Ep número:  [__] │    │ Tập 3   │ │
│  │ Video URL:  [__] │    │ ...     │ │
│  │ Server:     [v]  │    │ Tập 12  │ │
│  │ [✓] Tập cuối?   │    │         │ │
│  │                  │    │ [🗑️]Xóa│ │
│  │ [Thêm tập]       │    └─────────┘ │
│  └──────────────────┘                 │
│                                       │
│  Auto-features:                       │
│  • Tập 1 tudo pré-preenchido         │
│  • Número auto-incrementa (1→2→3...) │
│  • YouTube: watch?v=ID → embed       │
│  • GDrive: file/d/ID → preview       │
│  • Mostra total: 5/12 taps           │
│                                       │
└──────────────────────────────────────┘
```

---

## 🔧 APIs Backend Adicionadas

### GET - Listar Episódios
```bash
GET /api/admin/episodes/:movieId
Authorization: Bearer <TOKEN>

✅ Retorna: Array com todos os episódios do filme
```

### POST - Criar Episódio
```bash
POST /api/admin/episodes
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "movie_id": 1,
  "episode_number": 1,
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "server_type": "Thuyết Minh",
  "is_end": false
}

✅ Resposta: {"message": "Thêm tập phim thành công!", "id": 123}
```

### PUT - Atualizar Episódio
```bash
PUT /api/admin/episodes/:id
Authorization: Bearer <TOKEN>

{ ...mesmos campos acima }

✅ Resposta: {"message": "Cập nhật tập phim thành công!"}
```

### DELETE - Remover Episódio
```bash
DELETE /api/admin/episodes/:id
Authorization: Bearer <TOKEN>

✅ Resposta: {"message": "Đã xóa tập phim!"}
```

---

## 📊 Database Changes

### Nova Coluna em `movies`
```sql
ALTER TABLE movies ADD COLUMN total_episodes INT DEFAULT 0;
```

### Estrutura de `episodes` (ja existente)
```
id              INT (PK)
movie_id        INT (FK → movies)
episode_number  INT
video_url       VARCHAR(500)
server_type     VARCHAR(50)
is_end          TINYINT(1)
```

---

## 🎯 Fluxo Completo - Passo a Passo

### Cenário: Adicionar nova série "One Piece" com 5 episódios

#### Passo 1: Criar Bộ Phim
```
1. Clique "Thêm phim mới"
2. Preencha:
   - Tên: "One Piece"
   - Ảnh: https://example.com/one-piece.jpg
   - Thể loại: Anime 4K
   - Chất lượng: 4K
   - Trạng thái: Đang tiến hành
   - ✓ TỔNG SỐ TẬP: 5  ← IMPORTANTE!
   - Link vídeo: deixar em branco ou colocar OP
3. Clique "Lưu e đăng phim"
4. ✅ Retorna: "Thêm phim thành công!" (id: 28)
```

#### Passo 2: Adicionar Episódios
```
1. Vá para "Kho phim"
2. Procure "One Piece"
3. Clique no ícone 🎬 (Play)
4. Abre EpisodeManager com film título "One Piece (0/5 taps)"

5. Adicionar Episódio 1:
   - Ep número: 1
   - Video: https://www.youtube.com/watch?v=A1
   - Server: Thuyết Minh
   - [✓] Tập cuối? NÃO
   - Clique [Thêm tập]
   - ✅ Aparece na lista à direita

6. Repeat para tập 2, 3, 4, 5
   - Sistema auto-incrementa: (2, 3, 4, ...)
   - Última tập: marcar [✓] "Tập cuối?"

7. Resultado final: 5/5 episódios adicionados! 🎉
```

---

## 🐛 Lỗi Corrigidos

### CSS Tailwind Conflict
**Antes:**
```jsx
<label className="...block flex...">  // ❌ Ambigüo
```

**Depois:**
```jsx
<label className="...flex...">        // ✅ Claro
```

**Arquivos afetados:**
- AddMovie.jsx (linha 184)
- AddEpisode.jsx (linhas 86, 104, 118, 132)

---

## 🔐 Segurança

Todas as rotas de admin requerem:
```javascript
✅ JWT Token válido (expira em 7 dias)
✅ Role = "admin"
✅ Token no header: Authorization: Bearer <TOKEN>
```

Tokens obtidos via:
```bash
POST /api/login
{
  "email": "admin@hh3d.com",
  "password": "Admin@123"
}
```

---

## 📱 Acessos

| Serviço | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Rodando |
| Backend | http://localhost:5000 | ✅ Healthy |
| Database | localhost:3307 | ✅ Healthy |
| Admin Panel | http://localhost:3000 (login) | ✅ Pronto |

---

## ⚡ Performance Tips

1. **Upload de Tapa em Lote**: Use Admin → Episódios (não UI form)
2. **Batch Conversão YouTube**: Sistema auto-convert tudo
3. **Cache**: Proxies de imagem externas em 24h
4. **Scroll**: Lista pode ter 1000+ taps (scroll automático)

---

## 📝 Notas Importantes

⚠️ **OBRIGATÓRIO!**
- Campo "Tổng số tập" DEVE ser preenchido ao criar filme
- Sem isso, não consegue gerenciar taps depois
- Recomendado: colocar número específico (12, 24, etc)

⚠️ **URLs de Video**
- YouTube: qualquer formato (watch, youtu.be, ID)
- Sistema auto-converte para embed
- GDrive: auto-detecta e usa iframe preview

⚠️ **Imagens**
- Local: `/image/file.jpg`
- Externa: `https://...` (incluindo Google Images)
- Sistema faz proxy automático

---

## 🎬 Exemplo Completo (JSON)

```json
{
  "movie": {
    "id": 28,
    "title": "One Piece",
    "image": "https://image.tmdb.org/path/to/one-piece.jpg",
    "total_episodes": 5,
    "status": "Đang tiến hành",
    "quality": "4K"
  },
  "episodes": [
    {
      "id": 101,
      "episode_number": 1,
      "video_url": "https://www.youtube.com/embed/A1",
      "server_type": "Thuyết Minh",
      "is_end": false
    },
    {
      "id": 102,
      "episode_number": 2,
      "video_url": "https://www.youtube.com/embed/A2",
      "server_type": "Thuyết Minh",
      "is_end": false
    },
    ...
    {
      "id": 105,
      "episode_number": 5,
      "video_url": "https://www.youtube.com/embed/A5",
      "server_type": "Thuyết Minh",
      "is_end": true  // ✓ Tập cuối
    }
  ]
}
```

---

## 🎓 Test API com cURL (ou Postman)

```bash
# 1. Obter token
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hh3d.com","password":"Admin@123"}'

# 2. Copiar token da resposta
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Listar episódios
curl http://localhost:5000/api/admin/episodes/28 \
  -H "Authorization: Bearer $TOKEN"

# 4. Adicionar episódio
curl -X POST http://localhost:5000/api/admin/episodes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movie_id": 28,
    "episode_number": 6,
    "video_url": "https://www.youtube.com/watch?v=A6",
    "server_type": "Lồng Tiếng",
    "is_end": false
  }'
```

---

**Pronto para usar! 🚀**
