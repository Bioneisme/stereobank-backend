CREATE TABLE users
(
    id         int          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name       varchar(255) NOT NULL,
    phone      varchar(20),
    email      varchar(100) NOT NULL,
    password   varchar(255),
    caller_id  varchar(255),
    is_google  boolean DEFAULT false,
    photo_url  varchar(255),
    created_at character varying(50),
    updated_at character varying(50)
);

CREATE TABLE tokens
(
    id         int                   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    integer               NOT NULL,
    token      text                  NOT NULL,
    created_at character varying(50) NOT NULL,
    updated_at character varying(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE wallets
(
    user_id              INT                    NOT NULL,
    btc_bitcoin          character varying(100) not null default '0',
    usdt_trc20           character varying(100) not null default '0',
    eth_erc20            character varying(100) not null default '0',
    usdt_erc20           character varying(100) not null default '0',
    usdc_erc20           character varying(100) not null default '0',
    usdc_trc20           character varying(100) not null default '0',
    matic_erc20          character varying(100) not null default '0',
    trx_trc20            character varying(100) not null default '0',
    matic_polygon        character varying(100) not null default '0',
    dai_erc20            character varying(100) not null default '0',
    ltc_litecoin         character varying(100) not null default '0',
    etc_ethereum_classic character varying(100) not null default '0',
    ada_cardano          character varying(100) not null default '0',
    sol_solana           character varying(100) not null default '0',
    doge_dogecoin        character varying(100) not null default '0',
    bch_bitcoincash      character varying(100) not null default '0',
    waves_waves          character varying(100) not null default '0',
    dot_polkadot         character varying(100) not null default '0',
    xtz_tezos            character varying(100) not null default '0',
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE transaction_history
(
    id              int                    NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id         integer                NOT NULL,
    okx_network     character varying(20)  NOT NULL,
    coin            character varying(20)  NOT NULL,
    network         character varying(20)  NOT NULL,
    caller_id       character varying(100) NOT NULL,
    currency_amount character varying(255) NOT NULL,
    status          character varying(20),
    action          character varying(20),
    address         character varying(255),
    txid            character varying(255),
    created_at      character varying(50)  NOT NULL,
    updated_at      character varying(50)  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);