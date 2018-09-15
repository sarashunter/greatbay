DROP DATABASE IF EXISTS greatbayDB;

CREATE DATABASE greatbayDB;

USE greatbayDB;

CREATE TABLE items(
	id INTEGER AUTO_INCREMENT,
	item_name VARCHAR(30) NOT NULL,
    ownerID INTEGER,
    highest_bidderID INTEGER,
    highest_bid INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE users(
	id INTEGER AUTO_INCREMENT,
    user VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);
