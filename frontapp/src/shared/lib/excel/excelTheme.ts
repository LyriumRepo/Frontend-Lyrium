import type * as ExcelJS from 'exceljs';

/**
 * Tema unificado para exportaciones Excel (.xlsx) del panel vendedor.
 * Usado por: inventario, servicios, ventas, comprobantes/pagos.
 *
 * Antes cada exportador repetía su propia paleta oscura (fondo verde casi
 * negro + texto de fila sin color explícito), lo que en la mayoría de
 * visores Excel/LibreOffice rendía texto negro sobre fondo casi negro —
 * ilegible. Este tema usa fondo claro para el cuerpo de la tabla y solo
 * la franja de título/encabezado en verde marca, con texto siempre con
 * color explícito.
 */
export const EXCEL_COLORS = {
    headerBg:   '2A5A4D', // verde marca — franja de encabezado de columnas
    headerFont: 'FFFFFF', // blanco, negrita, sobre headerBg
    titleBg:    '1F3D33', // verde marca oscuro — título + subtítulo del reporte
    titleFont:  'FFFFFF',
    subText:    'CFEBDB', // texto secundario (subtítulo) sobre titleBg
    accent:     '8FC3A1', // barra acento fina bajo el título
    bodyBg:     'FFFFFF', // fondo fila impar
    stripeBg:   'F0F7F3', // fondo fila par (mint muy claro)
    bodyFont:   '1F2937', // texto de datos — siempre explícito, nunca heredado
    border:     'DCE7E0', // bordes finos claros
    totalBg:    'DCEEE3', // fondo fila de totales
    totalFont:  '163D22', // texto fila de totales
} as const;

/** Grises/semánticos para estados, con suficiente contraste sobre fondo blanco. */
export const EXCEL_STATUS_COLORS = {
    success: 'FF0F9D58', // verde
    warning: 'FFB45309', // ámbar oscuro (más legible que amber-500 puro en blanco)
    danger:  'FFDC2626', // rojo
    neutral: 'FF6B7280', // gris medio (en vez de gris claro, ilegible en blanco)
} as const;

export function excelBorderHair(): Partial<ExcelJS.Borders> {
    const s = { style: 'hair' as ExcelJS.BorderStyle, color: { argb: 'FF' + EXCEL_COLORS.border } };
    return { top: s, left: s, bottom: s, right: s };
}

export function excelBorderBottomMedium(): Partial<ExcelJS.Borders> {
    return { bottom: { style: 'medium', color: { argb: 'FF' + EXCEL_COLORS.border } } };
}

/** Estilo de la franja de título principal (fila 1). */
export function styleExcelTitleCell(cell: ExcelJS.Cell, size = 13): void {
    cell.font = { name: 'Arial', bold: true, size, color: { argb: 'FF' + EXCEL_COLORS.titleFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
}

/** Estilo de la fila de subtítulo (fecha de generación, conteos, etc.). */
export function styleExcelSubtitleCell(cell: ExcelJS.Cell): void {
    cell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF' + EXCEL_COLORS.subText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.titleBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
}

/** Barra de acento delgada entre el bloque de título y la tabla. */
export function styleExcelAccentBar(cell: ExcelJS.Cell): void {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.accent } };
}

/** Estilo de una celda de encabezado de columna. */
export function styleExcelHeaderCell(cell: ExcelJS.Cell, opts?: { wrapText?: boolean }): void {
    cell.font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + EXCEL_COLORS.headerFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.headerBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: opts?.wrapText ?? false };
    cell.border = excelBorderBottomMedium();
}

/**
 * Aplica fondo, texto y borde estándar a una fila de datos.
 * Respeta cualquier `font.color` o `fill` ya asignado a una celda (p. ej.
 * para resaltar un estado en rojo/ámbar con su propio chip de fondo) —
 * solo rellena lo que falte, para que nunca quede una celda sin color
 * de texto explícito.
 */
export function styleExcelDataRow(row: ExcelJS.Row, rowIndexZeroBased: number): void {
    const isEven = rowIndexZeroBased % 2 === 0;
    row.eachCell({ includeEmpty: true }, cell => {
        if (!cell.font?.color) {
            cell.font = { name: 'Arial', size: 9, bold: cell.font?.bold, color: { argb: 'FF' + EXCEL_COLORS.bodyFont } };
        }
        if (!cell.fill || cell.fill.type !== 'pattern') {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF' + (isEven ? EXCEL_COLORS.stripeBg : EXCEL_COLORS.bodyBg) },
            };
        }
        cell.border = excelBorderHair();
    });
}

/** Estilo de la fila de totales al pie de la tabla. */
export function styleExcelTotalRow(row: ExcelJS.Row): void {
    row.eachCell({ includeEmpty: true }, cell => {
        if (!cell.font?.color) {
            cell.font = { name: 'Arial', bold: true, size: 9, color: { argb: 'FF' + EXCEL_COLORS.totalFont } };
        }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.totalBg } };
        cell.border = { top: { style: 'medium', color: { argb: 'FF' + EXCEL_COLORS.border } } };
    });
}

/** Título de sección tipo "RESUMEN DE PAGOS" en la hoja Resumen (sin fondo, texto en verde marca). */
export function styleExcelSectionTitleCell(cell: ExcelJS.Cell): void {
    cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + EXCEL_COLORS.headerBg } };
}

/**
 * Fila de KPI en formato "etiqueta | valor" (hoja Resumen de sellers/payments/
 * operations/invoices admin). Etiqueta en texto base, valor en negrita verde
 * marca, con franja alterna clara — reemplaza el patrón repetido de
 * label/value sobre fondo oscuro con texto verde medio (bajo contraste).
 */
export function styleExcelKpiRow(row: ExcelJS.Row, rowIndexZeroBased: number): void {
    const isEven = rowIndexZeroBased % 2 === 0;
    const fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF' + (isEven ? EXCEL_COLORS.stripeBg : EXCEL_COLORS.bodyBg) } };
    const labelCell = row.getCell(1);
    const valueCell = row.getCell(2);
    labelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF' + EXCEL_COLORS.bodyFont } };
    valueCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF' + EXCEL_COLORS.totalFont } };
    labelCell.fill = fill;
    valueCell.fill = fill;
    labelCell.border = excelBorderHair();
    valueCell.border = excelBorderHair();
}

/** Etiqueta (fila superior) de una tarjeta KPI de 2 filas (grid de indicadores). */
export function styleExcelKpiCardLabel(cell: ExcelJS.Cell): void {
    cell.font = { name: 'Arial', bold: true, size: 7, color: { argb: 'FF' + EXCEL_COLORS.totalFont } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.stripeBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    cell.border = {
        top:   { style: 'medium', color: { argb: 'FF' + EXCEL_COLORS.border } },
        left:  { style: 'thin',   color: { argb: 'FF' + EXCEL_COLORS.border } },
        right: { style: 'thin',   color: { argb: 'FF' + EXCEL_COLORS.border } },
    };
}

/** Valor (fila inferior) de una tarjeta KPI de 2 filas (grid de indicadores). */
export function styleExcelKpiCardValue(cell: ExcelJS.Cell): void {
    cell.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF' + EXCEL_COLORS.headerBg } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + EXCEL_COLORS.stripeBg } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF' + EXCEL_COLORS.border } },
        left:   { style: 'thin', color: { argb: 'FF' + EXCEL_COLORS.border } },
        right:  { style: 'thin', color: { argb: 'FF' + EXCEL_COLORS.border } },
    };
}
