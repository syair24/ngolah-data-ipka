import ExcelJS from 'exceljs';

interface WeighingItem {
  id: number;
  lebarMaterial: number;
  ukuran: string;
  ketebalan: number;
  beratPiece: number;
  beratTabel: number;
  toleransi: number;
  warna: string;
}

interface WeighingCard {
  id: number;
  tanggal: string;
  toleransi: number;
  data: WeighingItem[];
}

function getRowColorStatus(
  pieceWeight: number,
  tableWeight: number,
  tolerance: number
): 'Hijau' | 'Putih' | 'Merah' {
  const upperLimit = tableWeight + (tableWeight * tolerance) / 100;

  const lowerLimit = tableWeight - (tableWeight * tolerance) / 100;

  const pieceCompare = Math.trunc(pieceWeight * 100) / 100;

  const upperCompare = Math.trunc(upperLimit * 100) / 100;

  const lowerCompare = Math.trunc(lowerLimit * 100) / 100;

  if (pieceCompare < lowerCompare) return 'Hijau';
  if (pieceCompare > upperCompare) return 'Merah';

  return 'Putih';
}

// Format tanggal Indonesia dengan nama hari
function formatTanggalIndonesia(tanggal: string): string {
  if (!tanggal) return '-';

  const dateOnly = tanggal.split('T')[0];

  let year: number;
  let month: number;
  let day: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    [year, month, day] = dateOnly.split('-').map(Number);
  } else {
    const parsed = new Date(tanggal);

    if (Number.isNaN(parsed.getTime())) {
      return tanggal;
    }

    year = parsed.getFullYear();
    month = parsed.getMonth() + 1;
    day = parsed.getDate();
  }

  const date = new Date(year, month - 1, day);

  if (
    !year ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return tanggal;
  }

  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const namaBulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return `${namaHari[date.getDay()]}, ${day} ${namaBulan[month - 1]} ${year}`;
}

export async function exportToExcel(selectedData: WeighingCard) {
  if (!selectedData || !selectedData.data) return;

  const toleranceValue = Number(selectedData.toleransi).toFixed(0);

  const titleText = `LAPORAN BERAT HARIAN RANGE +- ${toleranceValue}%`;

  const tanggalIndonesia = formatTanggalIndonesia(selectedData.tanggal);

  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Production Dashboard';
  workbook.subject = 'Laporan Berat Harian';
  workbook.title = titleText;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Laporan Timbang', {
    views: [
      {
        state: 'normal',
        showGridLines: true,
      },
    ],
  });

  // Lebar kolom
  worksheet.columns = [{ width: 18 }, { width: 15 }, { width: 17 }, { width: 17 }, { width: 18 }];

  // Border hitam
  const blackBorder: Partial<ExcelJS.Borders> = {
    top: {
      style: 'thin',
      color: { argb: 'FF000000' },
    },
    left: {
      style: 'thin',
      color: { argb: 'FF000000' },
    },
    bottom: {
      style: 'thin',
      color: { argb: 'FF000000' },
    },
    right: {
      style: 'thin',
      color: { argb: 'FF000000' },
    },
  };

  // Posisi seluruh teks
  const baseAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };

  // =====================================
  // JUDUL
  // =====================================

  worksheet.mergeCells('A1:E1');

  const titleCell = worksheet.getCell('A1');

  titleCell.value = titleText;

  titleCell.font = {
    name: 'Arial',
    size: 13,
    bold: true,
    color: { argb: 'FF000000' },
  };

  titleCell.alignment = baseAlignment;
  titleCell.border = {};

  worksheet.getRow(1).height = 25;

  // =====================================
  // TANGGAL INDONESIA
  // =====================================

  worksheet.mergeCells('A2:E2');

  const dateCell = worksheet.getCell('A2');

  // Disimpan sebagai teks biasa
  dateCell.value = tanggalIndonesia;
  dateCell.numFmt = '@';

  dateCell.font = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FF000000' },
  };

  dateCell.alignment = baseAlignment;
  dateCell.border = {};

  worksheet.getRow(2).height = 22;

  // =====================================
  // JARAK
  // =====================================

  worksheet.getRow(3).height = 12;

  // =====================================
  // HEADER TABEL
  // =====================================

  const headers = ['LEBAR BAHAN', 'SIZE', 'KETEBALAN', 'BERAT/BTG', 'BERAT TABEL'];

  const headerRow = worksheet.getRow(4);

  headerRow.values = headers;
  headerRow.height = 23;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' },
    };

    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FF000000' },
    };

    cell.alignment = baseAlignment;
    cell.border = blackBorder;
  });

  // =====================================
  // DATA UTAMA
  // =====================================

  selectedData.data.forEach((item, index) => {
    const piece = Number(item.beratPiece);
    const table = Number(item.beratTabel);
    const tolerance = Number(item.toleransi);

    const statusColor = getRowColorStatus(piece, table, tolerance);

    let backgroundColor = 'FFFFFFFF';

    if (statusColor === 'Hijau') {
      backgroundColor = 'FF00FF00';
    }

    if (statusColor === 'Merah') {
      backgroundColor = 'FFFF0000';
    }

    const rowNumber = index + 5;

    const row = worksheet.getRow(rowNumber);

    row.values = [Number(item.lebarMaterial), item.ukuran, Number(item.ketebalan), piece, table];

    row.height = 20;

    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: backgroundColor,
        },
      };

      cell.font = {
        name: 'Arial',
        size: 10,
        bold: statusColor === 'Merah',
        color: { argb: 'FF000000' },
      };

      cell.alignment = baseAlignment;
      cell.border = blackBorder;
    });

    // Format 2 angka desimal
    // Format angka Excel
    row.getCell(1).numFmt = '0';
    row.getCell(3).numFmt = '0.00';
    row.getCell(4).numFmt = '0.00';
    row.getCell(5).numFmt = '0.00';
  });

  const lastDataRow = selectedData.data.length + 4;

  // =====================================
  // JARAK SEBELUM KETERANGAN
  // =====================================

  const spacerRowNumber = lastDataRow + 1;

  worksheet.getRow(spacerRowNumber).height = 15;

  // =====================================
  // KETERANGAN BAWAH
  // GABUNG 3 KOLOM A:C
  // =====================================

  const legendStartRow = spacerRowNumber + 1;

  const legendData = [
    {
      text: `BERAT DI BAWAH LIS LEBIH DARI ${toleranceValue}%`,
      color: 'FF00FF00',
    },
    {
      text: `BERAT SESUAI DENGAN LIS DI RANGE +- ${toleranceValue}%`,
      color: 'FFFFFFFF',
    },
    {
      text: `BERAT DI ATAS LIS LEBIH ${toleranceValue}%`,
      color: 'FFFF0000',
    },
  ];

  legendData.forEach((legend, index) => {
    const rowNumber = legendStartRow + index;

    worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);

    const cell = worksheet.getCell(`A${rowNumber}`);

    cell.value = legend.text;

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: legend.color,
      },
    };

    cell.font = {
      name: 'Arial',
      size: 10,
      color: { argb: 'FF000000' },
    };

    cell.alignment = baseAlignment;
    cell.border = blackBorder;

    worksheet.getRow(rowNumber).height = 22;

    // Border dan warna area gabungan
    for (let col = 1; col <= 3; col++) {
      const mergedCell = worksheet.getCell(rowNumber, col);

      mergedCell.border = blackBorder;

      mergedCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: legend.color,
        },
      };
    }
  });

  // =====================================
  // EXPORT FILE XLSX
  // =====================================

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  link.download = `Laporan_Timbang_${selectedData.tanggal}.xlsx`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
