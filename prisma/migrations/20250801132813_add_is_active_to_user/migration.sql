-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cubcen_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_cubcen_users" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "cubcen_users";
DROP TABLE "cubcen_users";
ALTER TABLE "new_cubcen_users" RENAME TO "cubcen_users";
CREATE UNIQUE INDEX "cubcen_users_email_key" ON "cubcen_users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
