
function checkTextHeight(text, width, fontSize, fontType) {
    var height_cell_sup = 0;
    if(text != null) {
        var textHeight = fontType.heightAtSize(fontSize);
        var currentText = text;
        var resultText = [];
        var textWidth = (fontType != null) ? fontType.widthOfTextAtSize(currentText, fontSize) : width ;
        var textLength = 0;
        
        var previousWidth = textWidth;

        while(textWidth > width) {
            var text = reduceTextUntilWidthAndSpace(currentText, width, fontType, fontSize)
            resultText.push(text);
            textLength = text.length;
            currentText = currentText.substring(textLength, currentText.length);
            while(currentText.charAt(0) == ' ') {
                currentText = currentText.substring(1, currentText.length);
            } 
            
            textWidth = fontType.widthOfTextAtSize(currentText, fontSize);
            if(textWidth == previousWidth) {
                console.log("ERROR: can not reduce text width")
                textWidth = -1;
            }
            else {
                previousWidth = textWidth
            }

            if(textWidth < width) {
                resultText.push(currentText);
            }            
        }
        if(textWidth == -1) textWidth = previousWidth;

        console.log("calculating height")
    }

    return height_cell_sup;
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

function textToMultiline(text, fontSize, fontType, width) {
    var currentText = text;
    var resultText = [];
    var textWidth =  fontType.widthOfTextAtSize(currentText, fontSize);
    var textLength = 0;
    var previousWidth = textWidth;

    
    while(textWidth > width) {
        var text = reduceTextUntilWidthAndSpace(currentText, width, fontType, fontSize)
        resultText += "\n" + (text);
        textLength = text.length;
        currentText = currentText.substring(textLength, currentText.length);
        while(currentText.charAt(0) == ' ') {
            currentText = currentText.substring(1, currentText.length);
        }
        
        textWidth = fontType.widthOfTextAtSize(currentText, fontSize);
        if(textWidth == previousWidth) {
            console.log("ERROR: can not reduce text width")
            textWidth = -1;
        }
        else {
            previousWidth = textWidth
        }
        
        if(textWidth < width) {
            resultText += "\n" + (currentText);
        }
    }

    if(textWidth == -1) textWidth = previousWidth;
    if(resultText != "") return resultText;
    else return text;
}

exports.checkTextHeight = checkTextHeight;
exports.reduceTextUntilWidthAndSpace = reduceTextUntilWidthAndSpace;
exports.textToMultiline = textToMultiline;