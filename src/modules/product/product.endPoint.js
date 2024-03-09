import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    ADD_product: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_product: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_product: [systemRoles.ADMIN, systemRoles.SUPER]
}