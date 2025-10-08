const marqueeContent = this.document.getElementById('marquee-content');
let messages = [];
let currentIndex = 0;
let tableNumber = 0;
let iframeId = '';
let urlParams = '';
let isLooking = false;
let DefaultImg = "../data/Default.jpg";
let images = [];
let imgLen;
let globalWidth;
let globalHeight;

document.addEventListener('DOMContentLoaded', () => {
    
    urlParams = new URLSearchParams(window.location.search);
    iframeId = urlParams.get('iframeId');
    if(iframeId == '1'){
        isLooking = true;
    }
});

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.navigator.msMaxTouchPoints > 0;
}

async function updateMarquee() {
    // 嘗試讀取文字檔
    try {
        const response = await fetch('../data/marquee_table_number.txt');
        const text = await response.text();
        const newMessages = text.split('\n').filter(line => line.trim() !== '');
        tableNumber = parseInt(iframeId);
        imgLen = 6;
        adjustScale();
        for (let k = 0; k < 3; k++){
            if (newMessages[0].startsWith("歡迎光臨")) {
                newMessages[0] = newMessages[0].substring(0,4)+"\n"+newMessages[0].substring(5,newMessages[0].length);
            }
            messages = messages.concat(newMessages[0]);
            newMessages[tableNumber] = newMessages[tableNumber].substring(0,newMessages[tableNumber].search("桌")+1)+"\n"+newMessages[tableNumber].substring(newMessages[tableNumber].search("桌")+2,newMessages[tableNumber].length);
            messages = messages.concat(newMessages[tableNumber]);
            for (let n = 0; n < imgLen/3; n++) {
                messages = messages.concat("img");
            }

        }
        // 清空跑馬燈內容
        marqueeContent.innerHTML = '';
        messages.forEach((message,n) => {
            const item = document.createElement('div');
            item.className = 'marquee-item';
            item.style.width = globalWidth + "px";
            item.style.height = globalHeight + "px";
            marqueeContent.appendChild(item);
            if (message == "img") {
                const img = document.createElement('img');
                img.classList.add('marquee-img');
                img.style.width = globalWidth + "px";
                img.style.height = globalHeight + "px";
                img.id = `${tableNumber}-${(Math.floor((n)/4))*2+(n)%4-2}`;
                updateImg(img);
                if (isMobile()){
                    img.ontouchstart = () => {imgTouchStart(img)};
                    img.ontouchmove = () => {imgTouchMove(img)};
                    img.ontouchend = () => {imgTouchEnd(img)};
                }
                else{
                    img.onmousedown = () => {imgTouchStart(img)};
                    img.onmousemove = () => {imgTouchMove(img)};
                    img.onmouseup = () => {imgTouchEnd(img)};
                }
                img.oncontextmenu = () => {return false};
                item.appendChild(img);
            }
            else {
                item.id = `text-item-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                if(n == 0){
                    createObjs(item, 0);
                }
                const textContainer = document.createElement('div');
                textContainer.classList.add('textContainer');
                item.appendChild(textContainer);
                textContainer.innerHTML = `<div>${message.split('\n')[0]}</div><div>${message.split('\n')[1]}</div>`
                textContainer.id = `textContainer-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                textContainer.style.width = globalWidth*0.9 + "px";
                const content = document.createElement('textarea');
                content.classList.add('textarea');
                content.style.width = globalWidth*0.9 + "px";
                content.value = message;
                item.appendChild(content);
                content.onfocus = () => {marqueeEditing(content, textContainer)};
                content.oninput = () => {marqueeTextSize(content, textContainer);};
                const span1 = document.createElement('span');
                const span2 = document.createElement('span');
                span1.textContent = message.split('\n')[0];
                span2.textContent = message.split('\n')[1];
                span1.classList.add("span1");
                span2.classList.add("span2");
                item.appendChild(span1);
                item.appendChild(span2);
                content.id = `${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                span1.id = `span1-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                span2.id = `span2-${tableNumber}-${(Math.floor((n+1)/4))*2+(n+1)%4-1}`;
                marqueeTextSize(content, textContainer);
                getColorIndex(content, textContainer)
                if(n == 0 || (n+1) % 4 == 1) {
                    textContainer.style.color = "#e9c46a";
                    span1.style.color = "#e9c46a";
                    span2.style.color = "#e9c46a";
                    textContainer.style.display = 'none';
                    span1.style.display = 'block';
                    span2.style.display = 'block';
                    setTimeout(function(){textContainer.style.display = 'flex'; span1.style.display = 'none'; span2.style.display = 'none';},1100);
                }
                else{
                    textContainer.style.color = "#D82924";
                }
            }
            
        });
    }
    catch (error) {
        console.error('無法讀取文字檔:', error);
    }
}

const textareas = document.getElementsByClassName('textarea');


var marquee_editing = false;

function marqueeEditing(content, textContainer) {
    textContainer.style.backgroundColor = "rgba(218, 218, 218, 0.25)";
    textContainer.style.backdropFilter = "blur(50px)";
    textContainer.style.borderRadius = '20px';
    textContainer.style.boxShadow = "0px 10px 24px 0px rgba(0, 0, 0, 0.18)";
    window.parent.postMessage({ type: "data", content: "hide"}, '*');
    textColorShow(content, textContainer);
    marquee_editing = true;

}

async function marqueeNotEditing(x, textContainer) {
    textContainer.style.backgroundColor = "rgba(0, 0, 0, 0)";
    textContainer.style.backdropFilter = "none";
    textContainer.style.borderRadius = '0px';
    textContainer.style.boxShadow = "none";
    window.parent.postMessage({ type: "data", content: "show"}, '*');
    if (!x || !x.id) {
        console.error("Invalid element:", x);
        return;
    }

    const idParts = x.id.split('-');
    if (idParts.length !== 2) {
        console.error("Invalid id format:", x.id);
        return;
    }

    const index = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1] % 2);
    const index3 = parseInt(idParts[1]);
    const newValue = x.value;

    try {
        // 1. 獲取現有數據
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        // 2. 更新數據
        if (index >= 0 && index < lines.length) {
            if (index2 == 0) {
                lines[0] = replaceNewlinesWithSpaces(newValue); // 只在保存到文件時替換換行符
            } else {
                lines[index] = replaceNewlinesWithSpaces(newValue);
            }
        } else {
            console.error("Invalid index:", index);
            return;
        }
        
        // 3. 保存到服務器
        const updatedText = lines.join('\n');
        const responsePost = await fetch('/save-marquee-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedText }),
        });

        if (!responsePost.ok) {
            throw new Error(`HTTP error! status: ${responsePost.status}`);
        }

        // 4. 更新所有相關文字元素
        ws.send(updatedText);
        await updateAllRelatedText(newValue, index3, index);
    } catch (error) {
        console.error("Error updating file:", error);
    }
    marquee_editing = false;
}

async function updateAllRelatedText(newText, index3, tableNumber) {
    const textLines = newText.split('\n');
    const line1 = textLines[0] || '';
    const line2 = textLines[1] || '';

    // 獲取所有相關元素
    const relatedTextareas = document.querySelectorAll('.textarea');

    relatedTextareas.forEach(textarea => {
        const textareaIdParts = textarea.id.split('-');
        const textareaTableNumber = parseInt(textareaIdParts[0]);
        const textareaIndex2 = parseInt(textareaIdParts[1]);

        // 只更新匹配的桌號和索引
        if (textareaTableNumber === tableNumber && textareaIndex2 % 2 === index3 % 2) {
            // 更新textarea
            textarea.value = newText;
            const textContainer = document.getElementById(`textContainer-${textareaTableNumber}-${textareaIndex2}`);

            // 調整字體大小
            marqueeTextSize(textarea, textContainer);
        }
    });
}

function marqueeTextSize(content, textContainer) {
    const maxWidth = globalWidth*0.9;
    const minFontSize = 12;
    const maxFontSize = maxWidth/8;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
            
    let fontSize = maxFontSize;
    
                
    const measureTextWidth = (text, fontSize) => {
        context.font = `${fontSize}px MyFont`;
        return context.measureText(text).width;
    };

    const lines = content.value.split('\n');
    lines.forEach(line => {
        const lineWidth = measureTextWidth(line, fontSize);                
        if (lineWidth > maxWidth) {
            fontSize = Math.max(minFontSize, (maxWidth / lineWidth) * maxFontSize);
        }
    });
    const idParts = content.id.split('-')
    const index = parseInt(idParts[0]);
    const index3 = parseInt(idParts[1]);

    const span1 = document.getElementById(`span1-${index}-${index3}`);
    const span2 = document.getElementById(`span2-${index}-${index3}`);

    // 更新textarea和spans的字體大小
    content.style.fontSize = `${fontSize}px`;
    textContainer.style.fontSize = `${fontSize}px`;
    span1.style.fontSize = `${fontSize}px`;
    span2.style.fontSize = `${fontSize}px`;
    getColorIndex(content, textContainer);
}


function replaceNewlinesWithSpaces(text) {
    return text.replace(/\r\n|\r|\n/g, ' ');
}

// 更新 textColorShow 函數以包含顏色選擇器
function textColorShow(content, textContainer) {
    const idParts = content.id.split('-');
    const index1 = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1]);
    const index3 = Math.floor(index2/2)*4 + index2 % 2;
    
    const existingSection = document.getElementById(`textColorSection-${index1}-${index2}`);
    if(existingSection) return;

    const g = document.createElement('div');
    g.classList.add('g');
    content.parentNode.appendChild(g);
    
    const newTextColorSection = document.createElement('section');
    newTextColorSection.classList.add("textColorSection");
    newTextColorSection.id = `textColorSection-${index1}-${index2}`;
    newTextColorSection.oncontextmenu = () => false;
    
    g.style.top = (index3)*globalHeight + (globalHeight - 646)/2 + 646 + "px";
    setTimeout(() => {g.style.top = (index3)*globalHeight + (globalHeight - 646)/2 + 646 + 50 + "px";},10);
    
    g.appendChild(newTextColorSection);

    const colorSelector = document.createElement('div');
    colorSelector.id = "colorSelector";
    newTextColorSection.appendChild(colorSelector);
    createColorPicker(newTextColorSection, content, textContainer);

    const setDefaultBtn = document.createElement('button');
    setDefaultBtn.classList.add("setDefaultBtn");
    const setDefaultBtnIcon = document.createElement("img");
    setDefaultBtnIcon.classList.add("setDefaultBtnIcon");
    setDefaultBtnIcon.src = "../data/icon/dark/reload.svg";
    setDefaultBtn.onclick = () => {setDefaultColor(setDefaultBtnIcon, content, textContainer)};
    g.appendChild(setDefaultBtn);
    setDefaultBtn.appendChild(setDefaultBtnIcon);

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('closeBtn');
    const closeBtnText = document.createElement('div');
    closeBtnText.textContent = "+";
    closeBtnText.style.rotate = "45deg";
    closeBtn.appendChild(closeBtnText);
    if(index2 % 2 == 1) {
        closeBtn.style.color = "#101010";
    }
    closeBtn.onclick = () => {
        content.style.transform = "translateY(0)";
        textContainer.style.transform = "translateY(0)";
        g.style.transform = "translateY(0)";
        
        saveColorIndex(content, textContainer);
        const modal = document.getElementById("color-picker-modal");
        if (modal.style.display == "none"){
            modal.remove();
            g.style.animation = 'textColorSectionOut 0.4s cubic-bezier(0.8,-0.25,0.4,1)';
            g.style.top = (index3)*globalHeight + (globalHeight - 646)/2 + 646 + "px";
            setTimeout(() => {
                marqueeNotEditing(content, textContainer);
                g.remove();
            }, 400);
        }
        else{
            newTextColorSection.style.height = '80px'
            document.getElementById("color-picker-button-text").style.rotate = "0deg";
            setTimeout(() => {
                g.style.animation = 'textColorSectionOut 0.4s cubic-bezier(0.8,-0.25,0.4,1)';
                g.style.top = (index3)*globalHeight + (globalHeight - 646)/2 + 646 + "px";
                modal.remove();
            }, 400);
            setTimeout(() => {

                modal.style.display = "none";
                marqueeNotEditing(content, textContainer);
                g.remove();
            }, 800);
        }
    };
    g.appendChild(closeBtn);
}

// 從 textContainer 中找到對應位置的顏色
function getColorFromTextContainer(textContainer, start, end) {
    // 用來計算純文字內容的位置
    function getTextNodesAndPositions(node) {
        let textNodes = [];
        let currentPosition = 0;

        function traverse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push({
                    node: node,
                    start: currentPosition,
                    end: currentPosition + node.textContent.length
                });
                currentPosition += node.textContent.length;
            } else {
                for (let child of node.childNodes) {
                    traverse(child);
                }
            }
        }

        traverse(node);
        return textNodes;
    }

    // 獲取所有文字節點和它們的位置
    const textNodesInfo = getTextNodesAndPositions(textContainer);

    // 找到目標位置對應的節點
    let targetNode = null;
    for (let nodeInfo of textNodesInfo) {
        if (nodeInfo.start <= start && start < nodeInfo.end) {
            targetNode = nodeInfo.node;
            break;
        }
    }

    if (!targetNode) return null;

    // 向上尋找帶有顏色樣式的父節點
    let currentNode = targetNode;
    while (currentNode && currentNode !== textContainer) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const color = window.getComputedStyle(currentNode).color;
            if (color) return color;
        }
        currentNode = currentNode.parentNode;
    }

    // 如果沒找到特定顏色，返回 textContainer 的顏色
    return window.getComputedStyle(textContainer).color;
}

// 從 textContainer 取得選取文字的顏色
function getSelectedTextColor(textContainer, selectionStart, selectionEnd) {
    const range = document.createRange();
    const textNode = textContainer.firstChild;
    
    if (!textNode) return null;
    
    range.setStart(textNode, selectionStart);
    range.setEnd(textNode, selectionEnd);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    const computedStyle = window.getComputedStyle(selection.anchorNode.parentElement);
    return computedStyle.color;
}

function startColorPicker(colorPickerBtn, content, textContainer) {
    const colorPickerBtnLogo = document.getElementById("colorPickerBtnLogo");
    colorPickerBtnLogo.style.rotate = '-45deg';
    const cursor = document.createElement("div");
    cursor.classList.add("color-picker-cursor");
    document.body.appendChild(cursor);

    function moveCursor(event) {
        cursor.style.left = event.clientX + "px";
        cursor.style.top = event.clientY + "px";
    }

    function pickColor(event) {
        html2canvas(document.body).then(canvas => {
            const context = canvas.getContext("2d");
            const x = event.clientX;
            const y = event.clientY;

            const pixel = context.getImageData(x, y, 1, 1).data;
            const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            applyColor(color, content, textContainer);
            colorPickerBtn.style.backgroundColor = color;

            colorPickerBtnLogo.style.rotate = '0deg';
            const brightness = Math.sqrt(
                0.299 * (pixel[0] * pixel[0]) +
                0.587 * (pixel[1] * pixel[1]) +
                0.114 * (pixel[2] * pixel[2])
            );
            colorPickerBtnLogo.style.filter = brightness < 130 ? "brightness(1)" : "brightness(0.15)";

            cursor.style.animation = 'colorPickerCursorOut 0.5s cubic-bezier(.31, .01, .66, -.59)';
            document.removeEventListener("mousemove", moveCursor);
            document.removeEventListener("mouseup", pickColor);
            document.removeEventListener("touchmove", moveCursor);
            document.removeEventListener("touchend", pickColor);
            setTimeout(() => {
                document.body.removeChild(cursor);
            }, 500);
        });
    }

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseup", pickColor);
    document.addEventListener("touchmove", moveCursor);
    document.addEventListener("touchend", pickColor);
}

const presetColors = ['#ffb703', '#e9c46a', '#d82924', '#1d3557', '#386641', '#101010', '#efefef'];
let currentColor;

// 建立顏色選擇器介面
function createColorPicker(textColorSection, content, textContainer) {
    // 當前顏色按鈕
    const currentColorBtn = document.createElement('button');
    currentColorBtn.classList.add('currentColorBtn');
    currentColorBtn.id = "currentColorBtn";
    textColorSection.appendChild(currentColorBtn);
    // 新增顏色提取器按鈕
    const colorPickerBtn = document.createElement("button");
    colorPickerBtn.classList.add("colorPickerBtn");
    const colorPickerBtnLogo = document.createElement('img');
    colorPickerBtnLogo.id = "colorPickerBtnLogo";
    colorPickerBtnLogo.src = "../data/icon/bright/picker.svg";
    colorPickerBtn.appendChild(colorPickerBtnLogo);
    colorPickerBtn.onclick = () => {startColorPicker(colorPickerBtn, content, textContainer);};
    textColorSection.appendChild(colorPickerBtn);

    // 預設顏色按鈕
    const presetContainer = document.createElement('div');
    presetContainer.style.display = 'flex';

    presetColors.forEach(color => {
        const presetBtn = document.createElement('button');
        presetBtn.style.backgroundColor = color;
        presetBtn.classList.add('presetBtn');
        presetBtn.id = `color-${color.substring(1, color.length)}`;
        presetBtn.onclick = () => {
            applyColor(color, content, textContainer);
            const currentColorSection = document.getElementById("color-info-current-color");
            currentColorSection.style.backgroundColor = color;
            const inputHex = document.getElementById("inputHex");
            inputHex.value = color.substring(1);
            inputHex.focus();
            inputHex.blur();
            currentColor = color;
        };
        presetContainer.appendChild(presetBtn);
    });

    textColorSection.appendChild(presetContainer);
    updateCurrentColor();

    // 更新顏色顯示的函數
    function updateCurrentColor() {
    const selectionStart = content.selectionStart;
    const selectionEnd = content.selectionEnd;
    const colorSelector = document.getElementById('colorSelector');

    if (selectionStart === selectionEnd) {
        // 單一游標位置
        const color = getColorFromTextContainer(textContainer, selectionStart, selectionStart + 1);
        if (color) {
            currentColorBtn.style.backgroundColor = color;
            colorSelector.style.left = (2+presetColors.indexOf(rgbToHex(color)))*80 + "px";
        }
    } else {
        // 文字選取範圍
        const color = getColorFromTextContainer(textContainer, selectionStart, selectionEnd);
        if (color) {
            currentColorBtn.style.backgroundColor = color;
            colorSelector.style.left = (2+presetColors.indexOf(rgbToHex(color)))*80 + "px";
        }
        }
    }
    
    
    // 監聽文字選取和游標位置變化
    content.addEventListener('select', updateCurrentColor);
    content.addEventListener('click', updateCurrentColor);
    content.addEventListener('keyup', updateCurrentColor);
    
    createGridColorPicker(textColorSection, content, textContainer);
}

let isDraggingColorWheel = false;

function createGridColorPicker(textColorSection, content, textContainer) {
    // 創建模態框
    const modal = document.createElement('div');
    modal.classList.add('color-picker-modal');
    modal.id = 'color-picker-modal';
    const index = parseInt(content.id.split('-')[1]);
    const index2 = Math.floor(index/2)*4 + index % 2;
    // modal.style.top = (index2)*globalHeight + (globalHeight - 516)/2 + 516 + 100 + 60 - 252 + "px";
    // modal.style.left = (globalWidth - 1000) / 2 + 80*10 - 318 + "px";
    modal.style.display = 'none';

    // 創建標籤容器
    const tabContainer = document.createElement('div');
    tabContainer.classList.add('tab-container');

    // 創建標籤按鈕
    const tabSelector = document.createElement('div');
    tabSelector.classList.add('tab-selector');
    tabSelector.style.transform = "translateX(-50px)"
    tabSelector.textContent = "　　";
    tabSelector.id = 'tab-selector';
    tabContainer.appendChild(tabSelector);
    ['網格', '色環'].forEach(tabName => {
        const tab = document.createElement('button');
        tab.classList.add('tab-button');
        tab.textContent = tabName;
        tab.onclick = () => switchTab(tabName, modal);
        tab.oncontextmenu = () => {return false};
        if (tabName === '網格') {
            tab.classList.add('active');
        }
        tabContainer.appendChild(tab);
    });

    const group1 = document.createElement('div');
    group1.classList.add('g');

    // 創建內容容器
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('content-container');

    // 創建網格容器
    const colorGrid = document.createElement('div');
    colorGrid.classList.add('color-grid');
    generateColorGrid(colorGrid, content, textContainer);

    // 創建色環容器
    const colorWheelContainer = document.createElement('div');
    colorWheelContainer.classList.add('color-wheel-container');
    colorWheelContainer.id = 'color-wheel-container';
    colorWheelContainer.style.display = 'flex';
    const wheelPicker = createColorWheel(colorWheelContainer, content, textContainer);
    wheelPicker.id = 'colorWheel';

    const colorInfoContainer = document.createElement('div');
    colorInfoContainer.classList.add("color-info-container");

    const currentColorSection = document.createElement('div');
    currentColorSection.classList.add("color-info-current-color");
    currentColorSection.id = "color-info-current-color";
    colorInfoContainer.appendChild(currentColorSection);


    const hexContainer = document.createElement("div");
    hexContainer.classList.add("color-info-hex-container");
    colorInfoContainer.appendChild(hexContainer);

    const labelHex = document.createElement("label");
    labelHex.textContent = "#";
    labelHex.classList.add("color-info-labels");
    hexContainer.appendChild(labelHex);

    const inputHex = document.createElement('input');
    inputHex.type = "text";
    inputHex.classList.add('color-info-inputs');
    inputHex.id = "inputHex";
    labelHex.appendChild(inputHex);

    const otherColorCodeContainer = document.createElement('div');
    otherColorCodeContainer.classList.add('color-info-other-container');
    colorInfoContainer.appendChild(otherColorCodeContainer);

    const rgbContainer = document.createElement("div");
    rgbContainer.classList.add("color-info-rgb-container");
    otherColorCodeContainer.appendChild(rgbContainer);

    const labelRGB_R = document.createElement("label");
    labelRGB_R.textContent = "R";
    labelRGB_R.classList.add("color-info-labels");
    rgbContainer.appendChild(labelRGB_R);

    const inputRGB_R = document.createElement('input');
    inputRGB_R.type = "text";
    inputRGB_R.classList.add('color-info-inputs');
    labelRGB_R.appendChild(inputRGB_R);

    const labelRGB_G = document.createElement("label");
    labelRGB_G.textContent = "G";
    labelRGB_G.classList.add("color-info-labels");
    rgbContainer.appendChild(labelRGB_G);

    const inputRGB_G = document.createElement('input');
    inputRGB_G.type = "text";
    inputRGB_G.classList.add('color-info-inputs');
    labelRGB_G.appendChild(inputRGB_G);

    const labelRGB_B = document.createElement("label");
    labelRGB_B.textContent = "B";
    labelRGB_B.classList.add("color-info-labels");
    rgbContainer.appendChild(labelRGB_B);

    const inputRGB_B = document.createElement('input');
    inputRGB_B.type = "text";
    inputRGB_B.classList.add('color-info-inputs');
    labelRGB_B.appendChild(inputRGB_B);

    const hslContainer = document.createElement("div");
    hslContainer.classList.add("color-info-hsl-container");
    otherColorCodeContainer.appendChild(hslContainer);

    const labelHSL_H = document.createElement("label");
    labelHSL_H.textContent = "H";
    labelHSL_H.classList.add("color-info-labels");
    hslContainer.appendChild(labelHSL_H);

    const inputHSL_H = document.createElement('input');
    inputHSL_H.type = "text";
    inputHSL_H.id = "inputHSL_H";
    inputHSL_H.classList.add('color-info-inputs');
    labelHSL_H.appendChild(inputHSL_H);

    const labelHSL_S = document.createElement("label");
    labelHSL_S.textContent = "S";
    labelHSL_S.classList.add("color-info-labels");
    hslContainer.appendChild(labelHSL_S);

    const inputHSL_S = document.createElement('input');
    inputHSL_S.type = "text";
    inputHSL_S.id = "inputHSL_S";
    inputHSL_S.classList.add('color-info-inputs');
    labelHSL_S.appendChild(inputHSL_S);

    const labelHSL_L = document.createElement("label");
    labelHSL_L.textContent = "L";
    labelHSL_L.classList.add("color-info-labels");
    hslContainer.appendChild(labelHSL_L);

    const inputHSL_L = document.createElement('input');
    inputHSL_L.type = "text";
    inputHSL_L.id = "inputHSL_L";
    inputHSL_L.classList.add('color-info-inputs');
    labelHSL_L.appendChild(inputHSL_L);

    const cmykContainer = document.createElement("div");
    cmykContainer.classList.add("color-info-hsl-container");
    otherColorCodeContainer.appendChild(cmykContainer);

    const labelCMYK_C = document.createElement("label");
    labelCMYK_C.textContent = "C";
    labelCMYK_C.classList.add("color-info-labels");
    cmykContainer.appendChild(labelCMYK_C);

    const inputCMYK_C = document.createElement('input');
    inputCMYK_C.type = "text";
    inputCMYK_C.classList.add('color-info-inputs');
    labelCMYK_C.appendChild(inputCMYK_C);

    const labelCMYK_M = document.createElement("label");
    labelCMYK_M.textContent = "M";
    labelCMYK_M.classList.add("color-info-labels");
    cmykContainer.appendChild(labelCMYK_M);

    const inputCMYK_M = document.createElement('input');
    inputCMYK_M.type = "text";
    inputCMYK_M.classList.add('color-info-inputs');
    labelCMYK_M.appendChild(inputCMYK_M);

    const labelCMYK_Y = document.createElement("label");
    labelCMYK_Y.textContent = "Y";
    labelCMYK_Y.classList.add("color-info-labels");
    cmykContainer.appendChild(labelCMYK_Y);

    const inputCMYK_Y = document.createElement('input');
    inputCMYK_Y.type = "text";
    inputCMYK_Y.classList.add('color-info-inputs');
    labelCMYK_Y.appendChild(inputCMYK_Y);

    const labelCMYK_K = document.createElement("label");
    labelCMYK_K.textContent = "K";
    labelCMYK_K.classList.add("color-info-labels");
    cmykContainer.appendChild(labelCMYK_K);

    const inputCMYK_K = document.createElement('input');
    inputCMYK_K.type = "text";
    inputCMYK_K.classList.add('color-info-inputs');
    labelCMYK_K.appendChild(inputCMYK_K);

    // 解析 RGB 字符串
    function parseRGB(color) {
        // 處理 rgb(r, g, b) 格式
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
        }
        
        // 處理 hex 格式
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            if (hex.length === 6) {
                return [
                    parseInt(hex.substring(0, 2), 16),
                    parseInt(hex.substring(2, 4), 16),
                    parseInt(hex.substring(4, 6), 16)
                ];
            }
        }
        
        // 如果無法解析，返回黑色
        return [0, 0, 0];
    }

    // RGB 轉 HEX
    function rgbToHex(rgb) {
        return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
    }

    // RGB 轉 CMYK
    function rgbToCmyk(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        
        const k = 1 - Math.max(r, g, b);
        if (k === 1) {
            return [0, 0, 0, 1];
        }
        
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        
        return [c, m, y, k];
    }

    // CMYK 轉 RGB
    function cmykToRgb(cmyk) {
        const c = cmyk[0], m = cmyk[1], y = cmyk[2], k = cmyk[3];
        
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));
        
        return [r, g, b];
    }

    // HEX 輸入框變更事件
    inputHex.addEventListener('input', () => {
        const hexValue = inputHex.value;
        if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
            const color = `rgb(${parseRGB(`#${hexValue}`)[0]}, ${parseRGB(`#${hexValue}`)[1]}, ${parseRGB(`#${hexValue}`)[2]})`;
            updateAllColorInfo(color);
        }
    });

    inputHex.onblur = () => {
        const hexValue = inputHex.value;
        if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
            const color = `rgb(${parseRGB(`#${hexValue}`)[0]}, ${parseRGB(`#${hexValue}`)[1]}, ${parseRGB(`#${hexValue}`)[2]})`;
            updateAllColorInfo(color);
        }
    }

    // RGB 輸入框變更事件
    [inputRGB_R, inputRGB_G, inputRGB_B].forEach(input => {
        input.addEventListener('blur', () => {
            const r = parseInt(inputRGB_R.value) || 0;
            const g = parseInt(inputRGB_G.value) || 0;
            const b = parseInt(inputRGB_B.value) || 0;
            
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                const color = `rgb(${r}, ${g}, ${b})`;
                updateAllColorInfo(color);
            }
        });
    });

    [inputHSL_H, inputHSL_S, inputHSL_L].forEach(input => {
        input.addEventListener('blur', () => {
            const h = parseInt(inputHSL_H.value)/360 || 0;
            const s = parseInt(inputHSL_S.value)/100 || 0;
            const l = parseInt(inputHSL_L.value)/100 || 0;
            
            if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
                const color = `rgb(${hslToRgb(h, s, l)[0]}, ${hslToRgb(h, s, l)[1]}, ${hslToRgb(h, s, l)[2]})`;
                updateAllColorInfo(color);
            }
        });
    });

    // CMYK 輸入框變更事件
    [inputCMYK_C, inputCMYK_M, inputCMYK_Y, inputCMYK_K].forEach(input => {
        input.addEventListener('blur', () => {
            const c = parseInt(inputCMYK_C.value) || 0;
            const m = parseInt(inputCMYK_M.value) || 0;
            const y = parseInt(inputCMYK_Y.value) || 0;
            const k = parseInt(inputCMYK_K.value) || 0;
            
            if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
                const rgbValues = cmykToRgb([c/100, m/100, y/100, k/100]);
                const color = `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
                updateAllColorInfo(color);
            }
        });
    });

    // 設置一個方法用於更新 currentColorSection 的顏色
    currentColorSection.updateColor = function(color) {
        this.style.backgroundColor = color;
        updateAllColorInfo(color);
    };

    // 初始化顏色（假設有一個初始顏色）
    const initialColor = document.getElementById("currentColorBtn").style.backgroundColor; // 或從其他地方獲取
    currentColorSection.updateColor(initialColor);

    // 建立一個函數來更新所有顏色相關元素
    function updateAllColorInfo(color) {
        
        // 更新當前顏色區域
        
        currentColorSection.style.backgroundColor = color;
        
        // 解析顏色值
        const rgbValues = parseRGB(color);
        const hslValues = rgbToHsl(color);
        const hexValue = rgbToHex(rgbValues);
        const cmykValues = rgbToCmyk(rgbValues);
        
        // 更新 HEX 輸入框
        inputHex.value = hexValue.substring(1); // 移除 '#' 符號
        
        // 更新 RGB 輸入框
        inputRGB_R.value = rgbValues[0];
        inputRGB_G.value = rgbValues[1];
        inputRGB_B.value = rgbValues[2];
        
        // 更新 HSL 輸入框
        inputHSL_H.value = Math.round(hslValues[0] * 360);
        inputHSL_S.value = Math.round(hslValues[1] * 100);
        inputHSL_L.value = Math.round(hslValues[2] * 100);
        
        // 更新 CMYK 輸入框
        inputCMYK_C.value = Math.round(cmykValues[0] * 100);
        inputCMYK_M.value = Math.round(cmykValues[1] * 100);
        inputCMYK_Y.value = Math.round(cmykValues[2] * 100);
        inputCMYK_K.value = Math.round(cmykValues[3] * 100);

        
        // 更新色輪
        if(isDraggingColorWheel == false){
            setTimeout(() => {
                const hueAnchor = document.getElementById("hue-anchor");
                const saturationBrightnessAnchor = document.getElementById('saturation-brightness-anchor');
                updateColorPickerByValue(color, colorWheelContainer, wheelPicker, hueAnchor, saturationBrightnessAnchor, content, textContainer);
            }, 0);
        }
    }

    // 組裝模態框
    modal.appendChild(tabContainer);
    contentContainer.appendChild(colorGrid);
    contentContainer.appendChild(colorWheelContainer);
    group1.appendChild(contentContainer);
    modal.appendChild(group1);
    modal.appendChild(colorInfoContainer);
    textColorSection.appendChild(modal);

    // 創建開啟按鈕
    const openButton = document.createElement('button');
    openButton.classList.add('color-picker-button');
    openButton.id = 'color-picker-button';
    const openButtonText = document.createElement('div');
    openButton.appendChild(openButtonText);
    openButtonText.classList.add('color-picker-button-text');
    openButtonText.id = 'color-picker-button-text';
    openButtonText.textContent = "+";
    openButtonText.style.rotate = "0deg";
    const openButtonCircle = document.createElement('div');
    openButtonCircle.classList.add('color-picker-button-circle');
    openButton.appendChild(openButtonCircle);
    openButton.onclick = () => {
        const g = content.parentNode.querySelectorAll('.g')[0];
        content.style.transform = modal.style.display === 'none' ? "translateY(-252px)" : "translateY(0)";
        textContainer.style.transform = modal.style.display === 'none' ? "translateY(-252px)" : "translateY(0)";
        textColorSection.style.height = modal.style.display === 'none' ? "457px" : "80px";
        g.style.transform = modal.style.display === 'none' ? "translateY(-252px)" : "translateY(0)";
        if(modal.style.display === "none"){
            modal.style.animation = "colorPickerModalIn 0.4s";
            modal.style.display = "block";
        }
        else {
            modal.style.animation = "colorPickerModalOut 0.4s";
            setTimeout(() => {
                modal.style.display = "none";
            }, 400);
        }
        openButtonText.style.rotate = openButtonText.style.rotate === "0deg" ? "45deg" : "0deg";
    };
    textColorSection.appendChild(openButton);
}


function generateColorGrid(container, content, textContainer) {
    // 定義基礎色相
    const hues = [
        { start: 0, end: 0 },    // 紅色
        { start: 25, end: 25 },  // 橙紅
        { start: 35, end: 35 },  // 橙色
        { start: 45, end: 45 },  // 橙黃
        { start: 60, end: 60 },  // 黃色
        { start: 90, end: 90 },  // 黃綠
        { start: 120, end: 120 }, // 綠色
        { start: 180, end: 180 }, // 青色
        { start: 210, end: 210 }, // 青藍
        { start: 240, end: 240 }, // 藍色
        { start: 270, end: 270 }, // 藍紫
        { start: 300, end: 300 }, // 紫色
        { start: 330, end: 330 }  // 紫紅
    ];

    // 定義亮度和飽和度組合
    const variations = [
        { s: 0, l: 80 },     // 灰色
        { s: 100, l: 20 },  // 最深色
        { s: 100, l: 30 },  // 更深色
        { s: 100, l: 40 },  // 深色
        { s: 100, l: 50 },  // 純色
        { s: 100, l: 60 },  // 中深色
        { s: 75, l: 70 },   // 中色
        { s: 50, l: 80 },   // 中淺色
        { s: 25, l: 90 }   // 淺色
    ];

    // 清空容器
    container.innerHTML = '';

    // 為每個色相創建顏色變化
    variations.forEach((variation, i) => {
        hues.forEach((hue, j) => {
            const cell = document.createElement('button');
            cell.classList.add('color-cell');
            
            // 特殊處理黑白灰色
            if (variation.s === 0) {
                // 白色到黑色過度
                cell.style.backgroundColor = `hsl(0, ${variation.s}%, ${(330-hue.start)/330*100}%)`;
            } else {
                // 一般顏色
                cell.style.backgroundColor = `hsl(${hue.start}, ${variation.s}%, ${variation.l}%)`;
            }

            if (i == 0 && j == 0){
                cell.style.borderTopLeftRadius = "15px";
            }
            else if (i == 0 && j == hues.length-1){
                cell.style.borderTopRightRadius = "15px"
            }
            else if (i == variations.length-1 && j == 0){
                cell.style.borderBottomLeftRadius = "15px";
            }
            else if (i == variations.length -1 && j == hues.length -1){
                cell.style.borderBottomRightRadius = "15px";
            }

            // 添加點擊事件
            cell.onclick = () => {
                const color = cell.style.backgroundColor;
                if (typeof onColorSelect === 'function') {
                    onColorSelect(color);
                }
                applyColor(color, content, textContainer);
                const colorSelector = document.getElementById('colorSelector');
                const openBtn = document.getElementById("color-picker-button");
                openBtn.style.backgroundColor = color;
                colorSelector.style.left = 9*80 + "px";
                const currentColorSection = document.getElementById("color-info-current-color");
                currentColorSection.style.backgroundColor = color;
                const inputHex = document.getElementById("inputHex");
                inputHex.value = rgbToHex(color).substring(1);
                inputHex.focus();
                inputHex.blur();
                currentColor = color;
                const openButtonText = document.getElementById("color-picker-button-text");
                let colorArray = color.toString().split('(')[1].split(')')[0].split(',');
                let r = parseInt(colorArray[0]);
                let g = parseInt(colorArray[1]);
                let b = parseInt(colorArray[2]);
                const brightness = Math.sqrt(
                    0.299 * (r * r) +
                    0.587 * (g * g) +
                    0.114 * (b * b)
                );
                openButtonText.style.color = brightness < 130 ? "#efefef" : "#101010";
            };

            // 添加懸停效果的樣式
            cell.style.transition = 'transform 0.1s';
            cell.addEventListener('mouseenter', () => {
                cell.style.transform = 'scale(1.1)';
                cell.style.zIndex = '1';
            });
            cell.addEventListener('mouseleave', () => {
                cell.style.transform = 'scale(1)';
                cell.style.zIndex = '0';
            });

            container.appendChild(cell);
        });
    });
}


function createColorWheel(container, content, textContainer) {
    const canvas = document.createElement('canvas');
    canvas.width = 297;
    canvas.height = 297;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const radius = canvas.width / 2 - 20;

    // 繪製色環
    for (let i = 0; i < 360; i++) {
        const angle = i * Math.PI / 180;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);  // 畫很小的圓來模擬像素
        ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
        ctx.fill();
    }
    // 繪製中間的方形選色區域
    const squareSize = ((radius - 20)*2)/Math.sqrt(2) - 24;
    const squareX = center.x - squareSize / 2;
    const squareY = center.y - squareSize / 2;

    const containerOffsetLeft = container.offsetLeft + 82
    const containerOffsetTop = container.offsetTop + 16;

    const colorWheelOffsetLeft = canvas.offsetLeft + 461; // 色環的 offsetLeft
    const colorWheelOffsetTop = canvas.offsetTop;  // 色環的 offsetTop

    const squareOffsetLeft = squareX; // 中間方格的 offsetLeft (相對於色環)
    const squareOffsetTop = squareY;  // 中間方格的 offsetTop (相對於色環)

    // 全域變數儲存目前色相
    const currentColorBtn = document.getElementById("currentColorBtn");
    currentColor = currentColorBtn.style.backgroundColor;
    let currentHue = rgbToHsl(currentColor)[0] * 360;
    
    updateSquareColor(currentHue);
    
    const hueAnchor = document.createElement('div');
    hueAnchor.id = "hue-anchor";
    container.appendChild(hueAnchor);
    const saturationBrightnessAnchor = document.createElement('div');
    saturationBrightnessAnchor.id = 'saturation-brightness-anchor';
    container.appendChild(saturationBrightnessAnchor);
    
    const saturation = rgbToHsl(currentColor)[1];
    const brightness = rgbToHsl(currentColor)[2];

    
    // 設定色相錨點初始位置
    const hueAngle = currentHue * Math.PI / 180;
    hueAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + center.x + radius * Math.cos(hueAngle) - 28 + 'px';
    hueAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + center.y + radius * Math.sin(hueAngle) - 28 + 'px';
    const hueColor = `hsl(${currentHue}, 100%, 50%)`;
    hueAnchor.style.backgroundColor = hueColor;

    // 設定飽和度/明度錨點初始位置
    saturationBrightnessAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + squareOffsetLeft + (saturation + Math.min(0, (0.5 - brightness))) * squareSize - 12 + 'px';
    saturationBrightnessAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + squareOffsetTop + Math.max(0, (0.5 - brightness)) * squareSize - 12 + 'px';
    const tempColor = `hsl(${currentHue}, ${saturation * 100}%, ${brightness*2 * 50 + (1 - saturation) * 50}%)`;
    saturationBrightnessAnchor.style.backgroundColor = tempColor;

    let isDraggingHue = false;
    let isDraggingSaturationBrightness = false;
    let currentEvent = null; // 記錄當前觸發的事件類型 (mouse 或 touch)

    function handleStart(event) {
        event.preventDefault(); // 阻止預設的觸控行為，例如滾動
        currentEvent = event.type.startsWith('mouse') ? 'mouse' : 'touch';
        isDraggingColorWheel = true;
        const target = event.target;
        if (target === hueAnchor) {
            isDraggingHue = true;
        } else if (target === saturationBrightnessAnchor) {
            isDraggingSaturationBrightness = true;
        }
    }

    function handleMove(event) {
        event.preventDefault(); // 阻止預設的觸控行為

        if (currentEvent === 'touch') {
            event = event.touches[0]; // 取得第一個觸控點
        }
        if (isDraggingHue) {
            const rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            const dx = x - center.x;
            const dy = y - center.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            currentHue = (angle + 360) % 360;
          
            // 限制錨點在色環上移動
            const distance = Math.sqrt(dx * dx + dy * dy);
              x = center.x + radius * Math.cos(angle * Math.PI / 180);
              y = center.y + radius * Math.sin(angle * Math.PI / 180);
          
            hueAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + x - hueAnchor.offsetWidth / 2 + 'px';
            hueAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + y - hueAnchor.offsetHeight / 2 + 'px';
            const hueColor = `hsl(${currentHue}, 100%, 50%)`;
            hueAnchor.style.backgroundColor = hueColor;
            updateSquareColor(currentHue);
            // 保持方格錨點的飽和度和亮度，只更新色相
            // 獲取方格錨點當前的位置來計算飽和度和亮度
            const sqLeft = parseInt(saturationBrightnessAnchor.style.left) - containerOffsetLeft - colorWheelOffsetLeft - squareOffsetLeft + saturationBrightnessAnchor.offsetWidth / 2;
            const sqTop = parseInt(saturationBrightnessAnchor.style.top) - containerOffsetTop - colorWheelOffsetTop - squareOffsetTop + saturationBrightnessAnchor.offsetHeight / 2;
            
            let saturation = sqLeft / squareSize;
            let brightness = 1 - (sqTop / squareSize);
            
            // 限制值在0-1範圍內
            saturation = Math.max(0, Math.min(1, saturation));
            brightness = Math.max(0, Math.min(1, brightness));
            
            // 使用新的色相但保持原有的飽和度和亮度
            const lightnessValue = brightness * (2 - saturation) * 50;
            const color = `hsl(${currentHue}, ${saturation * 100}%, ${lightnessValue}%)`;
            saturationBrightnessAnchor.style.backgroundColor = color;
            const currentColorSection = document.getElementById("color-info-current-color");
            currentColorSection.style.backgroundColor = color;
            const openBtn = document.getElementById("color-picker-button");
            openBtn.style.backgroundColor = color;
            const inputHSL_H = document.getElementById("inputHSL_H");
            const inputHSL_S = document.getElementById("inputHSL_S");
            const inputHSL_L = document.getElementById("inputHSL_L");
            inputHSL_H.value = currentHue;
            inputHSL_S.value = saturation*100;
            inputHSL_L.value = lightnessValue;
            inputHSL_H.focus();
            inputHSL_H.blur();
            inputHSL_S.focus();
            inputHSL_S.blur();
            inputHSL_L.focus();
            inputHSL_L.blur();
            currentColor = currentColorSection.style.backgroundColor;
            
            applyColor(currentColorSection.style.backgroundColor, content, textContainer);
          } else if (isDraggingSaturationBrightness) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const relativeX = x - squareX;
            const relativeY = y - squareY;
          
            let saturation = relativeX / squareSize;
            let brightness = 1 - (relativeY / squareSize);
          
            // 限制錨點在方格內移動
            saturation = Math.max(0, Math.min(1, saturation));
            brightness = Math.max(0, Math.min(1, brightness));
            saturationBrightnessAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + squareOffsetLeft + saturation * squareSize - saturationBrightnessAnchor.offsetWidth / 2 + 'px';
            saturationBrightnessAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + squareOffsetTop + (1 - brightness) * squareSize - saturationBrightnessAnchor.offsetHeight / 2 + 'px';

             // 新的亮度計算公式
            const lightnessValue = brightness * (2 - saturation) * 50;
            const color = `hsl(${currentHue}, ${saturation * 100}%, ${lightnessValue}%)`;
            saturationBrightnessAnchor.style.backgroundColor = color;
            const currentColorSection = document.getElementById("color-info-current-color");
            currentColorSection.style.backgroundColor = color;
            const openBtn = document.getElementById("color-picker-button");
            openBtn.style.backgroundColor = color;
            const inputHSL_H = document.getElementById("inputHSL_H");
            const inputHSL_S = document.getElementById("inputHSL_S");
            const inputHSL_L = document.getElementById("inputHSL_L");
            inputHSL_H.value = currentHue;
            inputHSL_S.value = saturation*100;
            inputHSL_L.value = lightnessValue;
            inputHSL_H.focus();
            inputHSL_H.blur();
            inputHSL_S.focus();
            inputHSL_S.blur();
            inputHSL_L.focus();
            inputHSL_L.blur();
            currentColor = currentColorSection.style.backgroundColor;
          }
    }
      
    function handleEnd(event) {
        event.preventDefault();
        isDraggingHue = false;
        isDraggingSaturationBrightness = false;
        isDraggingColorWheel = false;
        currentEvent = null;
    }

    hueAnchor.addEventListener('mousedown', handleStart);
    hueAnchor.addEventListener('touchstart', handleStart);

    saturationBrightnessAnchor.addEventListener('mousedown', handleStart);
    saturationBrightnessAnchor.addEventListener('touchstart', handleStart);

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('touchmove', handleMove);

    container.addEventListener('mouseup', handleEnd);
    container.addEventListener('touchend', handleEnd);
    canvas.addEventListener('click', handleClick); // 監聽 canvas 的點擊事件
    canvas.addEventListener('touchstart', handleClick); // 監聽 canvas 的觸控開始事件

    function handleClick(event) {
        event.preventDefault();
        isDraggingColorWheel = true;
        currentEvent = event.type.startsWith('mouse') ? 'mouse' : 'touch';
        if (currentEvent === 'touch') {
            event = event.touches[0];
        }

        const rect = canvas.getBoundingClientRect();
        const ax = event.clientX - rect.left;
        const ay = event.clientY - rect.top;

        const bx = ax - center.x;
        const by = ay - center.y;
        const distance = Math.sqrt(bx * bx + by * by);   


        if (ax >= squareX && ax <= squareX + squareSize && ay >= squareY && ay <= squareY + squareSize) {
            // 點擊在中間的方形上
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const relativeX = x - squareX;
            const relativeY = y - squareY;
          
            let saturation = relativeX / squareSize;
            let brightness = 1 - (relativeY / squareSize);
          
            // 限制錨點在方格內移動
            saturation = Math.max(0, Math.min(1, saturation));
            brightness = Math.max(0, Math.min(1, brightness));
            saturationBrightnessAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + squareOffsetLeft + saturation * squareSize - saturationBrightnessAnchor.offsetWidth / 2 + 'px';
            saturationBrightnessAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + squareOffsetTop + (1 - brightness) * squareSize - saturationBrightnessAnchor.offsetHeight / 2 + 'px';
            
            // 新的亮度計算公式
            const lightnessValue = brightness * (2 - saturation) * 50;
            const color = `hsl(${currentHue}, ${saturation * 100}%, ${lightnessValue}%)`;
            saturationBrightnessAnchor.style.backgroundColor = color;
            const currentColorSection = document.getElementById("color-info-current-color");
            currentColorSection.style.backgroundColor = color;
            const openBtn = document.getElementById("color-picker-button");
            openBtn.style.backgroundColor = color;
            const inputHSL_H = document.getElementById("inputHSL_H");
            const inputHSL_S = document.getElementById("inputHSL_S");
            const inputHSL_L = document.getElementById("inputHSL_L");
            inputHSL_H.value = currentHue;
            inputHSL_S.value = saturation*100;
            inputHSL_L.value = lightnessValue;
            inputHSL_H.focus();
            inputHSL_H.blur();
            inputHSL_S.focus();
            inputHSL_S.blur();
            inputHSL_L.focus();
            inputHSL_L.blur();
            currentColor = currentColorSection.style.backgroundColor;
        } else if (distance <= radius + 10) {
            // 點擊在色環上
            const rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            const dx = x - center.x;
            const dy = y - center.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            currentHue = (angle + 360) % 360;
          
            // 限制錨點在色環上移動
            const distance = Math.sqrt(dx * dx + dy * dy);
            x = center.x + radius * Math.cos(angle * Math.PI / 180);
            y = center.y + radius * Math.sin(angle * Math.PI / 180);

            hueAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + x - hueAnchor.offsetWidth / 2 + 'px';
            hueAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + y - hueAnchor.offsetHeight / 2 + 'px';
            const hueColor = `hsl(${currentHue}, 100%, 50%)`;
            hueAnchor.style.backgroundColor = hueColor;
            updateSquareColor(currentHue);
              
            // 保持方格錨點的飽和度和亮度，只更新色相
            const sqLeft = parseInt(saturationBrightnessAnchor.style.left) - containerOffsetLeft - colorWheelOffsetLeft - squareOffsetLeft + saturationBrightnessAnchor.offsetWidth / 2;
            const sqTop = parseInt(saturationBrightnessAnchor.style.top) - containerOffsetTop - colorWheelOffsetTop - squareOffsetTop + saturationBrightnessAnchor.offsetHeight / 2;

            let saturation = sqLeft / squareSize;
            let brightness = 1 - (sqTop / squareSize);
              
            // 限制值在0-1範圍內
            saturation = Math.max(0, Math.min(1, saturation));
            brightness = Math.max(0, Math.min(1, brightness));
              
            // 使用新的色相但保持原有的飽和度和亮度
            const lightnessValue = brightness * (2 - saturation) * 50;
            const color = `hsl(${currentHue}, ${saturation * 100}%, ${lightnessValue}%)`;
            saturationBrightnessAnchor.style.backgroundColor = color;
            const currentColorSection = document.getElementById("color-info-current-color");
            currentColorSection.style.backgroundColor = color;
            const openBtn = document.getElementById("color-picker-button");
            openBtn.style.backgroundColor = color;
            const inputHSL_H = document.getElementById("inputHSL_H");
            const inputHSL_S = document.getElementById("inputHSL_S");
            const inputHSL_L = document.getElementById("inputHSL_L");
            inputHSL_H.value = currentHue;
            inputHSL_S.value = saturation*100;
            inputHSL_L.value = lightnessValue;
            inputHSL_H.focus();
            inputHSL_H.blur();
            inputHSL_S.focus();
            inputHSL_S.blur();
            inputHSL_L.focus();
            inputHSL_L.blur();
            currentColor = currentColorSection.style.backgroundColor;
        }
    }
    function updateSquareColor(hue) {
        // 根據目前色相重新繪製方格
        const saturationGradient = ctx.createLinearGradient(squareX, squareY, squareX + squareSize, squareY);
        saturationGradient.addColorStop(0, `hsl(${hue}, 0%, 100%)`);
        saturationGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    
        ctx.fillStyle = saturationGradient;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);

        // 創建明度漸層
        const brightnessGradient = ctx.createLinearGradient(squareX, squareY, squareX, squareY + squareSize);
        brightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 0)'); // 上方：透明白色
        brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)'); // 下方：黑色

        // 疊加明度漸層
        ctx.fillStyle = brightnessGradient;
        ctx.globalCompositeOperation = 'multiply'; // 使用 multiply 模式疊加
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
        ctx.globalCompositeOperation = 'source-over'; // 恢復預設模式
    }

    return canvas;
    isDraggingColorWheel = false;
}



function updateColorPickerByValue(color, container, canvas, hueAnchor, saturationBrightnessAnchor, content, textContainer) {
    // 將顏色字符串轉換為 HSL 值
    const hslValues = rgbToHsl(color);
    const currentHue = hslValues[0] * 360; // 0-1 轉換為 0-360
    const saturation = hslValues[1];       // 0-1
    const brightness = hslValues[2];       // 0-1
    
    // 取得畫布和容器的相關數據
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const radius = canvas.width / 2 - 20;
    const squareSize = ((radius - 20)*2)/Math.sqrt(2) - 24;
    const squareX = center.x - squareSize / 2;
    const squareY = center.y - squareSize / 2;
    
    const containerOffsetLeft = 82;
    const containerOffsetTop = 16;
    const colorWheelOffsetLeft = 461;
    const colorWheelOffsetTop = 0;
    const squareOffsetLeft = squareX;
    const squareOffsetTop = squareY;
    
    // 更新色環錨點位置
    // 設定色相錨點初始位置
    const hueAngle = currentHue * Math.PI / 180;
    hueAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + center.x + radius * Math.cos(hueAngle) - 28 + 'px';
    hueAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + center.y + radius * Math.sin(hueAngle) - 28 + 'px';
    
    // 更新色環錨點顏色
    const hueColor = `hsl(${currentHue}, 100%, 50%)`;
    hueAnchor.style.backgroundColor = hueColor;
    
    // 更新方格的顏色漸變
    const ctx = canvas.getContext('2d');
    updateSquareColor(currentHue, ctx, squareX, squareY, squareSize);
    
    // 更新方格錨點位置
    // 設定飽和度/明度錨點初始位置
    saturationBrightnessAnchor.style.left = containerOffsetLeft + colorWheelOffsetLeft + squareOffsetLeft + (saturation + Math.min(0, (0.5 - brightness))) * squareSize - saturationBrightnessAnchor.offsetWidth / 2 + 'px';
    saturationBrightnessAnchor.style.top = containerOffsetTop + colorWheelOffsetTop + squareOffsetTop + Math.max(0, (0.5 - brightness)) * squareSize - saturationBrightnessAnchor.offsetHeight / 2 + 'px';

      
    // 限制值在0-1範圍內
    saturation = Math.max(0, Math.min(1, saturation));
    brightness = Math.max(0, Math.min(1, brightness));
      
    // 使用新的色相但保持原有的飽和度和亮度
    const lightnessValue = brightness * (2 - saturation) * 50;
    
    // 使用新的色相但保持原有的飽和度和亮度
    const sbColor = `hsl(${currentHue}, ${saturation * 100}%, ${brightness*100}%)`;
    saturationBrightnessAnchor.style.backgroundColor = sbColor;
    
    // 應用顏色到內容
    applyColor(sbColor, content, textContainer);
}

// 修改 updateSquareColor 函數使其可以被外部調用
function updateSquareColor(hue, ctx, squareX, squareY, squareSize) {
    // 根據目前色相重新繪製方格
    const saturationGradient = ctx.createLinearGradient(squareX, squareY, squareX + squareSize, squareY);
    saturationGradient.addColorStop(0, `hsl(${hue}, 0%, 100%)`);
    saturationGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

    ctx.fillStyle = saturationGradient;
    ctx.fillRect(squareX, squareY, squareSize, squareSize);

    // 創建明度漸層
    const brightnessGradient = ctx.createLinearGradient(squareX, squareY, squareX, squareY + squareSize);
    brightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 0)'); // 上方：透明白色
    brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)'); // 下方：黑色

    // 疊加明度漸層
    ctx.fillStyle = brightnessGradient;
    ctx.globalCompositeOperation = 'multiply'; // 使用 multiply 模式疊加
    ctx.fillRect(squareX, squareY, squareSize, squareSize);
    ctx.globalCompositeOperation = 'source-over'; // 恢復預設模式
}


function switchTab(tabName, modal) {
    const tabs = modal.querySelectorAll('.tab-button');
    const contentContainers = modal.querySelectorAll('.content-container > div');

    tabs.forEach(tab => tab.classList.remove('active'));

    const selectedTab = Array.from(tabs).find(tab => tab.textContent === tabName);

    const tabSelector = document.getElementById("tab-selector");

    const selectedContainer = Array.from(contentContainers).find(container => container.classList.contains(tabName === '網格' ? 'color-grid' : 'color-wheel-container'));

    if (selectedContainer) {
        if (tabName === '網格') {
            selectedContainer.parentNode.style.transform = "translateX(0px)";
            tabSelector.style.transform = "translateX(-50px)";
        } else if (tabName === '色環') {
            selectedContainer.parentNode.style.transform = "translateX(-461px)";
            tabSelector.style.transform = "translateX(50px)";
        }
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(color) {
    let colorArray = color.toString().split('(')[1].split(')')[0].split(',');
    let r = parseInt(colorArray[0]);
    let g = parseInt(colorArray[1]);
    let b = parseInt(colorArray[2]);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbToHsl(color){
    let colorArray = color.toString().split('(')[1].split(')')[0].split(',');
    let r = parseInt(colorArray[0]);
    let g = parseInt(colorArray[1]);
    let b = parseInt(colorArray[2]);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;
  
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1/3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1/3);
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function setDefaultColor(Btn, content, textContainer){
    Btn.classList.add("setDefaultBtnIconAnimation");
    const openBtn = document.getElementById("color-picker-button");
    openBtn.style.backgroundColor = "#fff";
    const openButtonText = document.getElementById("color-picker-button-text");
    openButtonText.style.color = "#101010";
    const text = content.value;
    const line1 = text.split('\n')[0];
    const line2 = text.split('\n')[1];
    
    let tempText = "";
    const firstLineDiv = textContainer.children[0];
    const secondLineDiv = textContainer.children[1];

    const idParts = content.id.split('-');
    const index1 = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1]);

    const colorSelector = document.getElementById("colorSelector");
    let tempColor = "";

    tempColor = index2 % 2 == 0 ? "#e9c46a" : "#d82924";
    textContainer.style.color = tempColor;
    colorSelector.style.left = (2+presetColors.indexOf(tempColor))*80 + "px";
    const currentColorBtn = document.getElementById("currentColorBtn");
    currentColorBtn.style.backgroundColor = tempColor;

    firstLineDiv.innerHTML = line1;
    
    const highlightText = line2.split(' ')[0];
    const replaceText = `<span style="color: #ffb703">${highlightText}</span>`
    tempText = line2.trim().replace(highlightText.trim(), replaceText.trim());
    secondLineDiv.innerHTML = tempText;
    saveColorIndex(content, textContainer);
    setTimeout(() => {
        updateAllRelatedText(text, index2, index1);
        Btn.classList.remove("setDefaultBtnIconAnimation");
    }, 400);
}

// 套用顏色到文字
async function applyColor(color, content, textContainer) {
    const selectionStart = content.selectionStart;
    const selectionEnd = content.selectionEnd;
    const text = content.value;
    const colorSelector = document.getElementById('colorSelector');
    if (color.startsWith("#")){
        colorSelector.style.left = (2+presetColors.indexOf(color))*80 + "px";
    }
    else if(color.startsWith("rgb")){
        colorSelector.style.left = (2+presetColors.indexOf(rgbToHex(color)))*80 + "px";
    }
    else{
        const rgbColor = `rgb(${hslToRgb(color)[0]}, ${hslToRgb(color)[1]}, ${hslToRgb(color)[2]})`
        colorSelector.style.left = (2+presetColors.indexOf(rgbToHex(rgbColor)))*80 + "px";
    }
    if(parseInt(colorSelector.style.left) == 80){
        colorSelector.style.left = 9*80 + "px";
    }
    if (selectionStart === selectionEnd) {
        textContainer.style.color = color;
    }

    // 找到換行符位置
    const newlineIndex = text.indexOf('\n');
    
    // 判斷選取的文字是在第一行還是第二行
    const isFirstLine = selectionEnd <= newlineIndex;
    const isSecondLine = selectionStart > newlineIndex;
    
    const firstLineDiv = textContainer.children[0];
    const secondLineDiv = textContainer.children[1];

    if (isFirstLine) {
        // 處理第一行的選取
        const originalText = firstLineDiv.textContent;
        
        // 計算在第一行中的相對位置
        const lineStart = selectionStart;
        const lineEnd = selectionEnd;
        
        // 檢查是否有已存在的 span 元素
        let newHtml = '';
        let currentPos = 0;
        
        // 獲取所有子節點
        const childNodes = Array.from(firstLineDiv.childNodes);

        for (let node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const textLength = node.textContent.length;
                const nodeStart = currentPos;
                const nodeEnd = currentPos + textLength;
                
                // 檢查是否與選取範圍重疊
                if (lineEnd <= nodeStart || lineStart >= nodeEnd) {
                    // 不重疊，保持原樣
                    newHtml += node.textContent;
                } else {
                    // 重疊，分成三部分處理
                    const beforeText = node.textContent.substring(0, lineStart - nodeStart);
                    const selectedText = node.textContent.substring(
                        Math.max(0, lineStart - nodeStart),
                        Math.min(textLength, lineEnd - nodeStart)
                    );
                    const afterText = node.textContent.substring(lineEnd - nodeStart);
                    
                    newHtml += beforeText +
                        `<span style="color:${color}">${selectedText}</span>` +
                        afterText;
                }
                currentPos += textLength;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                // 處理 <span> 標籤
                const spanStart = currentPos;
                const spanEnd = currentPos + node.textContent.length;
        
                if (lineEnd <= spanStart || lineStart >= spanEnd) {
                    // 不重疊，保持原樣
                    newHtml += node.outerHTML;
                } else {
                    // 重疊，需要分割 <span> 標籤
                    const beforeSpan = node.textContent.substring(0, Math.max(0, lineStart - spanStart));
                    const selectedInSpan = node.textContent.substring(
                        Math.max(0, lineStart - spanStart),
                        Math.min(node.textContent.length, lineEnd - spanStart)
                    );
                    const afterSpan = node.textContent.substring(Math.min(node.textContent.length, lineEnd - spanStart));
        
                    if (beforeSpan.length > 0) {
                        newHtml += `<span style="color:${node.style.color}">${beforeSpan}</span>`;
                    }
                    if (selectedInSpan.length > 0) {
                        newHtml += `<span style="color:${color}">${selectedInSpan}</span>`;
                    }
                    if (afterSpan.length > 0) {
                        newHtml += `<span style="color:${node.style.color}">${afterSpan}</span>`;
                    }
                }
                currentPos += node.textContent.length;
            } else {
                // 保留現有的 HTML 元素
                newHtml += node.outerHTML;
                currentPos += node.textContent.length;
            }
        }
        firstLineDiv.innerHTML = newHtml;
    } else if (isSecondLine) {
        // 處理第二行的選取
        const originalText = secondLineDiv.textContent;
        
        // 計算在第二行中的相對位置（需要減去換行符的位置）
        const lineStart = selectionStart - (newlineIndex + 1);
        const lineEnd = selectionEnd - (newlineIndex + 1);
        
        // 檢查是否有已存在的 span 元素
        let newHtml = '';
        let currentPos = 0;
        
        // 獲取所有子節點
        const childNodes = Array.from(secondLineDiv.childNodes);
        let handled = false;
        
        for (let node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const textLength = node.textContent.length;
                const nodeStart = currentPos;
                const nodeEnd = currentPos + textLength;
                
                // 檢查是否與選取範圍重疊
                if (lineEnd <= nodeStart || lineStart >= nodeEnd) {
                    // 不重疊，保持原樣
                    newHtml += node.textContent;
                } else {
                    // 重疊，分成三部分處理
                    const beforeText = node.textContent.substring(0, lineStart - nodeStart);
                    const selectedText = node.textContent.substring(
                        Math.max(0, lineStart - nodeStart),
                        Math.min(textLength, lineEnd - nodeStart)
                    );
                    const afterText = node.textContent.substring(lineEnd - nodeStart);
                    
                    newHtml += beforeText +
                        `<span style="color:${color}">${selectedText}</span>` +
                        afterText;
                }
                currentPos += textLength;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                // 處理 <span> 標籤
                const spanStart = currentPos;
                const spanEnd = currentPos + node.textContent.length;
        
                if (lineEnd <= spanStart || lineStart >= spanEnd) {
                    // 不重疊，保持原樣
                    newHtml += node.outerHTML;
                } else {
                    // 重疊，需要分割 <span> 標籤
                    const beforeSpan = node.textContent.substring(0, Math.max(0, lineStart - spanStart));
                    const selectedInSpan = node.textContent.substring(
                        Math.max(0, lineStart - spanStart),
                        Math.min(node.textContent.length, lineEnd - spanStart)
                    );
                    const afterSpan = node.textContent.substring(Math.min(node.textContent.length, lineEnd - spanStart));
        
                    if (beforeSpan.length > 0) {
                        newHtml += `<span style="color:${node.style.color}">${beforeSpan}</span>`;
                    }
                    if (selectedInSpan.length > 0) {
                        newHtml += `<span style="color:${color}">${selectedInSpan}</span>`;
                    }
                    if (afterSpan.length > 0) {
                        newHtml += `<span style="color:${node.style.color}">${afterSpan}</span>`;
                    }
                }
                currentPos += node.textContent.length;
            } else {
                // 保留現有的 HTML 元素
                newHtml += node.outerHTML;
                currentPos += node.textContent.length;
            }
        }
        secondLineDiv.innerHTML = newHtml;
    }

    
    // 更新當前顏色按鈕
    const currentColorBtn = document.querySelector('.currentColorBtn');
    if (currentColorBtn) {
        currentColorBtn.style.backgroundColor = color;
    }

    saveColorIndex(content, textContainer);
}

async function getColorIndex(content, textContainer) {
    const idParts = content.id.split('-')
    const index = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1] % 2);
    const index3 = parseInt(idParts[1]);

    const contentText = content.value;
    const newlineIndex = contentText.indexOf('\n');

    const firstLineDiv = textContainer.children[0];
    const secondLineDiv = textContainer.children[1];

    const span1 = document.getElementById(`span1-${index}-${index3}`);
    const span2 = document.getElementById(`span2-${index}-${index3}`);

    try {
        const responseGet = await fetch('../data/marquee_color_code.txt');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        
        if (index >= 0 && index < lines.length) {
            let defaultColor = (index2 == 0 ) ? lines[0].split(')')[0].replace("(",""):lines[index].split(')')[0].replace("(","");
            let spans = (index2 == 0 ) ? lines[0].split('['):lines[index].split('[');

            textContainer.style.color = defaultColor;
            let line1Html = contentText.split('\n')[0];
            let line2Html = contentText.split('\n')[1];
            for (let i = 1; i < spans.length; i++){
                const color = spans[i].split(",")[1].replace("]","");
                const lineStart = spans[i].split(",")[0].split(":")[0];
                const lineEnd = spans[i].split(",")[0].split(":")[1];
                const selectedText = contentText.substring(lineStart, lineEnd).trim();
                const replaceText = `<span style="color:${color}">${selectedText}</span>`;
                if(lineStart <= newlineIndex && lineEnd <= newlineIndex){
                    line1Html = line1Html.trim(); // 去除空格
                    line1Html = line1Html.replace(new RegExp(selectedText, 'gu'), replaceText);
                }
                else {
                    line2Html = line2Html.trim(); // 去除空格
                    line2Html = line2Html.replace(new RegExp(selectedText, 'gu'), replaceText);
                }
            }
            firstLineDiv.innerHTML = line1Html;
            secondLineDiv.innerHTML = line2Html;
            span1.innerHTML = line1Html;
            span2.innerHTML = line2Html;
        } else {
            console.error("Invalid index:", index);
            return;
        }

    } catch (error) {
        console.error("Error updating file:", error);
    }
}

async function saveColorIndex(content, textContainer) {
    const idParts = content.id.split('-')
    const index = parseInt(idParts[0]);
    const index2 = parseInt(idParts[1] % 2);
    const index3 = parseInt(idParts[1]);
    let newValue = "";
    let isDefaultColor = false;

    const firstLineDiv = textContainer.children[0];
    const secondLineDiv = textContainer.children[1];

    let currentPos = 0;
    // 獲取所有子節點
    const firstChildNodes = Array.from(firstLineDiv.childNodes);

    let tempColor1;
    let tempColor2;
    let tempType1;
    let tempType2;

    for (let node of firstChildNodes) {
        const textLength = node.textContent.length;
        const nodeStart = currentPos;
        const nodeEnd = currentPos + textLength;
        if (nodeStart != nodeEnd){
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                
                if(tempColor1 == node.style.color){
                    if(tempType1 == true){
                        let tempValue = newValue;
                        const selectedValue = tempValue.split('[')[newValue.split('[').length - 1].split(',')[0];
                        const replaceValue = tempValue.split('[')[newValue.split('[').length - 1].split(',')[0].split(':')[0] + ':' + nodeEnd;
                        tempValue = tempValue.replace(selectedValue, replaceValue);
                    }
                    else{
                        let tempValue = newValue;
                        const selectedValue = "[" + tempValue.split('[')[newValue.split('[').length - 1];
                        tempValue = tempValue.replace(selectedValue, "");
                    }
                    tempColor1 = node.style.color;
                    tempType1 = true;
                }
                else{
                    newValue += "[" + nodeStart + ":" + nodeEnd + "," + rgbToHex(node.style.color) + "]";
                    tempColor1 = node.style.color;
                    tempType1 = true;
                }
            } else {
                if(isDefaultColor == false){
                    const tempValue = newValue;
                    newValue = "(" + rgbToHex(textContainer.style.color) + ")" + tempValue;
                    isDefaultColor = true;
                }
                else{
                    newValue = newValue;
                }
                tempColor1 = textContainer.style.color;
                tempType1 = false;
            }
        }
        currentPos += textLength;
    }

    const secondChildNodes = Array.from(secondLineDiv.childNodes);

    for (let node of secondChildNodes) {
        const textLength = node.textContent.length;
        const nodeStart = currentPos + 1;
        const nodeEnd = currentPos + textLength + 1;
        if (nodeStart != nodeEnd){
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                if(tempColor1 == node.style.color){
                    if(tempType2 == true){
                        let tempValue = newValue;
                        const selectedValue = tempValue.split('[')[newValue.split('[').length - 1].split(',')[0];
                        const replaceValue = tempValue.split('[')[newValue.split('[').length - 1].split(',')[0].split(':')[0] + ':' + nodeEnd;
                        tempValue = tempValue.replace(selectedValue, replaceValue);
                    }
                    else{
                        let tempValue = newValue;
                        const selectedValue = "[" + tempValue.split('[')[newValue.split('[').length - 1];
                        tempValue = tempValue.replace(selectedValue, "");
                    }
                }
                else{
                    newValue += "[" + nodeStart + ":" + nodeEnd + "," + rgbToHex(node.style.color) + "]";
                }
                tempColor2 = node.style.color;
                tempType2 = true;
            } else {
                if(isDefaultColor == false){
                    const tempValue = newValue;
                    newValue = "(" + rgbToHex(textContainer.style.color) + ")" + tempValue;
                    isDefaultColor = true;
                }
                else{
                    newValue = newValue;
    
                }
                tempColor2 = textContainer.style.color;
                tempType2 = false;
            }
        }
        currentPos += textLength;
    }
    if(!newValue.startsWith('(')){
        const tempValue = newValue;
        newValue = "(" + rgbToHex(textContainer.style.color) + ")" + tempValue;
    }

    try {
        const responseGet = await fetch('/get-marquee-color');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        if (index >= 0 && index < lines.length) {
            if (index2 == 0) {
                lines[0] = newValue;
            } else {
                lines[index] = newValue;
            }
        } else {
            console.error("Invalid index:", index);
            return;
        }

        const updatedText = lines.join('\n');
        const responsePost = await fetch('/save-marquee-color', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedText }),
        });

        if (!responsePost.ok) {
            throw new Error(`HTTP error! status: ${responsePost.status}`);
        }
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

function animateSpans(index, animation1, animation2, animation3, animation4) {
    const span1 = document.getElementsByClassName('span1');
    const span2 = document.getElementsByClassName('span2');
    const content = document.getElementsByClassName('textContainer');
    if (index < 0 || index >= content.length) {
        index = index;
    }
    else {
        content[index].style.display = 'none';
        span1[index].style.display = 'block';
        span2[index].style.display = 'block';
        span1[index].style.animation = animation1;
        span2[index].style.animation = animation2;
        setTimeout(function () {
            content[index].style.display = 'flex';
            span1[index].style.animation = animation3;
            span2[index].style.animation = animation4;
            span1[index].style.display = 'none';
            span2[index].style.display = 'none';
        }, 1100);
    }
}

let tempRandomIndex;

function slideToNext() {
    if (messages.length > 0) {
        const span1 = document.getElementsByClassName('span1');
        const span2 = document.getElementsByClassName('span2');
        const content = document.getElementsByClassName('textContainer');
        let N = 0;
        if ((currentIndex)%4 < 2){
            N = (Math.floor((currentIndex+1)/4))*2+(currentIndex+1)%4-1;
        }
        else{
            N = -1;
        }
        const textItemOut = document.getElementById(`text-item-${tableNumber}-${N}`);
        const textItem = document.getElementById(`text-item-${tableNumber}-${N+1}`);
        const slideInLeft = "slideInLeft 1s cubic-bezier(.4,0,.2,1)";
        const slideInRight = "slideInRight 1s cubic-bezier(.4,0,.2,1)";
        const slideOutLeft = "slideOutLeft 1s cubic-bezier(.4,0,.2,1)";
        const slideOutRight = "slideOutRight 1s cubic-bezier(.4,0,.2,1)";
        let inAnimations = ["scaleIn2", "scaleIn", "bounceInLeft", "flipInX"];
        let outAnimations = ["scaleOut2", "scaleOut", "bounceOutRight", "flipOutX"];
        let r = Math.random();
        const randomIndex = Math.floor(r * (inAnimations.length+1));
        const randomIndex2 = Math.floor(r * 2);
        let inAnimation = "";
        let outAnimation = "";
        if (N == 0){
            animateSpans(N, slideOutRight, slideOutLeft);
            objsAnimationOut(textItemOut, N, 0);
            createObjs(textItem, randomIndex2);
        }
        else if (N < 0){
            N = N;
        }
        else{
            content[N].style.display = 'none';
            span1[N].style.display = 'block';
            span2[N].style.display = 'block';
            setTimeout(function () {
                content[N].style.display = 'flex';
                span1[N].style.display = 'none';
                span2[N].style.display = 'none';
            }, 1100);
            objsAnimationOut(textItemOut, N, tempRandomIndex);
            if (N+1 < content.length){
                createObjs(textItem, randomIndex2);
            }
            else{
                N = N;
            }
        }
        currentIndex = (currentIndex + 1) % messages.length;
        const translateY = -currentIndex * globalHeight;
        marqueeContent.style.transform = `translateY(${translateY}px)`;
        if ((currentIndex)%4 < 2){
            N = (Math.floor((currentIndex+1)/4))*2+(currentIndex+1)%4-1;
        }
        else{
            N = -1;
        }
        if (N < 0 || N >= content.length) {
            N = N;
        }
        else {
            if (randomIndex < inAnimations.length){
                inAnimation = inAnimations[randomIndex]+" 1s cubic-bezier(.4,0,.2,1)";
                outAnimation = outAnimations[randomIndex]+" 1s cubic-bezier(.4,0,.2,1)";
                animateSpans(N, inAnimation, inAnimation, outAnimation, outAnimation);
            }
            else {
                animateSpans(N, slideInLeft, slideInRight, slideOutRight, slideOutLeft);
            }
        }
        if (currentIndex == 0){
            createObjs(textItem, 0);
        }
    }
}


function createObjs(textItem, randomIndex) {
    let i = parseInt(textItem.id.split('-')[3]);
    tempRandomIndex = randomIndex;
    let j = Math.floor(i/2)*4 + i % 2;
    if(i % 2 == 0){
        if(randomIndex == 0){
            const Obj1 = document.createElement('img');
            const Obj2 = document.createElement('img');
            const Obj3 = document.createElement('img');
            const Obj4 = document.createElement('img');
            const Obj5 = document.createElement('img');
            const Obj6 = document.createElement('img');
            const Obj7 = document.createElement('img');
            const Obj9 = document.createElement('img');
            const Obj8 = document.createElement('img');
            const Obj10 = document.createElement('img');
            const Obj12 = document.createElement('img');
            const Obj11 = document.createElement('img');
            Obj1.style.left = (globalWidth - 563)/2 + "px";
            Obj1.style.top = (globalHeight - 563)/2 + j*globalHeight + "px";
            Obj2.style.left = (globalWidth - 540)/2 + "px";
            Obj2.style.top = (globalHeight - 540)/2 + j*globalHeight + "px";
            Obj3.style.top = 0 + j*globalHeight + "px"; 
            Obj4.style.left = (globalWidth - 918)/2 - 100 + "px";
            Obj4.style.top = globalHeight - 300 + j*globalHeight + "px";
            Obj5.style.left = globalWidth - 236 + "px";
            Obj5.style.top = 0 + j*globalHeight + "px";
            Obj6.style.top = 200 + j*globalHeight + "px";
            Obj7.style.width = globalWidth*0.9 + "px";
            Obj7.style.left = globalWidth*0.05 + "px";
            Obj7.style.top = globalHeight - globalWidth*0.05 - 160 + j*globalHeight + "px";
            Obj8.style.left = (globalWidth - 563)/2 + "px";
            Obj8.style.top = (globalHeight - 563)/2 + j*globalHeight + "px";
            Obj9.style.top = 0 + j*globalHeight + "px";
            Obj10.style.left = globalWidth - 500 + "px";
            Obj10.style.top = globalHeight - 59 + j*globalHeight + "px";
            Obj11.style.top = 200 + j*globalHeight + "px";
            Obj12.style.top = 200 + j*globalHeight + "px";
            Obj1.src = '../data/assest/01/Img01.png';
            Obj2.src = '../data/assest/01/Img02.png';
            Obj3.src = '../data/assest/01/Img05.png';
            Obj4.src = '../data/assest/01/Img04.png';
            Obj5.src = '../data/assest/01/Img05.png';
            Obj6.src = '../data/assest/01/Img06.png';
            Obj7.src = '../data/assest/01/Img07.png';
            Obj8.src = '../data/assest/01/Img08.png';
            Obj9.src = '../data/assest/01/Img09.png';
            Obj10.src = '../data/assest/01/Img10.png';
            Obj11.src = '../data/assest/01/Img06.png';
            Obj12.src = '../data/assest/01/Img06.png';
            Obj1.id = "Obj1-01";
            Obj2.id = "Obj1-02";
            Obj3.id = "Obj1-03";
            Obj4.id = "Obj1-04";
            Obj5.id = "Obj1-05";
            Obj6.id = "Obj1-06";
            Obj7.id = "Obj1-07";
            Obj8.id = "Obj1-08";
            Obj9.id = "Obj1-09";
            Obj10.id = "Obj1-10";
            Obj11.id = "Obj1-11";
            Obj12.id = "Obj1-12";
            Obj1.oncontextmenu = () => {return false};
            Obj2.oncontextmenu = () => {return false};
            Obj3.oncontextmenu = () => {return false};
            Obj4.oncontextmenu = () => {return false};
            Obj5.oncontextmenu = () => {return false};
            Obj6.oncontextmenu = () => {return false};
            Obj7.oncontextmenu = () => {return false};
            Obj8.oncontextmenu = () => {return false};
            Obj9.oncontextmenu = () => {return false};
            Obj10.oncontextmenu = () => {return false};
            Obj11.oncontextmenu = () => {return false};
            Obj12.oncontextmenu = () => {return false};
            textItem.appendChild(Obj2);
            textItem.appendChild(Obj1);
            textItem.appendChild(Obj8);
            textItem.appendChild(Obj4);
            textItem.appendChild(Obj9);
            textItem.appendChild(Obj10);
            textItem.appendChild(Obj7);
            textItem.appendChild(Obj5);
            textItem.appendChild(Obj3);
            textItem.appendChild(Obj6);
            textItem.appendChild(Obj11);
            textItem.appendChild(Obj12);
            if(isLooking == true){
                objsAnimationIn(i, randomIndex, Obj1, Obj2, Obj3, Obj4, Obj5, Obj6, Obj7, Obj8, Obj9, Obj10, Obj11, Obj12);
            }
        }
        else{
            const Obj1 = document.createElement('img');
            const Obj2 = document.createElement('img');
            const Obj3 = document.createElement('img');
            const Obj4 = document.createElement('img');
            const Obj5 = document.createElement('img');
            const Obj6 = document.createElement('img');
            const Obj7 = document.createElement('img');
            const Obj9 = document.createElement('img');
            const Obj8 = document.createElement('img');
            const Obj10 = document.createElement('img');
            const Obj11 = document.createElement('img');
            const Obj12 = document.createElement('img');
            const Obj13 = document.createElement('img');
            const Obj14 = document.createElement('img');
            const Obj15 = document.createElement('img');
            const Obj16 = document.createElement('img');
            const Obj17 = document.createElement('img');
            const Obj18 = document.createElement('img');
            const Obj19 = document.createElement('img');
            Obj1.style.width = globalWidth + "px";
            Obj1.style.height = globalHeight + "px";
            Obj1.style.top = 0 + j*globalHeight + "px";
            Obj2.style.top = globalHeight - 300 + j*globalHeight + "px";
            Obj3.style.left = globalWidth - 398 - 40 + "px";
            Obj3.style.top = globalHeight - 300 + j*globalHeight + "px";
            Obj4.style.top = (globalHeight - 84)/2 + 100 + j*globalHeight + "px";
            Obj5.style.left = globalWidth - 180 + "px";
            Obj5.style.top = (globalHeight - 84)/2 + 150 + j*globalHeight + "px";
            Obj6.style.top = 88 + j*globalHeight + "px";
            Obj7.style.left = globalWidth - 298 - 450 + "px";
            Obj7.style.top = 103 + j*globalHeight + "px";
            Obj8.style.top = 0 + j*globalHeight + "px";
            Obj9.style.left = globalWidth - 298 - 50 + "px";
            Obj9.style.top = -40 + j*globalHeight + "px";
            Obj10.style.top = 50 + j*globalHeight + "px";
            Obj11.style.top = 50 + j*globalHeight + "px";
            Obj12.style.top = 50 + j*globalHeight + "px";
            Obj13.style.top = 50 + j*globalHeight + "px";
            Obj14.style.top = 50 + j*globalHeight + "px";
            Obj15.style.top = 50 + j*globalHeight + "px";
            Obj16.style.top = 200 + j*globalHeight + "px";
            Obj17.style.top = 200 + j*globalHeight + "px";
            Obj18.style.top = 200 + j*globalHeight + "px";
            Obj19.style.top = 200 + j*globalHeight + "px";
            Obj1.src = '../data/assest/03/Img01.png';
            Obj2.src = '../data/assest/03/Img02.png';
            Obj3.src = '../data/assest/03/Img02.png';
            Obj4.src = '../data/assest/03/Img05.png';
            Obj5.src = '../data/assest/03/Img05.png';
            Obj6.src = '../data/assest/03/Img06.png';
            Obj7.src = '../data/assest/03/Img06.png';
            Obj8.src = '../data/assest/03/Img07.png';
            Obj9.src = '../data/assest/03/Img07.png';
            Obj10.src = '../data/assest/03/Img03.png';
            Obj11.src = '../data/assest/03/Img03.png';
            Obj12.src = '../data/assest/03/Img03.png';
            Obj13.src = '../data/assest/03/Img03.png';
            Obj14.src = '../data/assest/03/Img03.png';
            Obj15.src = '../data/assest/03/Img03.png';
            Obj16.src = '../data/assest/03/Img04.png';
            Obj17.src = '../data/assest/03/Img04.png';
            Obj18.src = '../data/assest/03/Img04.png';
            Obj19.src = '../data/assest/03/Img04.png';
            Obj1.id = "Obj3-01";
            Obj2.id = "Obj3-02";
            Obj3.id = "Obj3-03";
            Obj4.id = "Obj3-04";
            Obj5.id = "Obj3-05";
            Obj6.id = "Obj3-06";
            Obj7.id = "Obj3-07";
            Obj8.id = "Obj3-08";
            Obj9.id = "Obj3-09";
            Obj10.id = "Obj3-10";
            Obj11.id = "Obj3-11";
            Obj12.id = "Obj3-12";
            Obj13.id = "Obj3-13";
            Obj14.id = "Obj3-14";
            Obj15.id = "Obj3-15";
            Obj16.id = "Obj3-16";
            Obj17.id = "Obj3-17";
            Obj18.id = "Obj3-18";
            Obj19.id = "Obj3-19";
            Obj1.oncontextmenu = () => {return false};
            Obj2.oncontextmenu = () => {return false};
            Obj3.oncontextmenu = () => {return false};
            Obj4.oncontextmenu = () => {return false};
            Obj5.oncontextmenu = () => {return false};
            Obj6.oncontextmenu = () => {return false};
            Obj7.oncontextmenu = () => {return false};
            Obj8.oncontextmenu = () => {return false};
            Obj9.oncontextmenu = () => {return false};
            Obj10.oncontextmenu = () => {return false};
            Obj11.oncontextmenu = () => {return false};
            Obj12.oncontextmenu = () => {return false};
            Obj13.oncontextmenu = () => {return false};
            Obj14.oncontextmenu = () => {return false};
            Obj15.oncontextmenu = () => {return false};
            Obj16.oncontextmenu = () => {return false};
            Obj17.oncontextmenu = () => {return false};
            Obj18.oncontextmenu = () => {return false};
            Obj19.oncontextmenu = () => {return false};
            textItem.appendChild(Obj1);
            textItem.appendChild(Obj2);
            textItem.appendChild(Obj3);
            textItem.appendChild(Obj4);
            textItem.appendChild(Obj5);
            textItem.appendChild(Obj6);
            textItem.appendChild(Obj7);
            textItem.appendChild(Obj8);
            textItem.appendChild(Obj9);
            textItem.appendChild(Obj10);
            textItem.appendChild(Obj11);
            textItem.appendChild(Obj12);
            textItem.appendChild(Obj13);
            textItem.appendChild(Obj14);
            textItem.appendChild(Obj15);
            textItem.appendChild(Obj16);
            textItem.appendChild(Obj17);
            textItem.appendChild(Obj18);
            textItem.appendChild(Obj19);
            if(isLooking == true){
                objsAnimationIn(i, randomIndex, Obj1, Obj2, Obj3, Obj4, Obj5, Obj6, Obj7, Obj8, Obj9, Obj10, Obj11, Obj12, Obj13, Obj14, Obj15, Obj16, Obj17, Obj18, Obj19);
            }
        }
    }
    else{
        if(randomIndex == 0){
            const Obj1 = document.createElement('img');
            const Obj2 = document.createElement('img');
            const Obj3 = document.createElement('img');
            const Obj4 = document.createElement('img');
            const Obj5 = document.createElement('img');
            const Obj6 = document.createElement('img');
            const Obj7 = document.createElement('img');
            const Obj9 = document.createElement('img');
            const Obj8 = document.createElement('img');
            const Obj10 = document.createElement('img');
            const Obj11 = document.createElement('img');
            const Obj12 = document.createElement('img');
            const Obj13 = document.createElement('img');
            const Obj14 = document.createElement('img');
            const Obj15 = document.createElement('img');
            Obj1.style.left = globalWidth - 440 + "px";
            Obj1.style.top = 0 + j*globalHeight + "px";
            Obj2.style.top = 0 + j*globalHeight + "px";
            Obj3.style.left = globalWidth - 160 + "px";
            Obj3.style.top = globalHeight - 248 + j*globalHeight + "px";
            Obj4.style.top = globalHeight - 109 + j*globalHeight + "px";
            Obj5.style.top = globalHeight - 236 - 50 - 230 - 20 + j*globalHeight + "px";
            Obj6.style.top = globalHeight - 236 - 50 + j*globalHeight + "px";
            Obj7.style.left = globalWidth - 268 + "px";
            Obj7.style.top = 198 + j*globalHeight + "px";
            Obj8.style.left = globalWidth - 236 + "px";
            Obj8.style.top = 496 + j*globalHeight + "px";
            Obj9.style.width = globalWidth + "px";
            Obj9.style.height = globalHeight + "px";
            Obj9.style.top = 0 + j*globalHeight + "px";
            Obj10.style.left = (globalWidth - 572)/2 + "px";
            Obj10.style.top = (globalHeight - 547)/2 + j*globalHeight + "px";
            Obj11.style.left = globalWidth - 230 + "px";
            Obj11.style.top = 0 + j*globalHeight + "px";
            Obj12.style.top = 0 + j*globalHeight + "px";
            Obj13.style.top = 200 + j*globalHeight + "px";
            Obj14.style.top = 200 + j*globalHeight + "px";
            Obj15.style.top = 200 + j*globalHeight + "px";
            Obj1.src = '../data/assest/02/Img01.png';
            Obj2.src = '../data/assest/02/Img02.png';
            Obj3.src = '../data/assest/02/Img03.png';
            Obj4.src = '../data/assest/02/Img04.png';
            Obj5.src = '../data/assest/02/Img05.png';
            Obj6.src = '../data/assest/02/Img06.png';
            Obj7.src = '../data/assest/02/Img07.png';
            Obj8.src = '../data/assest/02/Img08.png';
            Obj9.src = '../data/assest/02/Img09.png';
            Obj10.src = '../data/assest/02/Img10.png';
            Obj11.src = '../data/assest/02/Img11.png';
            Obj12.src = '../data/assest/02/Img12.png';
            Obj13.src = '../data/assest/02/Img13.png';
            Obj14.src = '../data/assest/02/Img14.png';
            Obj15.src = '../data/assest/02/Img15.png';
            Obj1.id = "Obj2-01";
            Obj2.id = "Obj2-02";
            Obj3.id = "Obj2-03";
            Obj4.id = "Obj2-04";
            Obj5.id = "Obj2-05";
            Obj6.id = "Obj2-06";
            Obj7.id = "Obj2-07";
            Obj8.id = "Obj2-08";
            Obj9.id = "Obj2-09";
            Obj10.id = "Obj2-10";
            Obj11.id = "Obj2-11";
            Obj12.id = "Obj2-12";
            Obj13.id = "Obj2-13";
            Obj14.id = "Obj2-14";
            Obj15.id = "Obj2-15";
            Obj1.oncontextmenu = () => {return false};
            Obj2.oncontextmenu = () => {return false};
            Obj3.oncontextmenu = () => {return false};
            Obj4.oncontextmenu = () => {return false};
            Obj5.oncontextmenu = () => {return false};
            Obj6.oncontextmenu = () => {return false};
            Obj7.oncontextmenu = () => {return false};
            Obj8.oncontextmenu = () => {return false};
            Obj9.oncontextmenu = () => {return false};
            Obj10.oncontextmenu = () => {return false};
            Obj11.oncontextmenu = () => {return false};
            Obj12.oncontextmenu = () => {return false};
            Obj13.oncontextmenu = () => {return false};
            Obj14.oncontextmenu = () => {return false};
            Obj15.oncontextmenu = () => {return false};
            textItem.appendChild(Obj9);
            textItem.appendChild(Obj10);
            textItem.appendChild(Obj7);
            textItem.appendChild(Obj1);
            textItem.appendChild(Obj2);
            textItem.appendChild(Obj3);
            textItem.appendChild(Obj5);
            textItem.appendChild(Obj6);
            textItem.appendChild(Obj4);
            textItem.appendChild(Obj8);
            textItem.appendChild(Obj11);
            textItem.appendChild(Obj12);
            textItem.appendChild(Obj13);
            textItem.appendChild(Obj14);
            textItem.appendChild(Obj15);
            if(isLooking == true){
                objsAnimationIn(i, randomIndex, Obj1, Obj2, Obj3, Obj4, Obj5, Obj6, Obj7, Obj8, Obj9, Obj10, Obj11, Obj12, Obj13, Obj14, Obj15);
            }
        }
        else{
            const Obj1 = document.createElement('img');
            const Obj2 = document.createElement('img');
            const Obj3 = document.createElement('img');
            const Obj4 = document.createElement('img');
            const Obj5 = document.createElement('img');
            const Obj6 = document.createElement('img');
            const Obj7 = document.createElement('img');
            const Obj9 = document.createElement('img');
            const Obj8 = document.createElement('img');
            const Obj10 = document.createElement('img');
            const Obj11 = document.createElement('img');
            const Obj12 = document.createElement('img');
            const Obj13 = document.createElement('img');
            const Obj14 = document.createElement('img');
            const Obj15 = document.createElement('img');
            Obj1.style.left = globalWidth - 440 + "px";
            Obj1.style.top = 0 + j*globalHeight + "px";
            Obj2.style.top = 0 + j*globalHeight + "px";
            Obj3.style.left = globalWidth - 160 + "px";
            Obj3.style.top = globalHeight - 248 + j*globalHeight + "px";
            Obj4.style.top = globalHeight - 109 + j*globalHeight + "px";
            Obj5.style.top = globalHeight - 236 - 50 - 230 - 20 + j*globalHeight + "px";
            Obj6.style.top = globalHeight - 236 - 50 + j*globalHeight + "px";
            Obj7.style.left = globalWidth - 268 + "px";
            Obj7.style.top = 198 + j*globalHeight + "px";
            Obj8.style.left = globalWidth - 236 + "px";
            Obj8.style.top = 496 + j*globalHeight + "px";
            Obj9.style.width = globalWidth + "px";
            Obj9.style.height = globalHeight + "px";
            Obj9.style.top = 0 + j*globalHeight + "px";
            Obj10.style.left = (globalWidth - 572)/2 + "px";
            Obj10.style.top = (globalHeight - 547)/2 + j*globalHeight + "px";
            Obj11.style.left = globalWidth - 230 + "px";
            Obj11.style.top = 0 + j*globalHeight + "px";
            Obj12.style.top = 0 + j*globalHeight + "px";
            Obj13.style.top = 200 + j*globalHeight + "px";
            Obj14.style.top = 200 + j*globalHeight + "px";
            Obj15.style.top = 200 + j*globalHeight + "px";
            Obj1.src = '../data/assest/02/Img01.png';
            Obj2.src = '../data/assest/02/Img02.png';
            Obj3.src = '../data/assest/02/Img03.png';
            Obj4.src = '../data/assest/02/Img04.png';
            Obj5.src = '../data/assest/02/Img05.png';
            Obj6.src = '../data/assest/02/Img06.png';
            Obj7.src = '../data/assest/02/Img07.png';
            Obj8.src = '../data/assest/02/Img08.png';
            Obj9.src = '../data/assest/02/Img09.png';
            Obj10.src = '../data/assest/02/Img10.png';
            Obj11.src = '../data/assest/02/Img11.png';
            Obj12.src = '../data/assest/02/Img12.png';
            Obj13.src = '../data/assest/02/Img13.png';
            Obj14.src = '../data/assest/02/Img14.png';
            Obj15.src = '../data/assest/02/Img15.png';
            Obj1.id = "Obj2-01";
            Obj2.id = "Obj2-02";
            Obj3.id = "Obj2-03";
            Obj4.id = "Obj2-04";
            Obj5.id = "Obj2-05";
            Obj6.id = "Obj2-06";
            Obj7.id = "Obj2-07";
            Obj8.id = "Obj2-08";
            Obj9.id = "Obj2-09";
            Obj10.id = "Obj2-10";
            Obj11.id = "Obj2-11";
            Obj12.id = "Obj2-12";
            Obj13.id = "Obj2-13";
            Obj14.id = "Obj2-14";
            Obj15.id = "Obj2-15";
            Obj1.oncontextmenu = () => {return false};
            Obj2.oncontextmenu = () => {return false};
            Obj3.oncontextmenu = () => {return false};
            Obj4.oncontextmenu = () => {return false};
            Obj5.oncontextmenu = () => {return false};
            Obj6.oncontextmenu = () => {return false};
            Obj7.oncontextmenu = () => {return false};
            Obj8.oncontextmenu = () => {return false};
            Obj9.oncontextmenu = () => {return false};
            Obj10.oncontextmenu = () => {return false};
            Obj11.oncontextmenu = () => {return false};
            Obj12.oncontextmenu = () => {return false};
            Obj13.oncontextmenu = () => {return false};
            Obj14.oncontextmenu = () => {return false};
            Obj15.oncontextmenu = () => {return false};
            textItem.appendChild(Obj9);
            textItem.appendChild(Obj10);
            textItem.appendChild(Obj7);
            textItem.appendChild(Obj1);
            textItem.appendChild(Obj2);
            textItem.appendChild(Obj3);
            textItem.appendChild(Obj5);
            textItem.appendChild(Obj6);
            textItem.appendChild(Obj4);
            textItem.appendChild(Obj8);
            textItem.appendChild(Obj11);
            textItem.appendChild(Obj12);
            textItem.appendChild(Obj13);
            textItem.appendChild(Obj14);
            textItem.appendChild(Obj15);
            if(isLooking == true){
                objsAnimationIn(i, randomIndex, Obj1, Obj2, Obj3, Obj4, Obj5, Obj6, Obj7, Obj8, Obj9, Obj10, Obj11, Obj12, Obj13, Obj14, Obj15);
            }
        }
    }
}



function objsAnimationIn(i, randomIndex, Obj1, Obj2, Obj3, Obj4, Obj5, Obj6, Obj7, Obj8, Obj9, Obj10, Obj11, Obj12, Obj13, Obj14, Obj15, Obj16, Obj17, Obj18, Obj19){
    let j = Math.floor(i/2)*4 + i % 2;
    if(i % 2 == 0){
        if(randomIndex == 0){
            let n = 0;
            let m = 0;
            setTimeout(() => {
                
                let r = Math.random();
                Obj1.style.scale = '1';
                Obj2.style.scale = '1';
                Obj3.style.transform = 'translateX(0px)';
                Obj4.style.transform = 'translateY(0px)';
                Obj5.style.transform = 'translateX(0px)';
                Obj6.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                r = Math.random();
                Obj6.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                Obj7.style.transform = 'translateY(0px)';
                Obj8.style.scale = '1';
                Obj9.style.transform = 'translateX(0px)';
                Obj10.style.transform = 'translateY(0px)';
            }, 10);
            setInterval(() => {
                let r = Math.random();
                n = (n+1)%3;
                m = (m+1)%2;
                if (n == 0){
                    Obj6.style.display = 'none';
                    Obj11.style.display = 'block';
                    Obj11.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj11.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else if (n == 1){
                    Obj11.style.display = 'none';
                    Obj12.style.display = 'block';
                    Obj12.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj12.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else {
                    Obj12.style.display = 'none';
                    Obj6.style.display = 'block';
                    Obj6.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj6.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                } 
                if(m == 0){
                    Obj1.style.animation = 'Obj1-01In 1s';
                    Obj1.style.transform = 'rotateY(90deg)';
                    Obj8.style.animation = 'Obj1-08In 1s';
                    Obj8.style.transform = 'rotateY(0deg)';
                }
                else{
                    Obj1.style.animation = 'Obj1-01Out 1s';
                    Obj1.style.transform = 'rotateY(0deg)';
                    Obj8.style.animation = 'Obj1-08Out 1s';
                    Obj8.style.transform = 'rotateY(-90deg)';
                }
            }, 2000);
        }
        else{
            let n = 0;
            setTimeout(() => {
                
                let r = Math.random();
                Obj1.style.opacity = '1';
                Obj2.style.transform = 'translateX(0px)';
                Obj3.style.transform = 'translateX(0px)';
                Obj4.style.transform = 'translateX(0px)';
                Obj5.style.transform = 'translateX(0px)';
                Obj6.style.transform = 'translateX(0px) rotateY(180deg)';
                Obj7.style.transform = 'translateX(0px) rotateY(0deg)';
                Obj8.style.transform = 'translateX(0px)';
                Obj9.style.transform = 'translateX(0px)';
            }, 10);
            setInterval(() => {
                let r = Math.random();
                n = (n+1)%2;
                if(n == 0){
                    Obj13.style.display = 'none';
                    Obj10.style.display = 'block';
                    Obj10.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj10.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj14.style.display = 'none';
                    Obj11.style.display = 'block';
                    Obj11.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj11.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj15.style.display = 'none';
                    Obj12.style.display = 'block';
                    Obj12.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj12.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj18.style.display = 'none';
                    Obj16.style.display = 'block';
                    Obj16.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj16.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj19.style.display = 'none';
                    Obj17.style.display = 'block';
                    Obj17.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj17.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else {
                    Obj10.style.display = 'none';
                    Obj13.style.display = 'block';
                    Obj13.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj13.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj11.style.display = 'none';
                    Obj14.style.display = 'block';
                    Obj14.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj14.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj12.style.display = 'none';
                    Obj15.style.display = 'block';
                    Obj15.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj15.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj16.style.display = 'none';
                    Obj18.style.display = 'block';
                    Obj18.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj18.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                    Obj17.style.display = 'none';
                    Obj19.style.display = 'block';
                    Obj19.style.left = 200+ r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj19.style.top = 200+ r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                
            }, 2000);
        }
    }
    else{
        if(randomIndex == 0){
            let n = 0;
            setTimeout(() => {
                let r = Math.random();
                Obj1.style.transform = 'translateX(0px)';
                Obj2.style.transform = 'translateX(0px)';
                Obj3.style.transform = 'translateX(0px)';
                Obj4.style.transform = 'translateX(0px)';
                Obj5.style.transform = 'translateX(0px)';
                Obj6.style.transform = 'translateX(0px)';
                Obj7.style.transform = 'translateX(0px)';
                Obj8.style.transform = 'translateX(0px)';
                Obj9.style.opacity = '1';
                Obj10.style.scale = '1';
                Obj11.style.transform = 'translateX(0px)';
                Obj12.style.transform = 'translate(0px, 0px)';
                Obj13.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                r = Math.random();
                Obj13.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
            }, 0);
            setInterval(() => {
                let r = Math.random();
                n = (n+1)%3;
                if (n == 0){
                    Obj13.style.display = 'none';
                    Obj14.style.display = 'block';
                    Obj14.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj14.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else if (n == 1){
                    Obj14.style.display = 'none';
                    Obj15.style.display = 'block';
                    Obj15.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj15.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else {
                    Obj15.style.display = 'none';
                    Obj13.style.display = 'block';
                    Obj13.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj13.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
            }, 1000);
        }
        else{
            let n = 0;
            setTimeout(() => {
                let r = Math.random();
                Obj1.style.transform = 'translateX(0px)';
                Obj2.style.transform = 'translateX(0px)';
                Obj3.style.transform = 'translateX(0px)';
                Obj4.style.transform = 'translateX(0px)';
                Obj5.style.transform = 'translateX(0px)';
                Obj6.style.transform = 'translateX(0px)';
                Obj7.style.transform = 'translateX(0px)';
                Obj8.style.transform = 'translateX(0px)';
                Obj9.style.opacity = '1';
                Obj10.style.scale = '1';
                Obj11.style.transform = 'translateX(0px)';
                Obj12.style.transform = 'translate(0px, 0px)';
                Obj13.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                r = Math.random();
                Obj13.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
            }, 0);
            setInterval(() => {
                let r = Math.random();
                n = (n+1)%3;
                if (n == 0){
                    Obj13.style.display = 'none';
                    Obj14.style.display = 'block';
                    Obj14.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj14.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else if (n == 1){
                    Obj14.style.display = 'none';
                    Obj15.style.display = 'block';
                    Obj15.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj15.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
                else {
                    Obj15.style.display = 'none';
                    Obj13.style.display = 'block';
                    Obj13.style.left = 200 + r*(globalWidth - 400) - 100 + "px";
                    r = Math.random();
                    Obj13.style.top = 200 + r*(globalHeight - 400) - 100 + j*globalHeight + "px";
                }
            }, 1000);
        }
    }
}

function objsAnimationOut(textItem, i, randomIndex){
    let Objs = {}; // 使用物件儲存
    if(i % 2 == 0){
        if(randomIndex == 0){
            if (textItem) {
                for (let i = 1; i <= 12; i++) {
                    let id = "Obj1-" + (i < 10 ? "0" + i : i); // 產生 id 字串
                    Objs["Obj" + i] = textItem.querySelector("#" + id); // 使用 querySelector 直接尋找
                }
            } else {
                console.error("找不到父元素");
            }
            Objs.Obj1.style.transition = 'all 1s cubic-bezier(0.6, -0.25, 0.6, 0)';
            Objs.Obj1.style.scale = '0';
            Objs.Obj2.style.transition = 'all 1s cubic-bezier(0.6, -0.25, 0.6, 0)';
            Objs.Obj2.style.scale = '0';
            Objs.Obj3.style.transform = 'translateX(-236px)';
            Objs.Obj4.style.transform = 'translateY(-410px)';
            Objs.Obj5.style.transform = 'translateX(236px)';
            Objs.Obj7.style.transform = 'translateY(-220px)';
            Objs.Obj8.style.transition = 'all 1s cubic-bezier(0.6, -0.25, 0.6, 0)';
            Objs.Obj8.style.scale = '0';
            Objs.Obj9.style.transform = 'translateX(-223px)';
            Objs.Obj10.style.transform = 'translateY(-59px)';
            setTimeout(() => {
                Objs.Obj1.remove();
                Objs.Obj2.remove();
                Objs.Obj3.remove();
                Objs.Obj4.remove();
                Objs.Obj5.remove();
                Objs.Obj6.remove();
                Objs.Obj7.remove();
                Objs.Obj8.remove();
                Objs.Obj9.remove();
                Objs.Obj10.remove();
                Objs.Obj11.remove();
                Objs.Obj12.remove();
            }, 1000);
        }
        else{
            if (textItem) {
                for (let i = 1; i <= 19; i++) {
                    let id = "Obj3-" + (i < 10 ? "0" + i : i); // 產生 id 字串
                    Objs["Obj" + i] = textItem.querySelector("#" + id); // 使用 querySelector 直接尋找
                }
            } else {
                console.error("找不到父元素");
            }
            Objs.Obj1.style.opacity = '0';
            Objs.Obj2.style.transform = 'translateX(-504px)';
            Objs.Obj3.style.transform = 'translateX(504px)';
            Objs.Obj4.style.transform = 'translateX(-436px)';
            Objs.Obj5.style.transform = 'translateX(436px)';
            Objs.Obj6.style.transform = 'translateX(-436px) rotateY(0deg)';
            Objs.Obj7.style.transform = 'translateX(436px) rotateY(180deg)';
            Objs.Obj8.style.transform = 'translateX(-504px)';
            Objs.Obj9.style.transform = 'translateX(604px)';
            setTimeout(() => {
                Objs.Obj1.remove();
                Objs.Obj2.remove();
                Objs.Obj3.remove();
                Objs.Obj4.remove();
                Objs.Obj5.remove();
                Objs.Obj6.remove();
                Objs.Obj7.remove();
                Objs.Obj8.remove();
                Objs.Obj9.remove();
                Objs.Obj10.remove();
                Objs.Obj11.remove();
                Objs.Obj12.remove();
                Objs.Obj13.remove();
                Objs.Obj14.remove();
                Objs.Obj15.remove();
                Objs.Obj16.remove();
                Objs.Obj17.remove();
                Objs.Obj18.remove();
                Objs.Obj19.remove();
            }, 1000);
        }
    }
    else{
        if(randomIndex == 0){
            if (textItem) {
                for (let i = 1; i <= 15; i++) {
                    let id = "Obj2-" + (i < 10 ? "0" + i : i); // 產生 id 字串
                    Objs["Obj" + i] = textItem.querySelector("#" + id); // 使用 querySelector 直接尋找
                }
            } else {
                console.error("找不到父元素");
            }
            Objs.Obj1.style.transform = 'translateX(440px)';
            Objs.Obj2.style.transform = 'translateX(-421px)';
            Objs.Obj3.style.transform = 'translateX(162px)';
            Objs.Obj4.style.transform = 'translateX(-249px)';
            Objs.Obj5.style.transform = 'translateX(-230px)';
            Objs.Obj6.style.transform = 'translateX(-317px)';
            Objs.Obj7.style.transform = 'translateX(268px)';
            Objs.Obj8.style.transform = 'translateX(236px)';
            Objs.Obj9.style.opacity = '0';
            Objs.Obj10.style.transition = 'all 1s cubic-bezier(0.6, -0.25, 0.6, 0)';
            Objs.Obj10.style.scale = '0';
            Objs.Obj11.style.transform = 'translateX(230px)';
            Objs.Obj12.style.transform = 'translate(-303px, -165px)';
            setTimeout(() => {
                Objs.Obj1.remove();
                Objs.Obj2.remove();
                Objs.Obj3.remove();
                Objs.Obj4.remove();
                Objs.Obj5.remove();
                Objs.Obj6.remove();
                Objs.Obj7.remove();
                Objs.Obj8.remove();
                Objs.Obj9.remove();
                Objs.Obj10.remove();
                Objs.Obj11.remove();
                Objs.Obj12.remove();
                Objs.Obj13.remove();
                Objs.Obj14.remove();
                Objs.Obj15.remove();
            }, 1000);
        }
        else{
            if (textItem) {
                for (let i = 1; i <= 15; i++) {
                    let id = "Obj2-" + (i < 10 ? "0" + i : i); // 產生 id 字串
                    Objs["Obj" + i] = textItem.querySelector("#" + id); // 使用 querySelector 直接尋找
                }
            } else {
                console.error("找不到父元素");
            }
            Objs.Obj1.style.transform = 'translateX(440px)';
            Objs.Obj2.style.transform = 'translateX(-421px)';
            Objs.Obj3.style.transform = 'translateX(162px)';
            Objs.Obj4.style.transform = 'translateX(-249px)';
            Objs.Obj5.style.transform = 'translateX(-230px)';
            Objs.Obj6.style.transform = 'translateX(-317px)';
            Objs.Obj7.style.transform = 'translateX(268px)';
            Objs.Obj8.style.transform = 'translateX(236px)';
            Objs.Obj9.style.opacity = '0';
            Objs.Obj10.style.transition = 'all 1s cubic-bezier(0.6, -0.25, 0.6, 0)';
            Objs.Obj10.style.scale = '0';
            Objs.Obj11.style.transform = 'translateX(230px)';
            Objs.Obj12.style.transform = 'translate(-303px, -165px)';
            setTimeout(() => {
                Objs.Obj1.remove();
                Objs.Obj2.remove();
                Objs.Obj3.remove();
                Objs.Obj4.remove();
                Objs.Obj5.remove();
                Objs.Obj6.remove();
                Objs.Obj7.remove();
                Objs.Obj8.remove();
                Objs.Obj9.remove();
                Objs.Obj10.remove();
                Objs.Obj11.remove();
                Objs.Obj12.remove();
                Objs.Obj13.remove();
                Objs.Obj14.remove();
                Objs.Obj15.remove();
            }, 1000);
        }
    }
}

updateMarquee();


setInterval(function(){
    if(marquee_editing == false && marquee_img_editing == false && isLooking == true){
        slideToNext();
    }
}, 4000);



// 處理檔案讀取
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 將檔案內容按行分割，排除空行並附加到 messages 中
            const newMessages = e.target.result.split('\n').filter(line => line.trim() !== '');
            messages = messages.concat(newMessages); // 保留原本訊息，附加新內容
            updateMarquee(); // 更新跑馬燈內容
        };
        reader.readAsText(file);
    }
});

let timer;
let touchStartTime;
var marquee_img_editing = false;


function imgTouchStart(x) {
    clearTimeout(timer);
    x.style.scale = '0.95';
    x.style.borderRadius = '20px';
    touchStartTime = Date.now();
    marquee_img_editing = true;
    timer = setTimeout(() => {
        // 長按超過 1 秒後顯示選單
        showMenu(x);
        marquee_img_editing = true;

    }, 1000); 
}

function imgTouchMove(x) {
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration < 1000) {
        x.style.scale = '0.95';
        x.style.borderRadius = '20px';
        marquee_img_editing = false;
    }
}

function imgTouchEnd(x) {
    
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    if (touchDuration < 1000) {
        x.style.scale = '1';
        x.style.borderRadius = '0px';
        marquee_img_editing = false;
    }
}

const marqueeContainer = this.document.getElementsByClassName('marquee-container');


function showMenu(x) {
    marquee_img_editing = true;
    x.style.scale = 780/globalWidth;
    x.style.transform = "translateY(-200px)";
    const BG = document.createElement('div');
    BG.classList.add('imgEditorBG');
    marqueeContainer[0].appendChild(BG);
    BG.oncontextmenu = () => {return false};
    const section1 = document.createElement('div');
    section1.classList.add('section1');
    section1.style.height = 780 * globalHeight / globalWidth + 40 + "px";
    BG.appendChild(section1);
    section1.oncontextmenu = () => {return false};
    const imgA = document.createElement('img');
    imgA.classList.add('imgA');
    imgA.style.height = 780 * globalHeight / globalWidth + "px";
    imgA.src = x.src;
    section1.appendChild(imgA);
    imgA.oncontextmenu = () => {return false};
    const section2 = document.createElement('div');
    section2.classList.add('section2');
    BG.appendChild(section2);
    section2.oncontextmenu = () => {return false};
    const btn1 = document.createElement('label');
    btn1.classList.add('btn');
    btn1.id = 'btn1';
    section2.appendChild(btn1);
    btn1.oncontextmenu = () => {return false};
    btn1.textContent = "從裝置中上傳";
    btn1.onclick = () => {changeImgFromDevice(x, btn1, imgA)};
    const icon1 = document.createElement('img');
    icon1.src = '../data/icon/dark/upload.svg';
    icon1.classList.add('icon');
    btn1.appendChild(icon1);
    const btn2 = document.createElement('button');
    btn2.classList.add('btn');
    section2.appendChild(btn2);
    btn2.oncontextmenu = () => {return false};
    btn2.id = 'btn2';
    btn2.textContent = "從已匯入清單中選擇";
    btn2.onclick = () => {showImageList(x, imgA)};
    const icon2 = document.createElement('img');
    icon2.src = '../data/icon/dark/list.svg';
    icon2.classList.add('icon');
    btn2.appendChild(icon2);
    const btn3 = document.createElement('button');
    btn3.classList.add('btn');
    section2.appendChild(btn3);
    btn3.id = 'btn3';
    btn3.oncontextmenu = () => {return false};
    btn3.textContent = "重設為預設照片";
    btn3.onclick = () => {previewImg("Default", x, null, imgA);};
    const icon3 = document.createElement('img');
    icon3.src = '../data/icon/dark/back.svg';
    icon3.classList.add('icon');
    btn3.appendChild(icon3);
    const btn4 = document.createElement('button');
    btn4.classList.add('btn');
    btn4.id = 'btn4';
    section2.appendChild(btn4);
    btn4.textContent = "關閉";
    btn4.oncontextmenu = () => {return false};
    btn4.onclick = () => {closeMenu(BG,x,section1,section2)};
    const icon4 = document.createElement('img');
    icon4.src = '../data/icon/close.svg';
    icon4.classList.add('icon');
    btn4.appendChild(icon4);
}

function changeImgFromDevice(x, y, z) {
    const imgInput = document.createElement('input');
    imgInput.type = "file";
    imgInput.accept = "image/*";
    imgInput.id = "imgInput";
    imgInput.style.display = 'none';
    y.appendChild(imgInput);
    imgInput.onchange = () => {uploadImgFromDevice(imgInput, x, z)};
}
async function uploadImgFromDevice (imgInput, x, z) {
    const file = imgInput.files[0];
    if(!file){
        alert('請選擇圖片');
        return;
    }
    const formData = new FormData();
    formData.append('image', file);
    fetch('/uploadFromDevice', { // 後端上傳路徑
            method: 'POST',
            body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('圖片上傳成功');
            const imgName = data.filename;
            previewImg(imgName, x, imgName, z);

        } else {
            alert('圖片上傳失敗：' + data.message);
        }
        })
    .catch(error => {
        console.error('上傳錯誤:', error);
        alert('上傳過程中發生錯誤');
    });
}

// 修改 saveImgIndex 函數以返回 Promise
async function saveImgIndex(imgName, x) {
    try {
        const responseGet = await fetch('/get-image-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        
        const text = await responseGet.text();
        const lines = text.split('\n');
        const index = (parseInt(iframeId)-1)*imgLen + parseInt(x.id.split('-')[1]);
        
        // 確保有足夠的行數
        while (lines.length <= index) {
            lines.push("");
        }
        
        lines[index] = `${parseInt(iframeId)}/${imgName}`;
        const updatedText = lines.join('\n');
        
        const responsePost = await fetch('/save-image-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedText }),
        });

        if (!responsePost.ok) {
            throw new Error(`HTTP error! status: ${responsePost.status}`);
        }
        
        return await responsePost.text();
    } catch (error) {
        console.error("Error updating file:", error);
        throw error;
    }
}

async function updateImg(x) {
    try {
        const response = await fetch('../data/marquee_img_index.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const index = (parseInt(iframeId)-1)*imgLen + parseInt(x.id.split('-')[1]);
        images = images.concat(lines);
        if (index < lines.length){
            let img = images[index];
            if (img.startsWith(iframeId)){
                img = img.split('/')[1];
                if (img.startsWith("Default")) {
                    x.src = DefaultImg;
                }
                else {
                    x.src = '../data/marquee_img_input/'+img;
                }
            }
            else {
                x.src = DefaultImg;
            }
        }
        else {
            x.src = DefaultImg;
        }
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

async function showImageList(x, z) {
    try {
        const response = await fetch('/get-image-list');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const imageList = data.images;

        const BG = document.createElement('div');
        BG.classList.add('imgListBG');
        marqueeContainer[0].appendChild(BG);
        const section1 = document.createElement('section');
        section1.classList.add('section1');
        BG.appendChild(section1);
        const section1Title = document.createElement('div');
        section1Title.classList.add('title');
        section1Title.textContent = "請選擇以下照片來更換";
        section1.appendChild(section1Title);
        const section1Content = document.createElement('div');
        section1Content.classList.add('content');
        section1.appendChild(section1Content);
        const subtitle1 = document.createElement('div');
        subtitle1.classList.add('subtitle');
        subtitle1.textContent = "　已匯入圖檔";
        section1Content.appendChild(subtitle1);
        const listContainer = document.createElement('section');
        listContainer.classList.add('imageListContainer');
        listContainer.style.overflow = "hidden"; 
        section1Content.appendChild(listContainer);
        if (!imageList || imageList.length === 0) {
            const subtitle2 = document.createElement('div');
            subtitle2.classList.add('subtitle');
            subtitle2.id = 'subtitle2';
            subtitle2.textContent = "沒有已匯入的照片";
            section1Content.appendChild(subtitle2);
        }
        else
        {
            imageList.forEach(async (imageName, n ) => {
                const imageItem = document.createElement('button');
                listContainer.appendChild(imageItem);
                imageItem.textContent = imageName;
                imageItem.classList.add('imgItem');
                if (n == 0){
                    imageItem.style.borderTopLeftRadius = '20px';
                    imageItem.style.borderTopRightRadius = '20px';
                }
                if( n == imageList.length-1){
                    imageItem.style.borderBottomRightRadius = '20px';
                    imageItem.style.borderBottomLeftRadius = '20px';
                }
                const imgIcon = document.createElement('img');
                imgIcon.src = '../data/marquee_img_input/'+imageName;
                imgIcon.classList.add('imgIcon');
                const imgInfo = document.createElement('span');
                imgInfo.classList.add('imgInfo');
                const options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  };

                fetchImageInfo(imageName)
                    .then(data => {
                        imgInfo.textContent = `${Math.floor(data.size / globalHeight)} KB | ${new Date(data.createdDate).toLocaleDateString('zh-TW', options)}`;
                    })
                    .catch(error => {
                        console.error('Error fetching image info:', error);
                        imgInfo.textContent = '無法取得檔案資訊';
                });
                imageItem.appendChild(imgIcon);
                imageItem.appendChild(imgInfo);
                imageItem.onclick = () => {
                    const imgName = imageName;
                    previewImg(imgName, x, null, z);
                };
            });
        }
        const subtitle3 = document.createElement('div');
        subtitle3.classList.add('subtitle');
        subtitle3.textContent = "　更多選項";
        section1Content.appendChild(subtitle3);
        const listContainer2 = document.createElement('section');
        listContainer2.classList.add('imageListContainer');
        listContainer2.style.overflow = "hidden"; 
        listContainer2.id = 'imageListContainer2';
        section1Content.appendChild(listContainer2);
        const btn1 = document.createElement('label');
        listContainer2.appendChild(btn1);
        btn1.textContent = "從裝置中上傳";
        btn1.classList.add('imgItem');
        btn1.id = 'preViewBtn1';
        btn1.style.borderTopLeftRadius = '20px';
        btn1.style.borderTopRightRadius = '20px';
        btn1.style.width = '590px';
        btn1.onclick = () => {changeImgFromDevice(x, btn1, z); };
        const icon1 = document.createElement('img');
        icon1.src = '../data/icon/dark/upload.svg';
        icon1.classList.add('imgIcon2');
        btn1.appendChild(icon1);
        const btn2 = document.createElement('button');
        listContainer2.appendChild(btn2);
        btn2.textContent = "重設為預設圖片";
        btn2.classList.add('imgItem');
        btn2.onclick = () => {previewImg("Default", x, null, z);};
        const icon2 = document.createElement('img');
        icon2.src = '../data/icon/dark/back.svg';
        icon2.classList.add('imgIcon2');
        btn2.appendChild(icon2);
        const btn3 = document.createElement('button');
        listContainer2.appendChild(btn3);
        btn3.textContent = "關閉選單";
        btn3.style.color = '#f4442e';
        btn3.classList.add('imgItem');
        btn3.style.borderBottomLeftRadius = '20px';
        btn3.style.borderBottomRightRadius = '20px';
        btn3.onclick = () => {closeImageList(BG, section1);};
        const icon3 = document.createElement('img');
        icon3.src = '../data/icon/close.svg';
        icon3.classList.add('imgIcon2');
        btn3.appendChild(icon3);
    } catch (error) {
        console.error('Error fetching image list:', error);
        alert('無法取得圖片列表。');
    }
}

async function fetchImageInfo(imageName) {
    const response = await fetch(`/getImageInfo?imageName=${imageName}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  }

  function previewImg(imgName, x, y, z) {
    const preViewBG = document.createElement('div');
    preViewBG.classList.add('imgListBG');
    marqueeContainer[0].appendChild(preViewBG);
    const g = document.createElement('div');
    g.classList.add('g');
    preViewBG.appendChild(g);
    const preViewSection1 = document.createElement('section');
    preViewSection1.classList.add('section1', 'preViewSection1');
    g.appendChild(preViewSection1);
    const section1Title = document.createElement('div');
    section1Title.classList.add('title');
    section1Title.textContent = "更換照片？";
    preViewSection1.appendChild(section1Title);
    const preViewImg = document.createElement('img');
    preViewImg.classList.add('preViewImg');
    preViewImg.style.height = 633 * globalHeight / globalWidth + "px";
    preViewImg.style.marginTop = (500 - 633 * globalHeight / globalWidth)/2 + "px";
    preViewImg.style.marginBottom = (500 - 633 * globalHeight / globalWidth)/2 + "px";
    
    // 設定預覽圖片來源
    const imgSrc = imgName === "Default" ? '../data/Default.jpg' : `../data/marquee_img_input/${imgName}`;
    preViewImg.src = imgSrc;
    preViewSection1.appendChild(preViewImg);
    
    const subtitle1 = document.createElement('div');
    subtitle1.classList.add('subtitle');
    subtitle1.textContent = imgName === "Default" 
        ? "是否更換為預設照片？" 
        : "是否更換為當前照片？";
    preViewSection1.appendChild(subtitle1);
    
    const preViewBtns = document.createElement('div');
    preViewBtns.classList.add('preViewBtns');
    g.appendChild(preViewBtns);
    
    // 取消按鈕
    const btn1 = document.createElement('button');
    btn1.classList.add('preViewBtn1');
    btn1.textContent = "取消";
    btn1.style.color = '#f4442e';
    preViewBtns.appendChild(btn1);
    btn1.onclick = async () => {
        if (y != null) {
            await deleteUploadedImage(y);
        }
        closeImageList(preViewBG, g);
    };
    
    // 更換按鈕
    const btn2 = document.createElement('button');
    btn2.classList.add('preViewBtn2');
    btn2.textContent = "更換";
    preViewBtns.appendChild(btn2);
    btn2.onclick = async () => {
        try {
            // 立即更新圖片
            await updateImages(imgName, x, z);
            
            // 儲存圖片索引
            await saveImgIndex(imgName, x);
            
            alert('已成功更換照片！');
            closeImageList(preViewBG, g);
        } catch (error) {
            console.error('更換圖片時發生錯誤:', error);
            alert('更換圖片時發生錯誤，請稍後再試');
        }
    };
}


// 新增 updateImages 函數來處理圖片更新
async function updateImages(imgName, mainImg, previewImg = null) {
    const imgSrc = imgName === "Default" ? '../data/Default.jpg' : `../data/marquee_img_input/${imgName}`;
    
    // 更新主要圖片
    if (mainImg) {
        mainImg.src = imgSrc;
    }
    
    // 更新預覽圖片（如果存在）
    if (previewImg) {
        previewImg.src = imgSrc;
    }
    
    // 找到所有相關的圖片並更新
    const imgId = mainImg.id;
    const [tableNumber, position] = imgId.split('-');
    const relatedImages = document.querySelectorAll(`img[id^="${tableNumber}-${position}"]`);
    
    relatedImages.forEach(img => {
        if (img !== mainImg && img !== previewImg) {
            img.src = imgSrc;
        }
    });
}

async function deleteUploadedImage(imgName) {
    try {
        const encodedFilename = encodeURIComponent(imgName); // URL 編碼
        const response = await fetch(`/deleteImage/${encodedFilename}`, {
            method: 'DELETE',
        });
      if (!response.ok) {
        throw new Error('刪除圖片失敗');
      }
  
      // 檢查伺服器端回傳的資訊 (例如 response.json())
      const data = await response.json();
      if (data.success) {
        console.log('圖片已成功刪除');
      } else {
        console.error('上傳失敗，無法刪除圖片:', data.message);
      }
    } catch (error) {
      console.error('刪除圖片失敗:', error);
    }
  }


function closeImageList(BG , section1) {
    BG.style.animation = 'opticityOut 0.4s cubic-bezier(.4,0,.2,1)';
    section1.style.animation = 'scaleOut 0.4s cubic-bezier(.4,0,.2,1)';
    setTimeout(function(){BG.remove();},300);
}

function closeMenu(x,y,a,b){
    x.style.animation = 'opticityOut 0.4s cubic-bezier(.4,0,.2,1)';
    setTimeout(function(){x.parentNode.removeChild(x)},300);
    y.style.scale = '1';
    y.style.borderRadius = '0px';
    y.style.transform = "translateY(0px)";
    marquee_img_editing = false;
    a.style.animation = 'zoomOut 0.4s cubic-bezier(.4,0,.2,1)';
    b.style.animation = 'slideOut 0.4s cubic-bezier(.4,0,.2,1)';
}

window.addEventListener('message', (event) => {
    if (event.data.isLooking !== undefined) {
        isLooking = event.data.isLooking;
        // 更新頁面，根據 isLooking 的值進行相應操作
    }
});

let url = window.location.href;
var ws = new WebSocket(url)
// 監聽連線狀態
ws.onopen = () => {
    console.log('open connection')
}
ws.onclose = () => {
    console.log('Connection closed. Reconnecting...');
    ws = new WebSocket(url)
    // 監聽連線狀態
    ws.onopen = () => {
        console.log('open connection')
    }
    ws.onclose = () => {
        console.log('Connection closed. Reconnecting...');
    }

    ws.onmessage = (event) => {
        const keys = [0, tableNumber];
        let tempArray = [];
        let newValue = "";
        keys.forEach((k, i) => {
            tempArray = tempArray.concat(event.data.split('\n')[k]);
        });
        if (tempArray[0].startsWith("歡迎光臨")) {
            tempArray[0] = tempArray[0].substring(0,4)+"\n"+tempArray[0].substring(5,tempArray[0].length);
        }
        tempArray[1] = tempArray[1].substring(0,tempArray[1].search("桌")+1)+"\n"+tempArray[1].substring(tempArray[1].search("桌")+2,tempArray[1].length);
        for(let i = 0; i < 2; i++){
            newValue = tempArray[i];
            updateAllRelatedText(newValue, i, tableNumber);
        }
    }
}

ws.onmessage = (event) => {
    const keys = [0, tableNumber];
    let tempArray = [];
    let newValue = "";
    keys.forEach((k, i) => {
        tempArray = tempArray.concat(event.data.split('\n')[k]);
    });
    if (tempArray[0].startsWith("歡迎光臨")) {
        tempArray[0] = tempArray[0].substring(0,4)+"\n"+tempArray[0].substring(5,tempArray[0].length);
    }
    tempArray[1] = tempArray[1].substring(0,tempArray[1].search("桌")+1)+"\n"+tempArray[1].substring(tempArray[1].search("桌")+2,tempArray[1].length);
    for(let i = 0; i < 2; i++){
        newValue = tempArray[i];
        updateAllRelatedText(newValue, i, tableNumber);
    }
}

function adjustScale(){
    globalWidth = window.innerWidth;
    globalHeight = window.innerHeight;
    marqueeContainer[0].style.width = globalWidth + "px";
    marqueeContainer[0].style.height = globalHeight + "px";
}