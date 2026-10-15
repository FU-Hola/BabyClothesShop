import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = 3000;

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { users: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const server = http.createServer((req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        let jsonBody = {};
        if (body) {
            try {
                jsonBody = JSON.parse(body);
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'JSON không hợp lệ' }));
                return;
            }
        }

        // POST /api/auth/register
        if (req.method === 'POST' && pathname === '/api/auth/register') {
            const { fullName, email, password } = jsonBody;

            if (!fullName || !email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' }));
                return;
            }

            const db = readDb();
            const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email này đã được đăng ký tài khoản!' }));
                return;
            }

            const newUser = {
                id: String(Date.now()),
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                createdAt: new Date().toISOString(),
            };

            db.users.push(newUser);
            writeDb(db);

            const token = `fake-jwt-token-${newUser.id}-${Date.now()}`;
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'Đăng ký tài khoản thành công!',
                    token,
                    user: {
                        id: newUser.id,
                        fullName: newUser.fullName,
                        email: newUser.email,
                    },
                })
            );
            return;
        }

        // POST /api/auth/login
        if (req.method === 'POST' && pathname === '/api/auth/login') {
            const { email, password } = jsonBody;

            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Vui lòng nhập email và mật khẩu' }));
                return;
            }

            const db = readDb();
            const user = db.users.find(
                (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email hoặc mật khẩu không chính xác!' }));
                return;
            }

            const token = `fake-jwt-token-${user.id}-${Date.now()}`;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'Đăng nhập thành công!',
                    token,
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    },
                })
            );
            return;
        }

        // GET /api/auth/me
        if (req.method === 'GET' && pathname === '/api/auth/me') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Chưa đăng nhập hoặc token không hợp lệ' }));
                return;
            }

            const db = readDb();
            // Lấy user đầu tiên hoặc demo user
            const user = db.users[0];
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Không tìm thấy người dùng' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    },
                })
            );
            return;
        }

        // 404 Route
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API endpoint không tồn tại' }));
    });
});

server.listen(PORT, () => {
    console.log(`[Mock Server] Đang chạy tại http://localhost:${PORT}`);
});
