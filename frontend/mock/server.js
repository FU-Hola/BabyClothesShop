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

const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const toPublicUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role || 'customer',
    status: user.status || 'active',
    createdAt: user.createdAt,
});

const getAuthenticatedUser = (req, db) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const match = token.match(/^fake-jwt-token-(.+)-\d+$/);
    if (!match) return null;

    return db.users.find((user) => String(user.id) === match[1]) || null;
};

const requireAdmin = (req, res, db) => {
    const user = getAuthenticatedUser(req, db);

    if (!user) {
        sendJson(res, 401, { message: 'Phiên đăng nhập không hợp lệ' });
        return null;
    }

    if ((user.role || 'customer') !== 'admin') {
        sendJson(res, 403, { message: 'Bạn không có quyền truy cập chức năng này' });
        return null;
    }

    if ((user.status || 'active') !== 'active') {
        sendJson(res, 403, { message: 'Tài khoản quản trị đã bị khóa' });
        return null;
    }

    return user;
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
                role: 'customer',
                status: 'active',
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
                        ...toPublicUser(newUser),
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

            if ((user.status || 'active') === 'blocked') {
                sendJson(res, 403, { message: 'Tài khoản của bạn đã bị khóa' });
                return;
            }

            const token = `fake-jwt-token-${user.id}-${Date.now()}`;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'Đăng nhập thành công!',
                    token,
                    user: {
                        ...toPublicUser(user),
                    },
                })
            );
            return;
        }

        // GET /api/auth/me
        if (req.method === 'GET' && pathname === '/api/auth/me') {
            const db = readDb();
            const user = getAuthenticatedUser(req, db);
            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Chưa đăng nhập hoặc token không hợp lệ' }));
                return;
            }

            if ((user.status || 'active') === 'blocked') {
                sendJson(res, 403, { message: 'Tài khoản của bạn đã bị khóa' });
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    user: {
                        ...toPublicUser(user),
                    },
                })
            );
            return;
        }

        // GET /api/admin/accounts
        if (req.method === 'GET' && pathname === '/api/admin/accounts') {
            const db = readDb();
            if (!requireAdmin(req, res, db)) return;

            const search = (parsedUrl.searchParams.get('search') || '').trim().toLowerCase();
            const role = parsedUrl.searchParams.get('role') || 'all';
            const status = parsedUrl.searchParams.get('status') || 'all';
            const page = Math.max(1, Number.parseInt(parsedUrl.searchParams.get('page'), 10) || 1);
            const pageSize = Math.min(
                50,
                Math.max(1, Number.parseInt(parsedUrl.searchParams.get('pageSize'), 10) || 8)
            );
            const users = db.users.map(toPublicUser);
            const filteredUsers = users
                .filter((user) => {
                    const matchesSearch =
                        !search ||
                        user.fullName.toLowerCase().includes(search) ||
                        user.email.toLowerCase().includes(search);
                    const matchesRole = role === 'all' || user.role === role;
                    const matchesStatus = status === 'all' || user.status === status;
                    return matchesSearch && matchesRole && matchesStatus;
                })
                .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
            const total = filteredUsers.length;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const currentPage = Math.min(page, totalPages);
            const startIndex = (currentPage - 1) * pageSize;

            sendJson(res, 200, {
                items: filteredUsers.slice(startIndex, startIndex + pageSize),
                pagination: { page: currentPage, pageSize, total, totalPages },
                stats: {
                    total: users.length,
                    admins: users.filter((user) => user.role === 'admin').length,
                    customers: users.filter((user) => user.role === 'customer').length,
                    active: users.filter((user) => user.status === 'active').length,
                    blocked: users.filter((user) => user.status === 'blocked').length,
                },
            });
            return;
        }

        // POST /api/admin/accounts
        if (req.method === 'POST' && pathname === '/api/admin/accounts') {
            const db = readDb();
            if (!requireAdmin(req, res, db)) return;

            const { fullName, email, password, role = 'customer', status = 'active' } = jsonBody;
            if (!fullName?.trim() || !email?.trim() || !password || password.length < 6) {
                sendJson(res, 400, { message: 'Thông tin tài khoản chưa đầy đủ hoặc không hợp lệ' });
                return;
            }
            if (!['admin', 'customer'].includes(role) || !['active', 'blocked'].includes(status)) {
                sendJson(res, 400, { message: 'Vai trò hoặc trạng thái không hợp lệ' });
                return;
            }
            if (db.users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
                sendJson(res, 409, { message: 'Email này đã được sử dụng' });
                return;
            }

            const account = {
                id: String(Date.now()),
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                status,
                createdAt: new Date().toISOString(),
            };
            db.users.push(account);
            writeDb(db);
            sendJson(res, 201, { message: 'Tạo tài khoản thành công', account: toPublicUser(account) });
            return;
        }

        const accountRouteMatch = pathname.match(/^\/api\/admin\/accounts\/([^/]+)$/);

        // PUT /api/admin/accounts/:id
        if (req.method === 'PUT' && accountRouteMatch) {
            const db = readDb();
            const currentAdmin = requireAdmin(req, res, db);
            if (!currentAdmin) return;

            const account = db.users.find((user) => String(user.id) === accountRouteMatch[1]);
            if (!account) {
                sendJson(res, 404, { message: 'Không tìm thấy tài khoản' });
                return;
            }

            const { fullName, email, password, role, status } = jsonBody;
            if (!fullName?.trim() || !email?.trim()) {
                sendJson(res, 400, { message: 'Họ tên và email không được để trống' });
                return;
            }
            if (!['admin', 'customer'].includes(role) || !['active', 'blocked'].includes(status)) {
                sendJson(res, 400, { message: 'Vai trò hoặc trạng thái không hợp lệ' });
                return;
            }
            if (password && password.length < 6) {
                sendJson(res, 400, { message: 'Mật khẩu phải có ít nhất 6 ký tự' });
                return;
            }
            if (
                db.users.some(
                    (user) =>
                        String(user.id) !== String(account.id) &&
                        user.email.toLowerCase() === email.trim().toLowerCase()
                )
            ) {
                sendJson(res, 409, { message: 'Email này đã được sử dụng' });
                return;
            }
            if (
                String(account.id) === String(currentAdmin.id) &&
                (role !== 'admin' || status !== 'active')
            ) {
                sendJson(res, 400, { message: 'Bạn không thể hạ quyền hoặc khóa tài khoản đang đăng nhập' });
                return;
            }

            account.fullName = fullName.trim();
            account.email = email.trim().toLowerCase();
            account.role = role;
            account.status = status;
            if (password) account.password = password;
            writeDb(db);
            sendJson(res, 200, { message: 'Cập nhật tài khoản thành công', account: toPublicUser(account) });
            return;
        }

        // DELETE /api/admin/accounts/:id
        if (req.method === 'DELETE' && accountRouteMatch) {
            const db = readDb();
            const currentAdmin = requireAdmin(req, res, db);
            if (!currentAdmin) return;

            const accountIndex = db.users.findIndex((user) => String(user.id) === accountRouteMatch[1]);
            if (accountIndex === -1) {
                sendJson(res, 404, { message: 'Không tìm thấy tài khoản' });
                return;
            }
            if (String(db.users[accountIndex].id) === String(currentAdmin.id)) {
                sendJson(res, 400, { message: 'Bạn không thể xóa tài khoản đang đăng nhập' });
                return;
            }

            db.users.splice(accountIndex, 1);
            writeDb(db);
            sendJson(res, 200, { message: 'Đã xóa tài khoản' });
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
