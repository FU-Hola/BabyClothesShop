import { z } from 'zod';

const registerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập họ và tên')
            .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
        email: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập địa chỉ email')
            .email('Email không hợp lệ (ví dụ: ten@gmail.com)'),
        password: z
            .string()
            .min(1, 'Vui lòng nhập mật khẩu')
            .min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
    })
    .refine(
        ({ password, confirmPassword }) =>
            !confirmPassword || password === confirmPassword,
        {
            message: 'Mật khẩu xác nhận không khớp',
            path: ['confirmPassword'],
        },
    );

export default registerSchema;
