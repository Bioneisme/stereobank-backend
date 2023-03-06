import {NextFunction, Request, Response} from "express";
import CryptoJS from "crypto-js";
import {PSP, SERVER_URL} from "../config/settings";
import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {TransactionHistory, Users, Wallets} from "../entities";
import {DI} from "../index";
import {FiatStatus, UserRequest} from "../types";
import {wrap} from "@mikro-orm/core";
import {noExponents} from "../utils/noExponents";

function sign(ts: number) {
    let msg = "publicKey=" + PSP.publicKey + "&timesstamp=" + ts;
    return CryptoJS.HmacSHA256(msg, PSP.privateKey).toString();
}

if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    }
}

class FiatController {
    async deposit(req: Request, res: Response, next: NextFunction) {
        try {
            const {user} = req as UserRequest;
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }
            const {amount, currency} = req.body;
            const ts = Math.floor(Date.now() / 1000);
            const signature = sign(ts);
            const transaction_id = `${user.id}:${uuidv4()}`;
            axios.post(PSP.baseUrl + "transactions/charge", {
                "service_id": 73,
                "type": "charge",
                "merchant_id": 16,
                "wallet_to_id": 24,
                "amount": amount * 100,
                "currency": currency,
                "merchant_transaction_id": transaction_id,
                "confirm_url": "https://stereobank.tech",
                "callback_url": SERVER_URL + "/api/fiats/callback/" + transaction_id,
            }, {
                headers: {
                    publicKey: PSP.publicKey,
                    timestamp: ts,
                    signature: signature,
                }
            }).then(() => {
                axios.post(PSP.baseUrl + "transactions/find", {
                    "merchant_id": 16,
                    "merchant_transaction_id": transaction_id
                }, {
                    headers: {
                        publicKey: PSP.publicKey,
                        timestamp: ts,
                        signature: signature
                    }
                }).then(result => {
                    res.json({verify_url: result.data.result.data.verify_url});
                }).catch(e => {
                    console.log(e.response.data);
                    res.status(500).json({error: true, message: e.response.data});
                });
            }).catch(e => {
                console.log(e.response.data);
                res.status(500).json({error: true, message: e.response.data});
            });
            return next();
        } catch (e) {
            res.status(500).json({error: true, message: e});
        }
    }

    async callback(req: Request, res: Response, next: NextFunction) {
        try {
            const ts = Math.floor(Date.now() / 1000);
            const signature = sign(ts);
            const {trans} = req.params;
            const user_id = trans.split(":")[0];
            const user = await DI.em.findOne(Users, {id: +user_id});
            if (!user) {
                res.status(500).json({error: true, message: "User not found"});
                return next();
            }
            axios.post(PSP.baseUrl + "transactions/find", {
                "merchant_id": 16,
                "merchant_transaction_id": trans
            }, {
                headers: {
                    publicKey: PSP.publicKey,
                    timestamp: ts,
                    signature: signature
                }
            }).then(async result => {
                const data = result.data.result.data;
                const txid = data.id;
                let transaction = await DI.em.findOne(TransactionHistory, {txid: txid});
                const action = data.wallet_charge_amount ? "deposit" : "withdraw";
                const charge_amount = `${(data.wallet_charge_amount || 0) / 100}`;
                if (!transaction) {
                    transaction = DI.em.create(TransactionHistory, {
                        txid: txid,
                        user,
                        coin: data.currency,
                        caller_id: trans,
                        currency_amount: `${data.amount / 100}`,
                        charge_amount,
                        status: FiatStatus[data.status],
                        action,
                        verify_url: data.verify_url,
                        is_fiat: true
                    });
                }
                transaction.status = FiatStatus[data.status];
                transaction.verify_url = data.verify_url;
                await DI.em.persistAndFlush(transaction);
                let wallet = await DI.em.findOne(Wallets, {user_id: user});
                if (!wallet) {
                    wallet = DI.em.create(Wallets, {
                        user_id: user.id
                    });
                }
                if (action === "deposit" && transaction.status === 'success') {
                    const coinInWallet = data.currency.toLowerCase();
                    wrap(wallet).assign({
                        [coinInWallet]: (+noExponents(+wallet[coinInWallet as keyof typeof wallet.uah] || 0) +
                            +noExponents(+charge_amount)).toString()
                    });
                    await DI.em.persistAndFlush(wallet);
                }

                res.json({status: 'ok', data: result.data});
            }).catch(e => {
                console.log(e.response?.data || e.response || e);
                res.status(500).json({error: true, message: e.response?.data || e.response || e});
            });
            return next();
        } catch (e) {
            res.status(500).json({error: true, message: e});
        }
    }
}

export default new FiatController();