CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};
const salt = "00000000000000000005bcf4bcfe3a699dd7833839e593127885e2b1e80ceb10";
var hash = null,
    previousHash;

function getResult() {
    runLoop(true);
}

function runLoop(clear = false) {
    var parent = $("div#placeholder1");
    if (clear) {
        $(parent).empty();
        hash = $("input#inputHash").val();
    }
    for (var a = 0; a < 10; a++) {
        drawCard(parent);
        previousHash = String(hash);
        hash = String(CryptoJS.SHA256(hash));
    }
}

function drawCard(parent) {
    var lineHeight = 24;
    var rightSide = 120;
    var canvasWidth = 900;
    var canvasHeight = 350;
    var ctx = createCanvas($(parent), canvasWidth, canvasHeight, "#f8f8f8", true);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#999";
    var x = 10;
    if ($(parent).children().length > 1) {
        drawWrapText(ctx, "Use Sha256 to calculate a new hash from the previous hash.  Sha256 ( " + previousHash + " ) ", x, canvasWidth, lineHeight * 1, null, "  ");
    } else {
        drawWrapText(ctx, "The hash you provided.", x, canvasWidth, lineHeight * 1.5);
    }
    drawWrapText(ctx, "Salt is a constant", x, canvasWidth, lineHeight * 3.5);
    drawWrapText(ctx, "Use salt as key to do HmacSHA256 on hash to get seed.  HmacSHA256 ( hash , salt )", x, canvasWidth, lineHeight * 5.5, null, "  ");
    drawWrapText(ctx, "Starting from the left side of the seed, convert every 3 characters from hexadecimal to decimal, looking for the first number less than 3700.", x, canvasWidth, lineHeight * 7.5, null, "  ");
    drawWrapText(ctx, "Divide the number by 100 and round up to an integer.", x, canvasWidth, lineHeight * 12.5);
    var seed = hash;
    var hmac = CryptoJS.HmacSHA256(CryptoJS.enc.Hex.parse(seed), salt);
    seed = hmac.toString(CryptoJS.enc.Hex);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#000";
    drawWrapText(ctx, "Hash = " + hash, x, canvasWidth, lineHeight * 2.5);
    drawWrapText(ctx, "Salt = " + salt, x, canvasWidth, lineHeight * 4.5);
    drawWrapText(ctx, "Seed = " + seed, x, canvasWidth, lineHeight * 6.5);
    var len = Math.ceil(seed.length / 3);
    var cellWidth = (canvasWidth - 20) / len;
    var highlight = false;
    var result = 0;
    for (var a = 0; a < len; a++) {
        let _x = x + cellWidth * a;
        let str = seed.substr(a * 3, 3);
        var num = parseInt(str, 16);
        if (!highlight && num < 3700) {
            highlight = true;
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#999";
            ctx.fillRect(_x, 195, cellWidth, 80);
            ctx.strokeRect(_x, 195, cellWidth, 80);
            result = num;
        }
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#000";
        drawWrapText(ctx, str, _x, _x + cellWidth, lineHeight * 9, "center");
        ctx.font = "14px sans-serif";
        drawWrapText(ctx, num.toString(), _x, _x + cellWidth, lineHeight * 11, "center");
        _x += cellWidth / 2;
        ctx.strokeStyle = "#999";
        ctx.beginPath();
        ctx.moveTo(_x, 225);
        ctx.lineTo(_x, 245);
        ctx.stroke();
    }
    ctx.font = "16px sans-serif";
    var divResult = parseFloat((result / 100).toPrecision(10)).toFixed(10);
    var roundResult = Math.floor(divResult);
    drawWrapText(ctx, result + " / 100 = " + divResult + ", rounding = " + roundResult, x, canvasWidth, lineHeight * 13.5);
    ctx.fillStyle = "#666";
    ctx.font = "bold 34px sans-serif";
    drawWrapText(ctx, "Result:", 680, 680 + 200, lineHeight * 2.5, "center");
    ctx.font = "bold 70px sans-serif";
    drawWrapText(ctx, roundResult.toString(), 680, 680 + 200, lineHeight * 5.5, "center");
}

function drawWrapText(ctx, str, left, right, top, align = "left", cutter = " ") {
    var lines = getLines(ctx, str, right - left, cutter);
    var height = parseInt(ctx.font.match(/\d+/), 10);
    for (var a = 0; a < lines.length; a++) {
        var txtSize = ctx.measureText(lines[a]);
        var x = left;
        if (align == "right") {
            x = right - txtSize.width;
        } else if (align == "center") {
            x = left + (right - left - txtSize.width) / 2;
        }
        ctx.fillText(lines[a], x, top + height * a);
    }
}

function createCanvas(parent, width, height, color, visiable) {
    var canvas = document.createElement('canvas');
    if (!visiable) {
        $(canvas).hide();
    }
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.translate(0.5, 0.5);
    $(parent).append(canvas);
    return ctx;
}

function getLines(ctx, text, maxWidth, cutter = " ") {
    var words = text.split(cutter);
    var lines = [];
    var currentLine = words[0];
    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + cutter + word).width;
        if (width < maxWidth) {
            currentLine += cutter + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}