import { z } from 'zod';

const accountSchema = (isEditing) =>
    z.object({
        fullName: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập họ và tên')
            .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
        email: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập địa chỉ email')
            .email('Email không hợp lệ'),
        password: isEditing
            ? z.string().refine((value) => !value || value.length >= 6, {
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
            })
            : z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        role: z.enum(['admin', 'customer']),
        status: z.enum(['active', 'blocked']),
    });

export default accountSchema;
