-- CreateTable
CREATE TABLE "polls" (
    "id" UUID NOT NULL,
    "question" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" UUID NOT NULL,
    "poll_id" UUID NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
