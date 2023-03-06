import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {baseEntity} from "./baseEntity";
import {Users} from "./userEntity";

@Entity()
export class TransactionHistory extends baseEntity {
    @ManyToOne({type: Users})
    user!: Users;

    @Property({type: "string"})
    coin!: string;

    @Property({type: "string"})
    caller_id!: string;

    @Property({type: "string"})
    currency_amount!: string;

    @Property({type: "string"})
    status!: string;

    @Property({type: "string"})
    action!: string;

    @Property({type: "boolean", default: false})
    is_fiat!: boolean;

    @Property({type: "string", nullable: true})
    okx_network?: string;

    @Property({type: "string", nullable: true})
    network?: string;

    @Property({type: "string", nullable: true})
    address?: string;

    @Property({type: "string", nullable: true})
    txid?: string;

    @Property({type: "string", nullable: true})
    charge_amount?: string;

    @Property({type: "string", nullable: true})
    verify_url?: string;

    constructor(user: Users, okx_network: string, caller_id: string, currency_amount: string, status: string,
                action: string, address: string, txid: string, coin: string, network: string, is_fiat: boolean,
                charge_amount: string, verify_url: string) {
        super();
        this.user = user;
        this.okx_network = okx_network;
        this.caller_id = caller_id;
        this.currency_amount = currency_amount;
        this.status = status;
        this.action = action;
        this.address = address;
        this.txid = txid;
        this.coin = coin;
        this.is_fiat = is_fiat;
        this.charge_amount = charge_amount;
        this.network = network;
        this.verify_url = verify_url;
    }
}