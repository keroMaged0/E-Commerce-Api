import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    ADD_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER]
}