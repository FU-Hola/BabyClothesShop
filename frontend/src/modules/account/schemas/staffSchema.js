import { z } from 'zod';

const phoneSchema = z
    .string()
    .trim()
    .refine(
        (value) => !value || /^(?:0|\+84)\d{9}$/.test(value.replace(/[\s.-]/g, '')),
        'Số điện thoại không hợp lệ'
    );

const staffSchema = (isEditing) => z.object({
    fullName: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.string().trim().email('Email không hợp lệ'),
    phone: phoneSchema,
    employeeCode: z.string().trim().min(1, 'Vui lòng nhập mã nhân viên'),
    position: z.string().trim().min(1, 'Vui lòng nhập chức danh'),
    ...(!isEditing && {
        password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    }),
});

export default staffSchema;
