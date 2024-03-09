import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    ADD_COUPON: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_COUPON: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_COUPON: [systemRoles.ADMIN, systemRoles.SUPER],
    GET_DISABLED: [systemRoles.ADMIN, systemRoles.SUPER]
}
