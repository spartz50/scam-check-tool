CREATE TABLE `scam_check_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riskLevel` enum('HIGH RISK','CAUTION','LOW RISK SIGNALS') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scam_check_logs_id` PRIMARY KEY(`id`)
);
