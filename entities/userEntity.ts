import {Entity, Property} from "@mikro-orm/core";
import {baseEntity} from "./baseEntity";

@Entity()
export class Users extends baseEntity {
    @Property({type: "string"})
    name!: string;

    @Property({type: "string"})
    phone!: string;

    @Property({type: "string"})
    email!: string;

    @Property({type: "string"})
    password!: string;

    @Property({type: "string"})
    caller_id?: string;

    constructor(name: string, phone: string, email: string, password: string, caller_id: string) {
        super();
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.caller_id = caller_id;
    }
}