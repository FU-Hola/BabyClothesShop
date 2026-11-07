export const ROLE_HOME_PATHS = {
    ADMIN: '/admin',
    STORE_STAFF: '/store-staff',
    WAREHOUSE_STAFF: '/warehouse-staff',
    CUSTOMER: '/',
};

export const getRoleHomePath = (role) => ROLE_HOME_PATHS[role] || '/';
