import {Entity, PrimaryKey, Property} from "@mikro-orm/core";
import {Users} from "./userEntity";

@Entity()
export class Wallets {
    @PrimaryKey({type: Users})
    user_id!: Users;

    @Property({type: "string"})
    btc_bitcoin?: string;

    @Property({type: "string"})
    usdt_trc20?: string;

    @Property({type: "string"})
    eth_erc20?: string;

    @Property({type: "string"})
    usdt_erc20?: string;

    @Property({type: "string"})
    usdc_erc20?: string;

    @Property({type: "string"})
    usdc_trc20?: string;

    @Property({type: "string"})
    matic_erc20?: string;

    @Property({type: "string"})
    trx_trc20?: string;

    @Property({type: "string"})
    matic_polygon?: string;

    @Property({type: "string"})
    dai_erc20?: string;

    @Property({type: "string"})
    ltc_litecoin?: string;

    @Property({type: "string"})
    etc_ethereum_classic?: string;

    @Property({type: "string"})
    ada_cardano?: string;

    @Property({type: "string"})
    sol_solana?: string;

    @Property({type: "string"})
    doge_dogecoin?: string;

    @Property({type: "string"})
    bch_bitcoincash?: string;

    @Property({type: "string"})
    waves_waves?: string;

    @Property({type: "string"})
    dot_polkadot?: string;

    @Property({type: "string"})
    xtz_tezos?: string;

    @Property({type: "string"})
    uah?: string;

    @Property({type: "string"})
    bonus_uah?: string;

    @Property({type: "string"})
    usd?: string;

    @Property({type: "string"})
    eur?: string;

    constructor(user_id: Users, btc_bitcoin: string = "0", usdt_trc20: string = "0", eth_erc20: string = "0", usdt_erc20: string = "0",
                usdc_erc20: string = "0", usdc_trc20: string = "0", matic_erc20: string = "0", trx_trc20: string = "0", matic_polygon: string = "0",
                dai_erc20: string = "0", ltc_litecoin: string = "0", etc_ethereum_classic: string = "0", ada_cardano: string = "0",
                sol_solana: string = "0", doge_dogecoin: string = "0", bch_bitcoincash: string = "0", waves_waves: string = "0",
                dot_polkadot: string = "0", xtz_tezos: string = "0", uah: string = "0", usd: string = "0", eur: string = "0", bonus_uah: string = "0") {
        this.user_id = user_id;
        this.btc_bitcoin = btc_bitcoin;
        this.usdt_trc20 = usdt_trc20;
        this.eth_erc20 = eth_erc20;
        this.usdt_erc20 = usdt_erc20;
        this.usdc_erc20 = usdc_erc20;
        this.usdc_trc20 = usdc_trc20;
        this.matic_erc20 = matic_erc20;
        this.trx_trc20 = trx_trc20;
        this.matic_polygon = matic_polygon;
        this.dai_erc20 = dai_erc20;
        this.ltc_litecoin = ltc_litecoin;
        this.etc_ethereum_classic = etc_ethereum_classic;
        this.ada_cardano = ada_cardano;
        this.sol_solana = sol_solana;
        this.doge_dogecoin = doge_dogecoin;
        this.bch_bitcoincash = bch_bitcoincash;
        this.waves_waves = waves_waves;
        this.dot_polkadot = dot_polkadot;
        this.xtz_tezos = xtz_tezos;
        this.uah = uah;
        this.bonus_uah = bonus_uah;
        this.usd = usd;
        this.eur = eur;
    }
}