import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {baseEntity} from "./baseEntity";
import {Users} from "./userEntity";

@Entity()
export class TransactionHistory extends baseEntity {
    @ManyToOne({type: Users})
    user!: Users;

    @Property({type: "string"})
    okx_network!: string;

    @Property({type: "string"})
    coin!: string;

    @Property({type: "string"})
    network!: string;

    @Property({type: "string"})
    caller_id!: string;

    @Property({type: "string"})
    currency_amount!: string;

    @Property({type: "string"})
    status!: string;

    @Property({type: "string"})
    action!: string;

    @Property({type: "string", nullable: true})
    address?: string;

    @Property({type: "string", nullable: true})
    txid?: string;


    constructor(user: Users, okx_network: string, caller_id: string, currency_amount: string, status: string,
                action: string, address: string, amount_with_fee: string, txid: string, coin: string, network: string) {
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
        this.network = network;
    }
}