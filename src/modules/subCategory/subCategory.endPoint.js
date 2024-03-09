import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    ADD_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER]
}