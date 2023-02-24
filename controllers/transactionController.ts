import {NextFunction, Request, Response} from "express";
import {DI} from "../index";
import {TransactionHistory, Users, Wallets} from "../entities";
import {wrap} from "@mikro-orm/core";
import logger from "../config/logger";
import {UserRequest} from "../types";
import {v4 as uuidv4} from 'uuid';
import axios from "axios";
import {API_KEY, SERVER_URL} from "../config/settings";

function noExponents(num: number) {
    const data = String(num).split(/[eE]/);
    if (data.length == 1) return data[0];

    let z = '',
        sign = num < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
}

class TransactionController {
    async callback(req: Request, res: Response, next: NextFunction) {
        try {
            const {currency, caller_id, status, action, currency_amount, txid, amount_with_fee, address} = req.body;
            const {okx_network} = currency;
            const coinInWallet = okx_network.replace(/[- ]/g, '_').toLowerCase();
            const user = await DI.em.findOne(Users, {id: caller_id.split(":")[0]});
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }

            let transaction = await DI.em.findOne(TransactionHistory, {caller_id});
            if (!transaction) {
                transaction = DI.em.create(TransactionHistory, {
                    caller_id,
                    status,
                    action,
                    currency_amount,
                    txid,
                    address,
                    amount_with_fee,
                    okx_network,
                    user
                });
            } else {
                wrap(transaction).assign({
                    status,
                    action,
                    currency_amount,
                    txid,
                    address,
                    amount_with_fee,
                    okx_network
                });
            }
            await DI.em.persistAndFlush(transaction);

            let wallet = await DI.em.findOne(Wallets, {user_id: user});
            if (!wallet) {
                wallet = DI.em.create(Wallets, {
                    user_id: user.id
                });
            }

            if (status == 'success' && action == 'deposit') {
                wrap(wallet).assign({
                    [coinInWallet]: (+noExponents(+wallet[coinInWallet as keyof typeof wallet.ada_cardano] || 0) +
                        +noExponents(+currency_amount)).toString()
                });
                await DI.em.persistAndFlush(wallet);
            }
            res.json({error: false, wallet});
            return next();
        } catch (e) {
            logger.error(`callback: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async createAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const {user} = req as UserRequest;
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }
            const caller_id = `${user?.id}:${uuidv4()}`;
            wrap(user).assign({
                caller_id
            });
            await DI.em.persistAndFlush(user);
            const {coin, network} = req.body;
            return axios.post('https://api.cryptoamlnode.com/api/v1/deposits',
                {
                    coin,
                    network,
                    caller_id
                }, {
                    headers: {
                        Authorization: 'Bearer ' + API_KEY,
                        'Content-Type': 'application/json'
                    }
                }).then(result => {
                if (result.status === 200) {
                    res.json({error: false, result: result.data});
                    return next();
                } else {
                    res.status(500).json({error: true, message: result.data});
                    return next();
                }
            }).catch(e => {
                logger.error(`createAddress: ${e}`);
                console.log(e)
                res.status(500).json({error: true, message: e});
                return next();
            })
        } catch (e) {
            logger.error(`createAddress: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async sendCrypto(req: Request, res: Response, next: NextFunction) {
        try {
            const {coin, network, okx_network, currency_amount, address} = req.body;
            if (!currency_amount) {
                res.status(400).json({error: true, message: "Amount is required"});
                return next();
            }
            if (!address) {
                res.status(400).json({error: true, message: "Address is required"});
                return next();
            }
            const {user} = req as UserRequest;
            if (!user) {
                res.status(400).json({error: true, message: "User not found"});
                return next();
            }
            const wallet = await DI.em.findOne(Wallets, {user_id: user});
            if (!wallet) {
                res.status(400).json({error: true, message: "Wallet not found"});
                return next();
            }
            const coinInWallet = okx_network.replace(/[- ]/g, '_').toLowerCase();
            if (+noExponents(+wallet[coinInWallet as keyof typeof wallet.ada_cardano] || 0) < +noExponents(+currency_amount)) {
                res.status(400).json({error: true, message: "Insufficient funds"});
                return next();
            }
            return axios.post('https://api.cryptoamlnode.com/api/v1/withdrawals', {
                coin,
                network,
                currency_amount,
                address
            }, {
                headers: {
                    Authorization: 'Bearer ' + API_KEY,
                    'Content-Type': 'application/json'
                }
            }).then(async result => {
                if (result.status === 200) {
                    wrap(wallet).assign({
                        [coinInWallet]: (+noExponents(+wallet[coinInWallet as keyof typeof wallet.ada_cardano] || 0) -
                            +noExponents(+currency_amount)).toString()
                    });
                    await DI.em.persistAndFlush(wallet);
                    logger.info(`sendCrypto: ${result.data}`);
                    res.json({error: false, result: result.data});
                    return next();
                } else {
                    logger.warn(`sendCrypto: ${result.data}`);
                    res.status(500).json({error: true, message: result.data});
                    return next();
                }
            }).catch(e => {
                logger.error(`sendCrypto: ${e}`);
                if (e.response.data.detail)
                    res.status(500).json({error: true, message: e.response.data.detail[0]?.msg});
                else
                    res.status(500).json({error: true, message: e?.message});
                return next();
            });
        } catch (e) {
            logger.error(`sendCrypto: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async getBalance(req: Request, res: Response, next: NextFunction) {
        try {
            let {user} = req as UserRequest;
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }
            const wallet = await DI.em.findOne(Wallets, {user_id: user});
            if (!wallet) {
                res.status(400).json({error: true, message: "wallet_not_found"});
                return next();
            }
            res.json({error: false, wallet});
            return next();
        } catch (e) {
            logger.error(`getBalance: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }
}

export default new TransactionController();