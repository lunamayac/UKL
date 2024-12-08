-- AlterTable
ALTER TABLE `Request` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'BORROWED';

-- CreateIndex
CREATE INDEX `Item_category_idx` ON `Item`(`category`);

-- CreateIndex
CREATE INDEX `Item_location_idx` ON `Item`(`location`);

-- CreateIndex
CREATE INDEX `Request_borrowDate_idx` ON `Request`(`borrowDate`);

-- CreateIndex
CREATE INDEX `Request_actualReturnDate_idx` ON `Request`(`actualReturnDate`);

-- CreateIndex
CREATE INDEX `Request_status_idx` ON `Request`(`status`);
