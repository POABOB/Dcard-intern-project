CREATE DATABASE IF NOT EXISTS shortURL;
USE shortURL;
CREATE TABLE IF NOT EXISTS `shortURL`.`url` ( `id` INT UNSIGNED NOT NULL AUTO_INCREMENT , `url` TEXT NOT NULL , `expireAt` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

-- CREATE TABLE `shortURL`.`url_random` (`id` int(11) NOT NULL AUTO_INCREMENT,`url` text NOT NULL DEFAULT '0', `expireAt` int(11) NOT NULL DEFAULT 0, PRIMARY KEY (`id`), KEY `url` (`url`(1024))) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- CREATE TABLE `shortURL`.`url_random_nums` (`id` int(11) NOT NULL AUTO_INCREMENT,`urlNums` int(11) UNSIGNED NOT NULL,  PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- INSERT INTO `url_random_nums`(urlNums) VALUES (0);