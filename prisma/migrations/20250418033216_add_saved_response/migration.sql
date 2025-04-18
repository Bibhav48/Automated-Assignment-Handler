-- CreateTable
CREATE TABLE "SavedResponse" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedResponse" ADD CONSTRAINT "SavedResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
