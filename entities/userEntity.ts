import {Entity, Property} from "@mikro-orm/core";
import {baseEntity} from "./baseEntity";

@Entity()
export class Users extends baseEntity {
    @Property({type: "string"})
    name!: string;

    @Property({type: "string"})
    email!: string;

    @Property({type: "string"})
    promo_code!: string;

    @Property({type: "string", nullable: true})
    phone?: string;

    @Property({type: "boolean", default: false})
    is_google?: boolean;

    @Property({type: "string", nullable: true})
    photo_url?: string;

    @Property({type: "string", nullable: true})
    password?: string;

    @Property({type: "string", nullable: true})
    caller_id?: string;

    @Property({type: Users, nullable: true})
    referral_id?: Users;

    constructor(name: string, phone: string, email: string, password: string, caller_id: string, is_google: boolean,
                photo_url: string, referral_id: Users, promo_code: string) {
        super();
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.caller_id = caller_id;
        this.promo_code = promo_code;
        this.is_google = is_google;
        this.photo_url = photo_url;
        this.referral_id = referral_id;
    }
}