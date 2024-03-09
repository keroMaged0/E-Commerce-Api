import { systemRoles } from "../../utils/system_roles.js";

export const endPointRoles = {
    ADD_REVIEW: [systemRoles.USER],
    UPDATE_REVIEW: [systemRoles.USER],
    DELETE_REVIEW: [systemRoles.USER],
    GET_ALL_REVIEW: [systemRoles.SUPER, systemRoles.ADMIN],
}