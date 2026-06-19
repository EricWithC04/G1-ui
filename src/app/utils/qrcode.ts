// ============================================================
//  Generador de codigos QR (autocontenido, sin dependencias).
//  Lo usamos en el checkout para dibujar el QR de "pago con QR".
//
//  Esta es una adaptacion del generador de QR de Nayuki
//  (Project Nayuki, "QR Code generator", de dominio publico / MIT).
//  Lo metimos como archivo propio para NO tener que instalar una
//  libreria de npm (asi no hace falta reiniciar el dev server).
//
//  Lo unico que usamos desde afuera es la funcion generarQrSvg(),
//  que recibe un texto y devuelve un <svg> (como string) con el QR.
// ============================================================

// Niveles de correccion de errores. Usamos MEDIUM, alcanza y sobra.
const ECC_MEDIUM = { ordinal: 1, formatBits: 0 };

// Representa un codigo QR ya armado: sabemos su tamanio (cantidad de
// modulos por lado) y que modulos estan "pintados" (negros).
class QrCode {
    readonly size: number;
    private readonly modules: boolean[][] = [];
    private readonly isFunction: boolean[][] = [];

    constructor(
        readonly version: number,
        readonly errorCorrectionLevel: { ordinal: number; formatBits: number },
        dataCodewords: number[],
        msk: number,
    ) {
        if (version < 1 || version > 40) {
            throw new RangeError('Version fuera de rango');
        }
        this.size = version * 4 + 17;

        // Arrancamos toda la grilla en "false" (blanco).
        const row: boolean[] = [];
        for (let i = 0; i < this.size; i++) {
            row.push(false);
        }
        for (let i = 0; i < this.size; i++) {
            this.modules.push(row.slice());
            this.isFunction.push(row.slice());
        }

        this.drawFunctionPatterns();
        const allCodewords = this.addEccAndInterleave(dataCodewords);
        this.drawCodewords(allCodewords);

        // Elegimos la mascara que deje el QR "mas prolijo" (menor penalizacion).
        if (msk === -1) {
            let minPenalty = 1000000000;
            for (let i = 0; i < 8; i++) {
                this.applyMask(i);
                this.drawFormatBits(i);
                const penalty = this.getPenaltyScore();
                if (penalty < minPenalty) {
                    msk = i;
                    minPenalty = penalty;
                }
                this.applyMask(i); // deshacemos (XOR de nuevo)
            }
        }
        this.mask = msk;
        this.applyMask(msk);
        this.drawFormatBits(msk);
    }

    private mask = 0;

    // Devuelve si el modulo (x,y) esta pintado (negro).
    getModule(x: number, y: number): boolean {
        return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
    }

    // ---- Dibujo de los patrones fijos del QR ----

    private drawFunctionPatterns(): void {
        for (let i = 0; i < this.size; i++) {
            this.setFunctionModule(6, i, i % 2 === 0);
            this.setFunctionModule(i, 6, i % 2 === 0);
        }
        this.drawFinderPattern(3, 3);
        this.drawFinderPattern(this.size - 4, 3);
        this.drawFinderPattern(3, this.size - 4);

        const alignPatPos = this.getAlignmentPatternPositions();
        const numAlign = alignPatPos.length;
        for (let i = 0; i < numAlign; i++) {
            for (let j = 0; j < numAlign; j++) {
                if (
                    !((i === 0 && j === 0) ||
                        (i === 0 && j === numAlign - 1) ||
                        (i === numAlign - 1 && j === 0))
                ) {
                    this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
                }
            }
        }

        this.drawFormatBits(0);
        this.drawVersion();
    }

    private drawFormatBits(msk: number): void {
        const data = (this.errorCorrectionLevel.formatBits << 3) | msk;
        let rem = data;
        for (let i = 0; i < 10; i++) {
            rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        }
        const bits = ((data << 10) | rem) ^ 0x5412;

        for (let i = 0; i <= 5; i++) {
            this.setFunctionModule(8, i, getBit(bits, i));
        }
        this.setFunctionModule(8, 7, getBit(bits, 6));
        this.setFunctionModule(8, 8, getBit(bits, 7));
        this.setFunctionModule(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i++) {
            this.setFunctionModule(14 - i, 8, getBit(bits, i));
        }

        for (let i = 0; i < 8; i++) {
            this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
        }
        for (let i = 8; i < 15; i++) {
            this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
        }
        this.setFunctionModule(8, this.size - 8, true);
    }

    private drawVersion(): void {
        if (this.version < 7) {
            return;
        }
        let rem = this.version;
        for (let i = 0; i < 12; i++) {
            rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
        }
        const bits = (this.version << 12) | rem;

        for (let i = 0; i < 18; i++) {
            const bit = getBit(bits, i);
            const a = this.size - 11 + (i % 3);
            const b = Math.floor(i / 3);
            this.setFunctionModule(a, b, bit);
            this.setFunctionModule(b, a, bit);
        }
    }

    private drawFinderPattern(x: number, y: number): void {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                const xx = x + dx;
                const yy = y + dy;
                if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
                    this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
                }
            }
        }
    }

    private drawAlignmentPattern(x: number, y: number): void {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
            }
        }
    }

    private setFunctionModule(x: number, y: number, isDark: boolean): void {
        this.modules[y][x] = isDark;
        this.isFunction[y][x] = true;
    }

    // ---- Correccion de errores (Reed-Solomon) ----

    private addEccAndInterleave(data: number[]): number[] {
        const ver = this.version;
        const ecl = this.errorCorrectionLevel;
        if (data.length !== QrCode.getNumDataCodewords(ver, ecl)) {
            throw new RangeError('Cantidad de datos invalida');
        }

        const numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
        const blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
        const rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
        const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
        const shortBlockLen = Math.floor(rawCodewords / numBlocks);

        const blocks: number[][] = [];
        const rsDiv = QrCode.reedSolomonComputeDivisor(blockEccLen);
        for (let i = 0, k = 0; i < numBlocks; i++) {
            const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
            k += dat.length;
            const ecc = QrCode.reedSolomonComputeRemainder(dat, rsDiv);
            if (i < numShortBlocks) {
                dat.push(0);
            }
            blocks.push(dat.concat(ecc));
        }

        const result: number[] = [];
        for (let i = 0; i < blocks[0].length; i++) {
            blocks.forEach((block, j) => {
                if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
                    result.push(block[i]);
                }
            });
        }
        return result;
    }

    private drawCodewords(data: number[]): void {
        let i = 0;
        for (let right = this.size - 1; right >= 1; right -= 2) {
            if (right === 6) {
                right = 5;
            }
            for (let vert = 0; vert < this.size; vert++) {
                for (let j = 0; j < 2; j++) {
                    const x = right - j;
                    const upward = ((right + 1) & 2) === 0;
                    const y = upward ? this.size - 1 - vert : vert;
                    if (!this.isFunction[y][x] && i < data.length * 8) {
                        this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                        i++;
                    }
                }
            }
        }
    }

    private applyMask(msk: number): void {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let invert: boolean;
                switch (msk) {
                    case 0: invert = (x + y) % 2 === 0; break;
                    case 1: invert = y % 2 === 0; break;
                    case 2: invert = x % 3 === 0; break;
                    case 3: invert = (x + y) % 3 === 0; break;
                    case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
                    case 5: invert = (x * y) % 2 + (x * y) % 3 === 0; break;
                    case 6: invert = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
                    case 7: invert = ((x + y) % 2 + (x * y) % 3) % 2 === 0; break;
                    default: throw new Error('Mascara invalida');
                }
                if (!this.isFunction[y][x] && invert) {
                    this.modules[y][x] = !this.modules[y][x];
                }
            }
        }
    }

    private getPenaltyScore(): number {
        let result = 0;
        const size = this.size;
        const modules = this.modules;

        // Filas
        for (let y = 0; y < size; y++) {
            let runColor = false;
            let runX = 0;
            const runHistory = [0, 0, 0, 0, 0, 0, 0];
            for (let x = 0; x < size; x++) {
                if (modules[y][x] === runColor) {
                    runX++;
                    if (runX === 5) {
                        result += 3;
                    } else if (runX > 5) {
                        result++;
                    }
                } else {
                    this.finderPenaltyAddHistory(runX, runHistory);
                    if (!runColor) {
                        result += this.finderPenaltyCountPatterns(runHistory) * 40;
                    }
                    runColor = modules[y][x];
                    runX = 1;
                }
            }
            result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * 40;
        }
        // Columnas
        for (let x = 0; x < size; x++) {
            let runColor = false;
            let runY = 0;
            const runHistory = [0, 0, 0, 0, 0, 0, 0];
            for (let y = 0; y < size; y++) {
                if (modules[y][x] === runColor) {
                    runY++;
                    if (runY === 5) {
                        result += 3;
                    } else if (runY > 5) {
                        result++;
                    }
                } else {
                    this.finderPenaltyAddHistory(runY, runHistory);
                    if (!runColor) {
                        result += this.finderPenaltyCountPatterns(runHistory) * 40;
                    }
                    runColor = modules[y][x];
                    runY = 1;
                }
            }
            result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * 40;
        }

        // Bloques 2x2 del mismo color
        for (let y = 0; y < size - 1; y++) {
            for (let x = 0; x < size - 1; x++) {
                const color = modules[y][x];
                if (
                    color === modules[y][x + 1] &&
                    color === modules[y + 1][x] &&
                    color === modules[y + 1][x + 1]
                ) {
                    result += 3;
                }
            }
        }

        // Balance entre negros y blancos
        let dark = 0;
        for (const rowArr of modules) {
            for (const cell of rowArr) {
                if (cell) {
                    dark++;
                }
            }
        }
        const total = size * size;
        const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
        result += k * 10;
        return result;
    }

    private getAlignmentPatternPositions(): number[] {
        if (this.version === 1) {
            return [];
        }
        const numAlign = Math.floor(this.version / 7) + 2;
        const step = this.version === 32
            ? 26
            : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
        const result = [6];
        for (let pos = this.size - 7; result.length < numAlign; pos -= step) {
            result.splice(1, 0, pos);
        }
        return result;
    }

    private finderPenaltyCountPatterns(runHistory: number[]): number {
        const n = runHistory[1];
        const core = n > 0 &&
            runHistory[2] === n &&
            runHistory[3] === n * 3 &&
            runHistory[4] === n &&
            runHistory[5] === n;
        return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0)
            + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
    }

    private finderPenaltyTerminateAndCount(currentRunColor: boolean, currentRunLength: number, runHistory: number[]): number {
        if (currentRunColor) {
            this.finderPenaltyAddHistory(currentRunLength, runHistory);
            currentRunLength = 0;
        }
        currentRunLength += this.size;
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        return this.finderPenaltyCountPatterns(runHistory);
    }

    private finderPenaltyAddHistory(currentRunLength: number, runHistory: number[]): void {
        if (runHistory[0] === 0) {
            currentRunLength += this.size;
        }
        runHistory.pop();
        runHistory.unshift(currentRunLength);
    }

    // ---- Helpers estaticos ----

    static encodeText(text: string): QrCode {
        const seg = QrSegment.makeBytes(toUtf8ByteArray(text));
        return QrCode.encodeSegments([seg]);
    }

    private static encodeSegments(segs: QrSegment[]): QrCode {
        const ecl = ECC_MEDIUM;
        let version = 1;
        let dataUsedBits = 0;
        for (; version <= 40; version++) {
            const dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
            const usedBits = QrSegment.getTotalBits(segs, version);
            if (usedBits <= dataCapacityBits) {
                dataUsedBits = usedBits;
                break;
            }
            if (version >= 40) {
                throw new RangeError('El texto es demasiado largo para un QR');
            }
        }

        const bb: number[] = [];
        for (const seg of segs) {
            appendBits(seg.mode.modeBits, 4, bb);
            appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
            for (const b of seg.getData()) {
                bb.push(b);
            }
        }

        const dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
        appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
        appendBits(0, (8 - (bb.length % 8)) % 8, bb);

        for (let padByte = 0xec; bb.length < dataCapacityBits; padByte ^= 0xec ^ 0x11) {
            appendBits(padByte, 8, bb);
        }

        const dataCodewords: number[] = [];
        while (dataCodewords.length * 8 < bb.length) {
            dataCodewords.push(0);
        }
        bb.forEach((b, i) => {
            dataCodewords[i >>> 3] |= b << (7 - (i & 7));
        });

        return new QrCode(version, ecl, dataCodewords, -1);
    }

    private static getNumRawDataModules(ver: number): number {
        let result = (16 * ver + 128) * ver + 64;
        if (ver >= 2) {
            const numAlign = Math.floor(ver / 7) + 2;
            result -= (25 * numAlign - 10) * numAlign - 55;
            if (ver >= 7) {
                result -= 36;
            }
        }
        return result;
    }

    private static getNumDataCodewords(ver: number, ecl: { ordinal: number }): number {
        return Math.floor(QrCode.getNumRawDataModules(ver) / 8)
            - QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver]
            * QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    }

    private static reedSolomonComputeDivisor(degree: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < degree - 1; i++) {
            result.push(0);
        }
        result.push(1);
        let root = 1;
        for (let i = 0; i < degree; i++) {
            for (let j = 0; j < result.length; j++) {
                result[j] = QrCode.reedSolomonMultiply(result[j], root);
                if (j + 1 < result.length) {
                    result[j] ^= result[j + 1];
                }
            }
            root = QrCode.reedSolomonMultiply(root, 0x02);
        }
        return result;
    }

    private static reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
        const result = divisor.map(() => 0);
        for (const b of data) {
            const factor = b ^ (result.shift() as number);
            result.push(0);
            divisor.forEach((coef, i) => {
                result[i] ^= QrCode.reedSolomonMultiply(coef, factor);
            });
        }
        return result;
    }

    private static reedSolomonMultiply(x: number, y: number): number {
        let z = 0;
        for (let i = 7; i >= 0; i--) {
            z = (z << 1) ^ ((z >>> 7) * 0x11d);
            z ^= ((y >>> i) & 1) * x;
        }
        return z;
    }

    // Tablas de la norma del QR (cantidad de bytes de ECC por bloque, etc.).
    private static readonly ECC_CODEWORDS_PER_BLOCK: number[][] = [
        [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    ];

    private static readonly NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
        [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
    ];
}

// Un segmento de datos del QR. Solo usamos modo "byte" (UTF-8).
class QrSegment {
    constructor(
        readonly mode: { modeBits: number; numCharCountBits: (v: number) => number },
        readonly numChars: number,
        private readonly bitData: number[],
    ) {}

    getData(): number[] {
        return this.bitData;
    }

    static makeBytes(data: number[]): QrSegment {
        const bb: number[] = [];
        for (const b of data) {
            appendBits(b, 8, bb);
        }
        const mode = {
            modeBits: 0x4,
            numCharCountBits: (ver: number) => (ver < 10 ? 8 : ver < 27 ? 16 : 16),
        };
        return new QrSegment(mode, data.length, bb);
    }

    static getTotalBits(segs: QrSegment[], version: number): number {
        let result = 0;
        for (const seg of segs) {
            const ccbits = seg.mode.numCharCountBits(version);
            result += 4 + ccbits + seg.getData().length;
        }
        return result;
    }
}

// Mete los bits mas bajos de "val" (cantidad "len") al final del array "bb".
function appendBits(val: number, len: number, bb: number[]): void {
    for (let i = len - 1; i >= 0; i--) {
        bb.push((val >>> i) & 1);
    }
}

// Devuelve el bit "i" de "x" (true si es 1).
function getBit(x: number, i: number): boolean {
    return ((x >>> i) & 1) !== 0;
}

// Pasa un texto a un array de bytes en UTF-8.
function toUtf8ByteArray(str: string): number[] {
    const utf8 = encodeURIComponent(str);
    const result: number[] = [];
    for (let i = 0; i < utf8.length; i++) {
        if (utf8.charAt(i) !== '%') {
            result.push(utf8.charCodeAt(i));
        } else {
            result.push(parseInt(utf8.substring(i + 1, i + 3), 16));
            i += 2;
        }
    }
    return result;
}

// ============================================================
//  Funcion publica: arma un <svg> (string) con el QR del texto.
//  - texto: lo que se va a codificar.
//  - borde: cuantos modulos en blanco dejar alrededor (margen).
//  Devuelve un string con el SVG listo para inyectar en el HTML.
// ============================================================
export function generarQrSvg(texto: string, borde = 2): string {
    const qr = QrCode.encodeText(texto);
    const dim = qr.size + borde * 2;

    // Vamos juntando los "cuadraditos" negros como un solo path.
    let parts = '';
    for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
            if (qr.getModule(x, y)) {
                parts += `M${x + borde},${y + borde}h1v1h-1z`;
            }
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" `
        + `stroke="none" width="100%" height="100%">`
        + `<rect width="100%" height="100%" fill="#ffffff"/>`
        + `<path d="${parts}" fill="#000000"/>`
        + `</svg>`;
}
