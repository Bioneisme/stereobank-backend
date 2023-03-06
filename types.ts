import {Request} from "express";
import {Users} from "./entities";

export type UserRequest = Request & { user: Users | undefined, locals: Date };

export enum ContactStatus {
    pending = 0,
    accepted = 1,
    rejected = -1,
}

export enum FiatStatus {
    new = 0,
    success = 1,
    failed = 2,
    canceled = 3,
    timeout = 4,
    refund = 5,
    chargeback = 6,
    processing = 10,
    verification = 12
}