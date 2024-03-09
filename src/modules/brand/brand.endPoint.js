import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    ADD_BRAND: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER]
}