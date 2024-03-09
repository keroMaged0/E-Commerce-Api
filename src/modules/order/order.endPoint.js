import { systemRoles } from "../../utils/system_roles.js";

export const endPointRoles = {
    USER_ROLE: [systemRoles.USER],
    DELIVER_ORDER: [systemRoles.DELIVER_ROLE, systemRoles.SUPER, systemRoles.ADMIN],
    All_ORDER: [systemRoles.SUPER, systemRoles.ADMIN],
    PAY_ORDER: [systemRoles.SUPER, systemRoles.ADMIN],
};