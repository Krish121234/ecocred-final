CREATE TABLE `gpsHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`lat` decimal(10,8) NOT NULL,
	`lng` decimal(11,8) NOT NULL,
	`accuracy` decimal(8,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gpsHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gpsLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`lat` decimal(10,8) NOT NULL,
	`lng` decimal(11,8) NOT NULL,
	`accuracy` decimal(8,2),
	`speed` decimal(8,2),
	`routeId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gpsLocations_id` PRIMARY KEY(`id`),
	CONSTRAINT `gpsLocations_workerId_unique` UNIQUE(`workerId`)
);
--> statement-breakpoint
CREATE TABLE `rewardRedemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`rewardId` int NOT NULL,
	`creditsSpent` int NOT NULL,
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewardRedemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`creditsRequired` int NOT NULL,
	`icon` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`zone` varchar(255) NOT NULL,
	`houses` json NOT NULL,
	`assignedWorkerId` int,
	`status` enum('unassigned','active','completed') NOT NULL DEFAULT 'unassigned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`routeId` int NOT NULL,
	`houseId` varchar(255) NOT NULL,
	`creditsEarned` int NOT NULL DEFAULT 10,
	`gpsProofLat` decimal(10,8) NOT NULL,
	`gpsProofLng` decimal(11,8) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskCompletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','worker') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `housesCovered` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `assignedRouteId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastSeen` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);