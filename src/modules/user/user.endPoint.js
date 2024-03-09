import { systemRoles } from "../../utils/system_roles.js";


export const endPointRoles = {
    GET_ALL_USER: [systemRoles.ADMIN, systemRoles.SUPER],
    GET_ALL_USER_DELETED: [systemRoles.ADMIN, systemRoles.SUPER],
    GET_USER_PROFILE_DATA: [systemRoles.ADMIN, systemRoles.SUPER],
    DELETE_USER_ACCOUNT: [systemRoles.ADMIN, systemRoles.SUPER],
    UPDATE_USER_PROFILE_DATA: [systemRoles.ADMIN, systemRoles.SUPER, systemRoles.USER],
    FORGET_PASSWORD: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER, systemRoles.DELIVER_ROLE],
    CHANGE_PASSWORD: [systemRoles.USER],
    UPDATE_PASSWORD: [systemRoles.USER],

}