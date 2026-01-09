-- AlterTable
ALTER TABLE "public"."order" ADD COLUMN     "deliveryMethodId" INTEGER;

-- CreateTable
CREATE TABLE "public"."delivery_method" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_method_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "public"."delivery_method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
