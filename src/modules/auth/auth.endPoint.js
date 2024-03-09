import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    SIGN_IN_USER: [systemRoles.ADMIN, systemRoles.SUPER, systemRoles.USER],
    SIGN_UP_USER: [systemRoles.ADMIN, systemRoles.SUPER, systemRoles.USER],
    
}