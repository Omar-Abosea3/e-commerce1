
const systemRoles = {
    USER : 'User',
    ADMIN : 'Admin',
    SUPER_ADMIN: 'SuperAdmin'
};

export const roleSecurity = {
    veryPrivate:[systemRoles.SUPER_ADMIN],
    private:[systemRoles.ADMIN , systemRoles.SUPER_ADMIN],
    available:[systemRoles.ADMIN , systemRoles.SUPER_ADMIN , systemRoles.USER]
}

export default systemRoles;