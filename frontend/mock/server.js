import http from 'http';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = Number(process.env.MOCK_PORT) || 3000;
const ACCOUNT_STATUSES = ['active', 'blocked'];

const readDb = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
        return { users: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const toPublicUser = (user) => {
    const publicUser = { ...user };
    delete publicUser.password;
    return publicUser;
};

const getAuthenticatedUser = (req, db) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const match = authHeader.slice(7).match(/^fake-jwt-token-(.+)-\d+$/);
    if (!match) return null;

    return db.users.find((user) => String(user.id) === match[1]) || null;
};

const requireAdmin = (req, res, db) => {
    const user = getAuthenticatedUser(req, db);

    if (!user) {
        sendJson(res, 401, { message: 'Phiên đăng nhập không hợp lệ' });
        return null;
    }
    if (user.deletedAt || user.status !== 'active') {
        sendJson(res, 403, { message: 'Tài khoản quản trị không còn hoạt động' });
        return null;
    }
    if (user.role !== 'admin') {
        sendJson(res, 403, { message: 'Bạn không có quyền truy cập chức năng này' });
        return null;
    }

    return user;
};

const normalizeNullable = (value) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized || null;
};

const normalizePhone = (value) => normalizeNullable(value)?.replace(/[\s.-]/g, '') || null;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => !phone || /^(?:0|\+84)\d{9}$/.test(phone);

const hasDuplicateEmail = (users, email, excludedId) =>
    users.some(
        (user) =>
            String(user.id) !== String(excludedId) &&
            user.email.toLowerCase() === email.toLowerCase()
    );

const getListResponse = (users, role, parsedUrl) => {
    const search = (parsedUrl.searchParams.get('search') || '').trim().toLowerCase();
    const status = parsedUrl.searchParams.get('status') || 'all';
    const page = Math.max(1, Number.parseInt(parsedUrl.searchParams.get('page'), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(parsedUrl.searchParams.get('pageSize'), 10) || 8));
    const roleUsers = users.filter((user) => user.role === role);
    const searchableFields = role === 'staff'
        ? ['fullName', 'email', 'phone', 'employeeCode', 'position']
        : ['fullName', 'email', 'phone', 'address'];

    const filteredUsers = roleUsers
        .filter((user) => {
            const matchesSearch = !search || searchableFields.some((field) =>
                String(user[field] || '').toLowerCase().includes(search)
            );
            const matchesStatus = status === 'all'
                || (status === 'deleted' && Boolean(user.deletedAt))
                || (!user.deletedAt && user.status === status);
            return matchesSearch && matchesStatus;
        })
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
    const total = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return {
        items: filteredUsers.slice(startIndex, startIndex + pageSize).map(toPublicUser),
        pagination: { page: currentPage, pageSize, total, totalPages },
        stats: {
            total: roleUsers.length,
            active: roleUsers.filter((user) => !user.deletedAt && user.status === 'active').length,
            blocked: roleUsers.filter((user) => !user.deletedAt && user.status === 'blocked').length,
            deleted: roleUsers.filter((user) => Boolean(user.deletedAt)).length,
        },
    };
};

const findAccount = (db, id, role) =>
    db.users.find((user) => String(user.id) === String(id) && user.role === role);

const updateAccountStatus = (req, res, db, account, body) => {
    if (account.deletedAt) {
        sendJson(res, 409, { message: 'Hãy khôi phục tài khoản trước khi đổi trạng thái' });
        return;
    }
    if (!ACCOUNT_STATUSES.includes(body.status)) {
        sendJson(res, 400, { message: 'Trạng thái tài khoản không hợp lệ' });
        return;
    }

    account.status = body.status;
    account.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, {
        message: body.status === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
        account: toPublicUser(account),
    });
};

const softDeleteAccount = (res, db, account) => {
    if (account.deletedAt) {
        sendJson(res, 409, { message: 'Tài khoản đã được xóa mềm trước đó' });
        return;
    }

    const now = new Date().toISOString();
    account.status = 'blocked';
    account.deletedAt = now;
    account.updatedAt = now;
    writeDb(db);
    sendJson(res, 200, { message: 'Đã xóa mềm tài khoản', account: toPublicUser(account) });
};

const restoreAccount = (res, db, account) => {
    if (!account.deletedAt) {
        sendJson(res, 409, { message: 'Tài khoản này chưa bị xóa' });
        return;
    }

    account.deletedAt = null;
    account.status = 'active';
    account.updatedAt = new Date().toISOString();
    writeDb(db);
    sendJson(res, 200, { message: 'Đã khôi phục tài khoản', account: toPublicUser(account) });
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
                sendJson(res, 400, { message: 'JSON không hợp lệ' });
                return;
            }
        }

        if (req.method === 'POST' && pathname === '/api/auth/register') {
            const { fullName, email, password } = jsonBody;
            if (!fullName?.trim() || !email?.trim() || !password || password.length < 6) {
                sendJson(res, 400, { message: 'Thông tin đăng ký chưa đầy đủ hoặc không hợp lệ' });
                return;
            }

            const db = readDb();
            const normalizedEmail = email.trim().toLowerCase();
            if (!isValidEmail(normalizedEmail)) {
                sendJson(res, 400, { message: 'Email không hợp lệ' });
                return;
            }
            if (hasDuplicateEmail(db.users, normalizedEmail)) {
                sendJson(res, 409, { message: 'Email này đã được đăng ký, vui lòng liên hệ hỗ trợ nếu cần khôi phục' });
                return;
            }

            const now = new Date().toISOString();
            const newUser = {
                id: String(Date.now()),
                fullName: fullName.trim(),
                email: normalizedEmail,
                password,
                phone: null,
                role: 'customer',
                status: 'active',
                employeeCode: null,
                position: null,
                dateOfBirth: null,
                gender: null,
                address: null,
                createdAt: now,
                updatedAt: now,
                lastLoginAt: null,
                deletedAt: null,
            };

            db.users.push(newUser);
            writeDb(db);
            const token = `fake-jwt-token-${newUser.id}-${Date.now()}`;
            sendJson(res, 201, { message: 'Đăng ký tài khoản thành công!', token, user: toPublicUser(newUser) });
            return;
        }

        if (req.method === 'POST' && pathname === '/api/auth/login') {
            const { email, password } = jsonBody;
            if (!email || !password) {
                sendJson(res, 400, { message: 'Vui lòng nhập email và mật khẩu' });
                return;
            }

            const db = readDb();
            const user = db.users.find(
                (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
            );
            if (!user) {
                sendJson(res, 401, { message: 'Email hoặc mật khẩu không chính xác!' });
                return;
            }
            if (user.deletedAt) {
                sendJson(res, 403, { message: 'Tài khoản đã bị xóa, vui lòng liên hệ hỗ trợ' });
                return;
            }
            if (user.status === 'blocked') {
                sendJson(res, 403, { message: 'Tài khoản của bạn đã bị khóa' });
                return;
            }

            user.lastLoginAt = new Date().toISOString();
            writeDb(db);
            const token = `fake-jwt-token-${user.id}-${Date.now()}`;
            sendJson(res, 200, { message: 'Đăng nhập thành công!', token, user: toPublicUser(user) });
            return;
        }

        if (req.method === 'GET' && pathname === '/api/auth/me') {
            const db = readDb();
            const user = getAuthenticatedUser(req, db);
            if (!user) {
                sendJson(res, 401, { message: 'Chưa đăng nhập hoặc token không hợp lệ' });
                return;
            }
            if (user.deletedAt || user.status !== 'active') {
                sendJson(res, 403, { message: 'Tài khoản không còn hoạt động' });
                return;
            }
            sendJson(res, 200, { user: toPublicUser(user) });
            return;
        }

        const staffListRoute = pathname === '/api/admin/staff';
        const customerListRoute = pathname === '/api/admin/customers';
        const staffRoute = pathname.match(/^\/api\/admin\/staff\/([^/]+)$/);
        const staffStatusRoute = pathname.match(/^\/api\/admin\/staff\/([^/]+)\/status$/);
        const staffRestoreRoute = pathname.match(/^\/api\/admin\/staff\/([^/]+)\/restore$/);
        const customerRoute = pathname.match(/^\/api\/admin\/customers\/([^/]+)$/);
        const customerStatusRoute = pathname.match(/^\/api\/admin\/customers\/([^/]+)\/status$/);
        const customerRestoreRoute = pathname.match(/^\/api\/admin\/customers\/([^/]+)\/restore$/);

        if (pathname.startsWith('/api/admin/')) {
            const db = readDb();
            if (!requireAdmin(req, res, db)) return;

            if (req.method === 'GET' && staffListRoute) {
                sendJson(res, 200, getListResponse(db.users, 'staff', parsedUrl));
                return;
            }
            if (req.method === 'POST' && staffListRoute) {
                const { fullName, email, phone, employeeCode, position, password } = jsonBody;
                const normalizedEmail = email?.trim().toLowerCase();
                const normalizedPhone = normalizePhone(phone);
                const normalizedCode = employeeCode?.trim().toUpperCase();

                if (!fullName?.trim() || !normalizedEmail || !normalizedCode || !position?.trim() || !password || password.length < 6) {
                    sendJson(res, 400, { message: 'Thông tin nhân viên chưa đầy đủ hoặc không hợp lệ' });
                    return;
                }
                if (!isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
                    sendJson(res, 400, { message: 'Email hoặc số điện thoại không hợp lệ' });
                    return;
                }
                if (hasDuplicateEmail(db.users, normalizedEmail)) {
                    sendJson(res, 409, { message: 'Email này đã được sử dụng' });
                    return;
                }
                if (db.users.some((user) => user.employeeCode?.toUpperCase() === normalizedCode)) {
                    sendJson(res, 409, { message: 'Mã nhân viên đã được sử dụng' });
                    return;
                }

                const now = new Date().toISOString();
                const account = {
                    id: String(Date.now()),
                    fullName: fullName.trim(),
                    email: normalizedEmail,
                    password,
                    phone: normalizedPhone,
                    role: 'staff',
                    status: 'active',
                    employeeCode: normalizedCode,
                    position: position.trim(),
                    dateOfBirth: null,
                    gender: null,
                    address: null,
                    createdAt: now,
                    updatedAt: now,
                    lastLoginAt: null,
                    deletedAt: null,
                };
                db.users.push(account);
                writeDb(db);
                sendJson(res, 201, { message: 'Tạo nhân viên thành công', account: toPublicUser(account) });
                return;
            }

            if (staffStatusRoute && req.method === 'PATCH') {
                const account = findAccount(db, staffStatusRoute[1], 'staff');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy nhân viên' });
                updateAccountStatus(req, res, db, account, jsonBody);
                return;
            }
            if (staffRestoreRoute && req.method === 'PATCH') {
                const account = findAccount(db, staffRestoreRoute[1], 'staff');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy nhân viên' });
                restoreAccount(res, db, account);
                return;
            }
            if (staffRoute && req.method === 'GET') {
                const account = findAccount(db, staffRoute[1], 'staff');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy nhân viên' });
                sendJson(res, 200, { account: toPublicUser(account) });
                return;
            }
            if (staffRoute && req.method === 'PUT') {
                const account = findAccount(db, staffRoute[1], 'staff');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy nhân viên' });
                if (account.deletedAt) return sendJson(res, 409, { message: 'Hãy khôi phục tài khoản trước khi chỉnh sửa' });
                if ('password' in jsonBody || 'role' in jsonBody || 'status' in jsonBody) {
                    return sendJson(res, 400, { message: 'Không thể sửa mật khẩu, vai trò hoặc trạng thái qua hồ sơ nhân viên' });
                }

                const { fullName, email, phone, employeeCode, position } = jsonBody;
                const normalizedEmail = email?.trim().toLowerCase();
                const normalizedPhone = normalizePhone(phone);
                const normalizedCode = employeeCode?.trim().toUpperCase();
                if (!fullName?.trim() || !normalizedEmail || !normalizedCode || !position?.trim()) {
                    sendJson(res, 400, { message: 'Thông tin nhân viên chưa đầy đủ' });
                    return;
                }
                if (!isValidEmail(normalizedEmail) || !isValidPhone(normalizedPhone)) {
                    sendJson(res, 400, { message: 'Email hoặc số điện thoại không hợp lệ' });
                    return;
                }
                if (hasDuplicateEmail(db.users, normalizedEmail, account.id)) {
                    sendJson(res, 409, { message: 'Email này đã được sử dụng' });
                    return;
                }
                if (db.users.some((user) => String(user.id) !== String(account.id) && user.employeeCode?.toUpperCase() === normalizedCode)) {
                    sendJson(res, 409, { message: 'Mã nhân viên đã được sử dụng' });
                    return;
                }

                Object.assign(account, {
                    fullName: fullName.trim(),
                    email: normalizedEmail,
                    phone: normalizedPhone,
                    employeeCode: normalizedCode,
                    position: position.trim(),
                    updatedAt: new Date().toISOString(),
                });
                writeDb(db);
                sendJson(res, 200, { message: 'Cập nhật nhân viên thành công', account: toPublicUser(account) });
                return;
            }
            if (staffRoute && req.method === 'DELETE') {
                const account = findAccount(db, staffRoute[1], 'staff');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy nhân viên' });
                softDeleteAccount(res, db, account);
                return;
            }

            if (req.method === 'GET' && customerListRoute) {
                sendJson(res, 200, getListResponse(db.users, 'customer', parsedUrl));
                return;
            }
            if (customerStatusRoute && req.method === 'PATCH') {
                const account = findAccount(db, customerStatusRoute[1], 'customer');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy khách hàng' });
                updateAccountStatus(req, res, db, account, jsonBody);
                return;
            }
            if (customerRestoreRoute && req.method === 'PATCH') {
                const account = findAccount(db, customerRestoreRoute[1], 'customer');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy khách hàng' });
                restoreAccount(res, db, account);
                return;
            }
            if (customerRoute && req.method === 'GET') {
                const account = findAccount(db, customerRoute[1], 'customer');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy khách hàng' });
                sendJson(res, 200, { account: toPublicUser(account) });
                return;
            }
            if (customerRoute && req.method === 'DELETE') {
                const account = findAccount(db, customerRoute[1], 'customer');
                if (!account) return sendJson(res, 404, { message: 'Không tìm thấy khách hàng' });
                softDeleteAccount(res, db, account);
                return;
            }

            sendJson(res, 404, { message: 'API quản trị không tồn tại' });
            return;
        }

        sendJson(res, 404, { message: 'API endpoint không tồn tại' });
    });
});

server.listen(PORT, () => {
    console.log(`[Mock Server] Đang chạy tại http://localhost:${PORT}`);
});
