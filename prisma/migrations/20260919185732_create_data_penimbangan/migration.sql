-- CreateTable
CREATE TABLE "DataPenimbangan" (
    "id" SERIAL NOT NULL,
    "tanggal" TEXT NOT NULL,
    "lebarMaterial" DECIMAL(10,2) NOT NULL,
    "ukuran" TEXT NOT NULL,
    "ketebalan" DECIMAL(10,2) NOT NULL,
    "beratPiece" DECIMAL(10,2) NOT NULL,
    "beratTabel" DECIMAL(10,2) NOT NULL,
    "toleransi" DECIMAL(10,2) NOT NULL,
    "warna" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataPenimbangan_pkey" PRIMARY KEY ("id")
);
