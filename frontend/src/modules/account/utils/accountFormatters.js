export const formatAccountDate = (value) =>
    value
        ? new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(value))
        : 'Chưa có';

export const formatAccountDateTime = (value) =>
    value
        ? new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value))
        : 'Chưa có';

export const formatGender = (gender) => ({
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
}[gender] || 'Chưa cập nhật');

export const getAccountInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
