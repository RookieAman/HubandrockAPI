const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit  = require('@pdf-lib/fontkit');
const fs = require('fs');

const defaultColor = rgb(0.07, 0.07, 0.07)
const defaultBorder = 0.1;

async function createTable(pdfDoc, pages, currentPage, x, y, width, height, rows, page_start, page_limit, url_template) {
    for(row of rows) {
        const {cp, h, y2} = await createRow(pdfDoc, currentPage, x, y, width, height, row.cells, page_start, page_limit, url_template)
        y = y2
        y = y + h;
        currentPage = cp;
    }
    return {cp: currentPage, y2: y}
}

exports.createTable = createTable;
async function createRow(pdfDoc, currentPage, x, y, widthRow, heightRow, cells, page_start, page_limit, url_template) {
    var cell_height = 0;
    for(const cell of cells) {
        var currentCellHeight = await checkCellHeight(cell.width, cell.height, cell)
        if(currentCellHeight > cell_height) cell_height = currentCellHeight;
    }
    if(cell_height==0) cell_height = heightRow;
    console.log("exists? " + y + " "+  cell_height + " " + page_limit)
    if(y + cell_height > page_limit) {
        console.log("exists new page")
        var x2 = x;
        for(const cell of cells) {
            await createCellWithoutText(pdfDoc, currentPage, x2, y, cell.width, cell.height, cell, 8)
            x2 = x2 + cell.width;
        }
        const pdfTemplate = await PDFDocument.load(fs.readFileSync(url_template))
        const [templatePage] = await pdfDoc.copyPages(pdfTemplate, [0]);
        currentPage = pdfDoc.addPage(templatePage);
        
        const { width, height } = currentPage.getSize()
        currentPage.moveTo(0, height);
        
        y = page_start
        x2 = x;
        for(const cell of cells) {
            await createCellWithoutText(pdfDoc, currentPage, x2, y, cell.width, cell.height, cell, 8)
            x2 = x2 + cell.width;
        }
        y += 8;
    }
    
    for(const cell of cells) {
        await createCell(pdfDoc, currentPage, x, y, cell.width, cell.height, cell, cell_height)
        x = x + cell.width;
    }

    return {cp: currentPage, h:cell_height, y2: y};
}

async function checkCellHeight(width, height, properties) {
    var height_cell_sup = height;
    if(properties.text) {
        var textHeight = properties.text.font.heightAtSize(properties.text.fontSize);
        var currentText = properties.text.text;
        var resultText = [];
        var textWidth = properties.text.font.widthOfTextAtSize(currentText, properties.text.fontSize);
        var textLength = 0;

        console.log(currentText + " " + textWidth + " " + width)
        
        while(textWidth > width) {
            var text = reduceTextUntilWidthAndSpace(currentText, width, properties.text.font, properties.text.fontSize)
            resultText.push(text);
            textLength = text.length;
            currentText = currentText.substring(textLength, currentText.length);
            while(currentText.charAt(0) == ' ') {
                currentText = currentText.substring(1, currentText.length);
            } 
            
            textWidth = properties.text.font.widthOfTextAtSize(currentText, properties.text.fontSize);

            
            if(textWidth < width) {
                resultText.push(currentText);
            }            
        }
        if(resultText.length > 0) {
            height_cell_sup = (textHeight + (height/4 - properties.text.fontSize / 3) + 3.5) * resultText.length - resultText.length * 3 /5
        }
    }

    console.log("return height: " + height_cell_sup)

    return height_cell_sup;
}

async function createCellWithoutText(pdfDoc, currentPage, x, y, width, height, properties, cell_height) {
    var currentProps = { 
        borderColor: (properties.borderColor) ? properties.borderColor : defaultColor,
        borderWidth: (properties.borderWidth) ? properties.borderWidth : defaultBorder,
    }
    if(properties.color) {
        currentProps['color'] = properties.color;
    }
    var path = "M " + x + " " + y + " l " + width + " " + 0 + " l " + 0 + " " + cell_height + " l " + -width + " " + 0 + " l " + 0 + " " + -cell_height;
    currentPage.drawSvgPath(path, currentProps);
}

exports.createCell = createCell;
async function createCell(pdfDoc, currentPage, x, y, width, height, properties, cell_height) {
    var currentProps = { 
        borderColor: (properties.borderColor) ? properties.borderColor : defaultColor,
        borderWidth: (properties.borderWidth) ? properties.borderWidth : defaultBorder,
    }
    

    if(properties.text) {
        var currentText = properties.text.text;
        var resultText = [];
        var textWidth = properties.text.font.widthOfTextAtSize(currentText, properties.text.fontSize);
        var textLength = 0;
        
        while(textWidth > width) {
            var text = reduceTextUntilWidthAndSpace(currentText, width, properties.text.font, properties.text.fontSize)
            resultText.push(text);
            textLength = text.length;
            currentText = currentText.substring(textLength, currentText.length);
            while(currentText.charAt(0) == ' ') {
                currentText = currentText.substring(1, currentText.length);
            }
            
            textWidth = properties.text.font.widthOfTextAtSize(currentText, properties.text.fontSize);
            if(textWidth < width) {
                resultText.push(currentText);
            }
        }

        if(resultText != "") properties.text.text = resultText;
    }

   if(properties.color) {
        //currentProps['color'] = properties.color;
        var path2 = "M " + x + " " + y 
                    + " l " + width + " " + 0 
                    + " l " + 0 + " " + cell_height 
                    + " l " + -width + " " + 0
                    + " l " + 0 + " " + -cell_height + "Z";

        currentPage.drawSvgPath(path2, {color: properties.color});
    }

    var x2 = x;
    var y2 = y;

    var path = "M " + x2 + " " + y2; 
    if (properties.borderTop && properties.borderTop == "none") {}
    else {
        path +=  " l " + width + " " + 0;
        currentPage.drawSvgPath(path, currentProps);
    }
    x2 += width;

    path = "M " + x2 + " " + y2; 
    if (properties.borderRight && properties.borderRight == "none") {}
    else {
        path +=  " l 0 " + cell_height;
        currentPage.drawSvgPath(path, currentProps);
    }
    y2 += cell_height;

    path = "M " + x2 + " " + y2; 
    if (properties.borderBottom && properties.borderBottom == "none") {}
    else {
        path +=  " l " + (-width) + " 0";
        currentPage.drawSvgPath(path, currentProps);
    }
    x2 -= width;

    path = "M " + x2 + " " + y2; 
    if (properties.borderLeft && properties.borderLeft == "none") {}
    else {
        path +=  " l 0 " + (-cell_height);
        currentPage.drawSvgPath(path, currentProps);
    }
    y2 -= height;

    if(properties.text) {
        //console.log(properties.text.text)
        var paddingTop = (properties.paddingTop)? properties.paddingTop : 0;
        var paddingLeft =(properties.paddingLeft)? properties.paddingLeft : 0;
        var paddingRight =(properties.paddingRight)? properties.paddingRight : 0;
        if(properties.textAlign && properties.textAlign == "left")
            insertTextInTheLeft(pdfDoc, currentPage, x + paddingLeft, y + paddingTop, width, height, properties.text);
        else if(properties.textAlign && properties.textAlign == "right")
            insertTextInTheRight(pdfDoc, currentPage, x + paddingRight, y + paddingTop, width, height, properties.text);
        else    
            insertTextInTheMiddle(pdfDoc, currentPage, x, y + paddingTop, width, height, properties.text);
    }
}

async function insertTextInTheMiddle(pdfDoc, currentPage, x, y, cellwidth, cellheight, text) {
    if(Array.isArray(text.text)) {
        
    }
    else {
        const textWidth = text.font.widthOfTextAtSize(text.text, text.fontSize);
        const textHeight = text.font.heightAtSize(text.fontSize);
        const {width, height} = currentPage.getSize();
        x = x + cellwidth / 2 - textWidth / 2;
        //y = y + text.fontSize - (cellheight /2 - text.fontSize / 2);
        y = y + textHeight + (cellheight/4 - text.fontSize / 3);
        currentPage.drawText(text.text, {
            x: x,
            y: height - y,
            size: text.fontSize,
            font: text.font,
            color: rgb(0.07, 0.07, 0.07)
        })
    }
}

async function insertTextInTheLeft(pdfDoc, currentPage, x, y, cellwidth, cellheight, text) {
    if(Array.isArray(text.text)) {
        for(textS of text.text) {
            const textWidth = text.font.widthOfTextAtSize(textS, text.fontSize);
            const textHeight = text.font.heightAtSize(text.fontSize);
            const {width, height} = currentPage.getSize();
            //y = y + text.fontSize - (cellheight /2 - text.fontSize / 2);
            y = y + textHeight + (cellheight/4 - text.fontSize / 3);
            currentPage.drawText(textS, {
                x: x,
                y: height - y,
                size: text.fontSize,
                font: text.font,
                color: rgb(0.07, 0.07, 0.07)
            })
            y+=2;
        }
    }
    else {
        const textWidth = text.font.widthOfTextAtSize(text.text, text.fontSize);
        const textHeight = text.font.heightAtSize(text.fontSize);
        const {width, height} = currentPage.getSize();
        //y = y + text.fontSize - (cellheight /2 - text.fontSize / 2);
        y = y + textHeight + (cellheight/4 - text.fontSize / 3);
        currentPage.drawText(text.text, {
            x: x,
            y: height - y,
            size: text.fontSize,
            font: text.font,
            color: rgb(0.07, 0.07, 0.07)
        })
    }
}


async function insertTextInTheRight(pdfDoc, currentPage, x, y, cellWidth, cellheight, text) {
    if(Array.isArray(text.text)) {
        for(textS of text.text) {
            const textWidth = text.font.widthOfTextAtSize(textS, text.fontSize);
            const textHeight = text.font.heightAtSize(text.fontSize);
            const {width, height} = currentPage.getSize();
            //y = y + text.fontSize - (cellheight /2 - text.fontSize / 2);
            y = y + textHeight + (cellheight/4 - text.fontSize / 3);
            currentPage.drawText(textS, {
                x: x - textWidth + cellWidth / 2,
                y: height - y,
                size: text.fontSize,
                font: text.font,
                color: rgb(0.07, 0.07, 0.07)
            })
            y+=2;
        }
    }
    else {
        const textWidth = text.font.widthOfTextAtSize(text.text, text.fontSize);
        console.log(textWidth)
        const textHeight = text.font.heightAtSize(text.fontSize);
        const {width, height} = currentPage.getSize();
        //y = y + text.fontSize - (cellheight /2 - text.fontSize / 2);
        y = y + textHeight + (cellheight/4 - text.fontSize / 3);
        currentPage.drawText(text.text, {
            x: x - textWidth + cellWidth / 2,
            y: height - y,
            size: text.fontSize,
            font: text.font,
            color: rgb(0.07, 0.07, 0.07)
        })
    }
}

function reduceTextUntilWidthAndSpace(text, cellWidth, font, fontSize, i = 0) {
    //console.log(text);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    if(text=="") return "";
    else if(textWidth < cellWidth && text.slice(-1) == ' ') {
        return text.substring(0, text.length -1);
    }
    else {
        return reduceTextUntilWidthAndSpace(text.substring(0, text.length -1), cellWidth, font, fontSize, i+1)
    }
}
