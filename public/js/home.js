const page = document.getElementById('mainSection');
const iframes = document.getElementsByClassName('iframepage');
const scrollBar = document.getElementById('scrollBar');
const scrollBarSection = document.getElementById('scrollBarSection');
const pageNumSection = document.getElementById('pageNumSection');
const toolSection = document.getElementById('toolSection');
const prePageBtn = document.getElementById('prePageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const images = [];
let globalWidth;
let globalHeight;
async function createIframes(){
    const response = await fetch('/data/marquee_table_number.txt');
    const text = await response.text();
    const newMessages = text.split('\n').filter(line => line.trim() !== '');
    for (let i = 0; i < newMessages.length-1; i++) {
        const item = document.createElement('iframe');
        item.src = `/html/marquee.html?iframeId=${i+1}`;
        item.classList.add('iframepage');
        adjustScale(item);
        item.frameBorder = 0;
        document.getElementById('mainSection').appendChild(item);
        const scrollBars = document.createElement('button');
        if (newMessages.length-1 <= 10) {
            scrollBars.style.width = globalWidth*0.8/(newMessages.length-1) + "px";
            scrollBars.style.marginLeft = (globalWidth/(newMessages.length-1) - globalWidth*0.8/(newMessages.length-1))/2 + "px";
            scrollBars.style.marginRight = (globalWidth/(newMessages.length-1) - globalWidth*0.8/(newMessages.length-1))/2 + "px";
        }
        else {
            scrollBars.style.width = globalWidth*0.8/10 + "px";
            scrollBars.style.marginLeft = (globalWidth/10 - globalWidth*0.8/10)/2 + "px";
            scrollBars.style.marginRight = (globalWidth/10 - globalWidth*0.8/10)/2 + "px";
        }
        scrollBars.classList.add('scrollBarBG');
        scrollBars.style.border = 'none';
        scrollBars.id = (i+1);
        scrollBarSection.appendChild(scrollBar);
        scrollBars.onclick = () => {goToPage(i)};
        if (i == 0 || i % 10 == 0){
            const scrollBarGroup = document.createElement('div');
            scrollBarGroup.classList.add('scrollBarGroup');
            scrollBarGroup.id = (i/10);
            scrollBarSection.appendChild(scrollBarGroup);
            scrollBarGroup.appendChild(scrollBars);
        }
        else {
            const scrollBarGroup = document.getElementsByClassName('scrollBarGroup');
            for (let j = 0; j < scrollBarGroup.length; j++){
                if (parseInt(scrollBarGroup[j].id) == Math.floor((parseInt(scrollBars.id)-1)/10)){
                    scrollBarGroup[j].appendChild(scrollBars);

                }
            }
        }
    }
    if (iframes.length < 10){
        scrollBar.style.width = globalWidth/iframes.length + "px";
    }
    else {
        scrollBar.style.width = globalWidth/10 + "px";
    }
    scrollBar.style.zIndex = 10;
    defaultPageNum();
    lockWake();
    showWake();
    setDefaultPageEditor(newMessages);
}
const pageNumObj = document.getElementById('pageNum');
const pageNumObj2 = document.getElementById('pageNum2');
const pageNumObj3 = document.getElementById('pageNum3');

for (let i = 0; i < iframes.length; i++) {
    iframes[i].id = (i + 1);
    
}


page.addEventListener('scroll', () => {
    const scrollLeft = page.scrollLeft;
    const pageNum = Math.round(scrollLeft*iframes.length/page.scrollWidth);
    const pageNum2 = scrollLeft*iframes.length/page.scrollWidth;
    if(iframes.length % 10 != 0) {
        scrollBarSection.scrollLeft = ((Math.floor(pageNum/10) / (Math.floor(iframes.length/10)+1))) * scrollBarSection.scrollWidth;
    }
    else {
        scrollBarSection.scrollLeft = ((Math.floor(pageNum/10) / (Math.floor(iframes.length/10)))) * scrollBarSection.scrollWidth;
    }
    if (iframes.length < 10) {
        scrollBar.style.left = (scrollLeft/iframes.length) + "px";
    }
    else {
        scrollBar.style.left = (scrollLeft/iframes.length)*(iframes.length/10) + "px";
    }
    pageNumObj.style.transform = "translateX(" + -pageNum2*69.8 +"px)";
    for (let n = 0; n < iframes.length; n++){
        const currentIframe = iframes[n];
        let isLooking = false;
        if( n == pageNum){
            isLooking = true;
        }
        else{
            isLooking = false;
        }
        currentIframe.contentWindow.postMessage({ isLooking }, '*');
    }
})

function goToPage(n){
    const targetScrollLeft = (n / iframes.length) * page.scrollWidth;
    if(iframes.length % 10 != 0) {
        scrollBarSection.scrollLeft = ((Math.floor(n/10) / (Math.floor(iframes.length/10)+1))) * scrollBarSection.scrollWidth;
    }
    else {
        scrollBarSection.scrollLeft = ((Math.floor(n/10) / (Math.floor(iframes.length/10)))) * scrollBarSection.scrollWidth;
    }
    page.scrollLeft = targetScrollLeft;
}


function nextPage() {
    const scrollLeft = page.scrollLeft;
    const pageNum = Math.round(scrollLeft*iframes.length/page.scrollWidth);
    goToPage((pageNum+1) % iframes.length);
}

function prePage() {
    const scrollLeft = page.scrollLeft;
    let pageNum = Math.round(scrollLeft*iframes.length/page.scrollWidth);
    if (pageNum > 0){
        goToPage((pageNum-1) % iframes.length);
    }
    else {
        pageNum = iframes.length;
        goToPage(pageNum);
    }
}


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.navigator.msMaxTouchPoints > 0;
}


let timer;
let lockTouchStartTime;
let isLocked = false;
let isLockWorking = false;
let timer2;
const lockControl = document.getElementById('lockControl');
const lock1= document.getElementById('lock1');
const lock2= document.getElementById('lock2');
if (isMobile()) {
    lockControl.ontouchstart = () => {lockTouchStart(lockControl)};
    lockControl.ontouchmove = () => {lockTouchMove(lockControl)};
    lockControl.ontouchend = () => {lockTouchEnd(lockControl)};
}
else {
    lockControl.onmousedown = () => {lockTouchStart(lockControl)};
    lockControl.onmousemove = () => {lockTouchMove(lockControl)};
    lockControl.onmouseup = () => {lockTouchEnd(lockControl)};
}
lockControl.oncontextmenu = () => {return false};
lock1.oncontextmenu = () => {return false};
lock2.oncontextmenu = () => {return false};

function lockTouchStart(x){
    clearTimeout(timer);
    if(isPageNumMenu == false){
        lockTouchStartTime = Date.now();
        isLockWorking = true;
    
        timer = setTimeout(() => {
            if (isLocked == false){
                locked(x);
            }
            else{
                unlocked(x);
            }
        }, 1000);
    
        if (isLocked == false){
            x.style.scale = '1.1';
        }
        else {
            x.style.scale = '0.6';
        }
        
    }
    else{
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
        lockWake();
    }
}

function lockTouchMove(x) {
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - lockTouchStartTime;
    if (touchDuration < 1000){
        if (isLocked == false){
            x.style.scale = '1';
        }
        else {
            x.style.scale = '0.7';
        }
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
    }
    if (isLockWorking == false){
        clearTimeout(timer2);
        timer2 = setTimeout(function(){
            lockSleep();
        },5000);
    }
    else{
        clearTimeout(timer2);
    }
    isLockWorking = false;
}

function lockTouchEnd(x) {
    clearTimeout(timer);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - lockTouchStartTime;
    isLockWorking = false;
    if (touchDuration < 1000){
        if (isLocked == false){
            x.style.scale = '1';
        }
        else {
            x.style.scale = '0.7';
        }
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
    }
    if (isLockWorking == false){
        clearTimeout(timer2);
        timer2 = setTimeout(function(){
            lockSleep();
        },5000);
    }
    else{
        clearTimeout(timer2);
    }
}

function locked(x) {
    x.style.scale = '0.7';
    x.style.backgroundColor = 'rgba(196, 196, 196, 0.75)';
    lock1.style.filter = 'brightness(0.25)';
    lock2.style.filter = 'brightness(0.25)';
    lock2.style.top = '13px';
    toolSection.style.width = "100%";
    toolSection.style.height = "100%";
    isLocked = true;
}

function unlocked(x){
    x.style.scale = '1';
    x.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    lock1.style.filter = 'brightness(0.94)';
    lock2.style.filter = 'brightness(0.94)';
    lock2.style.top = '9px';
    toolSection.style.width = "0%";
    toolSection.style.height = "0%";
    isLocked = false;
}


const lockWaker = document.getElementById('lockWake');
lockWaker.onclick = () => {lockWake();};

function lockSleep(){
    lockControl.style.scale = '0';
    lockWaker.style.display = 'block';
}

function lockWake(){
    lockWaker.style.display = 'none';
    if (isLockWorking == false){
        clearTimeout(timer2);
        timer2 = setTimeout(function(){
            lockSleep();
        },5000);
    }
    else{
        clearTimeout(timer2);
    }
    if (isLocked == false){
        lockControl.style.scale = '1';
    }
    else {
        lockControl.style.scale = '0.7';
    }
}

let timer3;
let showTouchStartTime;
let isHidden = false;
let isShowWorking = false;
let timer4;
const showControl = document.getElementById('showControl');
const showSplash1 = document.getElementById('showSplash');
const showSplash2= document.getElementById('showSplash2Mask2');
const show= document.getElementById('show');
if (isMobile()){
    showControl.ontouchstart = () => {showTouchStart(showControl)};
    showControl.ontouchmove = () => {showTouchMove(showControl)};
    showControl.ontouchend = () => {showTouchEnd(showControl)};
}
else{
    showControl.onmousedown = () => {showTouchStart(showControl)};
    showControl.onmousemove = () => {showTouchMove(showControl)};
    showControl.onmouseup = () => {showTouchEnd(showControl)};
}
showControl.oncontextmenu = () => {return false};
showSplash1.oncontextmenu = () => {return false};
showSplash2.oncontextmenu = () => {return false};

function showTouchStart(x){
    clearTimeout(timer3);
    if (isPageNumMenu == false){
        showTouchStartTime = Date.now();
        isShowWorking = true;
        timer3 = setTimeout(() => {
            if (isHidden == false){
                hideUI(x);
            }
            else{
                showUI(x);
            }
        }, 1000);
        if (isHidden == false){
            x.style.scale = '1.1';
        }
        else {
            x.style.scale = '0.6';
        }
    }
    else {
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
        showWake();
    }
}

function showTouchMove(x) {
    clearTimeout(timer3);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - showTouchStartTime;
    if (touchDuration < 1000){
        if (isHidden == false){
            x.style.scale = '1';
        }
        else {
            x.style.scale = '0.7';
        }
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
    }
    if (isShowWorking == false){
        clearTimeout(timer4);
        timer4 = setTimeout(function(){
            showSleep();
        },5000);
    }
    else{
        clearTimeout(timer4);
    }
    isShowWorking = false;
}

function showTouchEnd(x) {
    clearTimeout(timer3);
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - showTouchStartTime;
    isShowWorking = false;
    if (touchDuration < 1000){
        if (isHidden == false){
            x.style.scale = '1';
        }
        else {
            x.style.scale = '0.7';
        }
        x.classList.remove('shake');
        x.classList.add('shake');
        setTimeout(function(){x.classList.remove('shake');},500);
    }
    if (isShowWorking == false){
        clearTimeout(timer4);
        timer4 = setTimeout(function(){
            showSleep();
        },5000);
    }
    else{
        clearTimeout(timer4);
    }
}


function hideUI(x ,y) {
    x.style.scale = '0.7';
    x.style.backgroundColor = 'rgba(196, 196, 196, 0.75)';
    show.style.filter = 'brightness(0.25)';
    show.classList.remove('showShake');
    show.classList.add('showShake');
    showSplash1.style.filter = 'brightness(0.25)';
    showSplash1.classList.remove('showSplashIn');
    showSplash1.classList.add('showSplashIn');
    showSplash1.style.display = 'block';
    showSplash2.classList.remove('showSplashIn');
    showSplash2.classList.add('showSplashIn');
    showSplash2.style.display = 'block';
    scrollBarSection.style.transform = 'translateY(100px)';
    prePageBtn.style.transform = 'translateX(-150px)';
    nextPageBtn.style.transform = 'translateX(150px)';
    if (y == null){
        pageNumSection.style.transform = 'translateY(200px)';
    }
    setTimeout(function(){
        show.classList.remove('showShake');
        showSplash1.classList.remove('showSplashIn');
        showSplash2.classList.remove('showSplashIn');
    },1000);
    isHidden = true;
}

function showUI(x, y){
    x.style.scale = '1';
    x.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    show.style.filter = 'brightness(1)';
    show.classList.remove('showShake');
    show.classList.add('showShake');
    showSplash1.style.filter = 'brightness(1)';
    showSplash1.classList.remove('showSplashOut');
    showSplash1.classList.add('showSplashOut');
    showSplash2.classList.remove('showShplashOut');
    showSplash2.classList.add('showSplashOut');
    scrollBarSection.style.transform = 'translateY(0px)';
    prePageBtn.style.transform = 'translateX(0px)';
    nextPageBtn.style.transform = 'translateX(0px)';
    if (y == null){
        pageNumSection.style.transform = 'translateY(0px)';
    }
    setTimeout(function(){
        show.classList.remove('showShake');
        showSplash1.classList.remove('showSplashOut');
        showSplash1.style.display = 'none';
        showSplash2.classList.remove('showSplashOut');
        showSplash2.style.display = 'none';
    },1000);
    isHidden = false;
}


const showWaker = document.getElementById('showWake');
showWaker.onclick = () => {showWake();};

function showSleep(){
    showControl.style.scale = '0';
    showWaker.style.display = 'block';
}

function showWake(){
    showWaker.style.display = 'none';
    if (isShowWorking == false){
        clearTimeout(timer4);
        timer4 = setTimeout(function(){
            showSleep();
        },5000);
    }
    else{
        clearTimeout(timer4);
    }
    if (isHidden == false){
        showControl.style.scale = '1';
    }
    else {
        showControl.style.scale = '0.7';
    }
}


let timer5;
let pageNumTouchStartTime;
let isPageNumMenu = false;
let isPageNumTextarea = false;
const pageNumContainer = document.getElementById('pageNumContainer');
const pageNumMenuSection = document.getElementById('pageNumMenu');
const pageNumContent = document.getElementById('pageNumContent');
if (isMobile()){
    pageNumSection.ontouchstart = () => {pageNumTouchStart(pageNumSection)};
    pageNumSection.ontouchmove = () => {pageNumTouchMove(pageNumSection)};
    pageNumSection.ontouchend = () => {pageNumTouchEnd(pageNumSection)};
}
else{
    pageNumSection.onmousedown = () => {pageNumTouchStart(pageNumSection)};
    pageNumSection.onmousemove = () => {pageNumTouchMove(pageNumSection)};
    pageNumSection.onmouseup = () => {pageNumTouchEnd(pageNumSection)};
}
pageNumSection.oncontextmenu = () => {return false};
pageNumContainer.oncontextmenu = () => {return false};
pageNumObj.oncontextmenu = () => {return false};

function pageNumTouchStart(x){
    clearTimeout(timer5);
    if (isPageNumMenu == false && isPageNumTextarea == false){
        x.style.scale = '0.9';
        x.style.transition = 'all 0.3s cubic-bezier(.4,0,.2,1)';
        pageNumTouchStartTime = Date.now();
        timer5 = setTimeout(() => {
            locked(lockControl);
            lockWake();
            hideUI(showControl,x);
            showWake();
            
            x.style.scale = '1';
            pageNumMenu(x);
        }, 1000);
    }
    else{
        clearTimeout(timer5);
        return;
    }
}

function pageNumTouchMove(x) {
    if (isPageNumMenu == false){
        clearTimeout(timer5);
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - pageNumTouchStartTime;
        if (touchDuration < 1000){
            x.style.scale = '1';
            if (isPageNumTextarea == false){
                x.classList.remove('shake');
                x.classList.add('shake');
                setTimeout(function(){x.classList.remove('shake');},500);
            }
        }
        x.style.transition = 'all 1s cubic-bezier(.4,0,.2,1)';
    }
    else{
        clearTimeout(timer5);
        return;
    }
}

function pageNumTouchEnd(x) {
    if (isPageNumMenu == false){
        clearTimeout(timer5);
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - pageNumTouchStartTime;
        if (touchDuration < 1000){
            x.style.scale = '1';
            if (isPageNumTextarea == false){
                x.classList.remove('shake');
                x.classList.add('shake');
                setTimeout(function(){x.classList.remove('shake');},500);
            }
        }
        x.style.transition = 'all 1s cubic-bezier(.4,0,.2,1)';
    }
    else{
        clearTimeout(timer5);
        return;
    }
}




const pageNumTextarea = document.getElementById('pageNumTextarea');
pageNumTextarea.inputMode = "numeric";
pageNumContainer.addEventListener('click', () => {
    pageNumSection.classList.remove('shake');
    pageNumTextarea.style.display = 'block';
    let index = Math.round(page.scrollLeft*iframes.length/page.scrollWidth);
    index += 1;
    if(index < 10){
        index = "0"+index;
    }
    pageNumTextarea.value = index;
    if(isPageNumTextarea == false){
        openNumericKB();
    }
});

function openNumericKB(){
    isPageNumTextarea = true;
    scrollBarSection.style.transform = 'translateY(100px)';
    prePageBtn.style.transform = 'translateX(-150px)';
    nextPageBtn.style.transform = 'translateX(150px)';
    pageNumSection.style.transform = "translateY(-800px) scale(2)";
    const kbBG = document.createElement('div');
    kbBG.id = "keyboardBG1";
    toolSection.appendChild(kbBG);
    kbBG.style.width = window.innerWidth + "px";
    kbBG.style.top = window.innerHeight - 800 + "px";
    
    setTimeout(() => {
        kbBG.style.transform = "translateY(0px)";
        kbBG.style.scale = "1 1";
    }, 0);

    for(let i = 1; i <= 9; i++){
        const key = document.createElement("button");
        key.classList.add('keyboardKeys');
        key.id = `keyboardKey-${i}`;
        key.textContent = i;
        key.onclick = () => {
                keyboardKeysClick(key);
                keyClickItem(key);
        };
        kbBG.appendChild(key);
    }
    ["清除", "0", "確定"].forEach(k => {
        const key = document.createElement("button");
        key.classList.add('keyboardKeys');
        if(k == "清除"){
            key.id = "keyboardKey-clear";
            const icon = document.createElement('img');
            icon.src = "../data/icon/bright/delete.svg";
            icon.id = "keyboardKey-icon";
            key.appendChild(icon);
            key.onclick = () => {
                keyboardKeysClick(key);
                keyClickItem(key);
            };
        }
        else if(k == "0"){
            key.id = "keyboardKey-0";
            key.textContent = k;
            key.onclick = () => {
                keyClickItem(key);
                keyboardKeysClick(key);
            };
        }
        else{
            key.id = "keyboardKey-enter";
            const icon = document.createElement('img');
            icon.src = "../data/icon/bright/check.svg";
            icon.id = "keyboardKey-icon";
            key.appendChild(icon);
            key.onclick = () => {
                keyClickItem(key);
                closeNumericKB(kbBG);
            };
        }
        kbBG.appendChild(key);
    });
}

function keyClickItem(btn){
    const item = document.createElement('div');
    item.classList.add('keyboardKeysClick');
    btn.appendChild(item);
    item.style.opacity = 1;
    setTimeout(() => {
        item.style.transition = "all 1s cubic-bezier(.4,0,.2,1)";
        item.style.opacity = "0";
    }, 500);
    setTimeout(() => {
        item.remove();
    }, 1500);
}

function keyboardKeysClick(btn){
    const index = btn.id.split('-')[1];
    const textValue = pageNumTextarea.value;
    let newValue;
    if (index == "clear"){
        if(textValue != null){
            newValue = textValue.slice(0, -1);
        }
    }
    else{
        let tempValue = textValue + index;
        newValue = tempValue.slice(tempValue.length-2, tempValue.length);
    }
    pageNumTextarea.value = newValue.trim();
}

function closeNumericKB(kbBG){
    isPageNumTextarea = false;
    kbBG.style.transform = "translateY(800px)";
    kbBG.style.scale = "1 3";
    scrollBarSection.style.transform = 'translateY(0px)';
    prePageBtn.style.transform = 'translateX(0px)';
    nextPageBtn.style.transform = 'translateX(0px)';
    setTimeout(() => {
        kbBG.remove();
    }, 1000);
    pageNumSection.style.transform = "translateY(0px)";
    pageNumSection.style.scale = "1";
    pageNumTextarea.style.display = 'none';
    let index = parseInt(pageNumTextarea.value);
    if(index > iframes.length){
        pageNumObj.classList.add('shake');
        setTimeout(function(){pageNumObj.classList.remove('shake');},500);
        return;
    }
    goToPage(index-1);
}

const pageNumContainer2 = document.getElementById('container');

function defaultPageNum() {
    pageNumObj.textContent = "";
    pageNumObj2.textContent = "";
    let pageNumbers2 = ["##"];
    let pageNumbers = Array.from({ length: iframes.length }, (_, i) =>
        `${i + 1 < 10 ? '0' : ''}${i + 1}`
    );
    pageNumbers2 = pageNumbers2.concat(pageNumbers);
    pageNumbers2 = pageNumbers2.concat(pageNumbers2);
    pageNumObj.textContent = pageNumbers.join('　');
    pageNumObj2.textContent = pageNumbers2.join('　');
    pageNumObj2.style.width = ((iframes.length +1)*67.5)*2 +"px";
    pageNumContainer2.scrollLeft = 0.5*pageNumContainer2.scrollWidth - (4/((iframes.length+1)*2))*pageNumContainer2.scrollWidth + 15;
}

let isScrolling = false;
let isSettingScroll = false; // 新增一個 flag 來避免無限迴圈觸發 scroll 事件

pageNumContainer2.addEventListener('scroll', () => {

    const scrollLeft = pageNumContainer2.scrollLeft;
    const scrollWidth = pageNumContainer2.scrollWidth;
    const itemWidth = scrollWidth / ((iframes.length + 1) * 2);
    let currentPageNumber = scrollLeft / itemWidth;

    if (scrollLeft <= itemWidth) {
        isSettingScroll = true; // 設定 flag
        pageNumContainer2.scrollTo({
            left: scrollWidth / 2 + itemWidth + 15,
            behavior: 'instant' // 瞬間跳轉
        });
        isSettingScroll = false; // 重置 flag
    } else if (scrollLeft >= scrollWidth - 10 * itemWidth + 28) {
        isSettingScroll = true; // 設定 flag
        pageNumContainer2.scrollTo({
            left: scrollWidth / 2 - 10 * itemWidth + 15,
            behavior: 'instant' // 瞬間跳轉
        });
        isSettingScroll = false; // 重置 flag
    }
    pageEdit.scrollLeft = (currentPageNumber+4)*(pageEdit.scrollWidth/((iframes.length + 1) * 2));
});

pageNumContainer2.addEventListener('scrollend', () => {
    if (isSettingScroll) return;
    isScrolling = false;
    if(isSettingScroll == false){

        const scrollLeft = pageNumContainer2.scrollLeft;
        const scrollWidth = pageNumContainer2.scrollWidth;
        const itemWidth = scrollWidth / ((iframes.length + 1) * 2);
    
        let currentPageNumber = Math.round(scrollLeft / itemWidth);
        let targetScrollLeft = currentPageNumber * itemWidth + currentPageNumber / 2;
        pageNumContainer2.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }
});

const selectorTextarea = document.getElementById('selectorTextarea');

pageNumObj2.addEventListener('click',() => {
    const scrollLeft = pageNumContainer2.scrollLeft;
    const scrollWidth = pageNumContainer2.scrollWidth;
    const itemWidth = scrollWidth / ((iframes.length + 1) * 2);
    let currentPageNumber = Math.round(scrollLeft / itemWidth);
    let index = (currentPageNumber+4)%(iframes.length+1);
    selectorTextarea.style.display = 'block';
    if(index == 0){
        selectorTextarea.value = '##';
    }
    else if(index < 10){
        selectorTextarea.value = "0"+index;
    }
    else{
        selectorTextarea.value = index;
    }
    openNumericKB2();
    const selectorBtns = document.getElementsByClassName('selectorBtns');
    for(let i = 0; i < selectorBtns.length; i++){
        selectorBtns[i].disabled = true;
    }
});

function openNumericKB2(){
    pageNumSection.style.transform = "translateY(-600px) scale(1.5)";
    const kbBG = document.createElement('div');
    kbBG.id = "keyboardBG1";
    toolSection.appendChild(kbBG);
    kbBG.style.width = window.innerWidth + "px";
    kbBG.style.top = window.innerHeight - 800 + "px";
    
    setTimeout(() => {
        kbBG.style.transform = "translateY(0px)";
        kbBG.style.scale = "1 1";
    }, 0);

    for(let i = 1; i <= 9; i++){
        const key = document.createElement("button");
        key.classList.add('keyboardKeys');
        key.id = `keyboardKey-${i}`;
        key.textContent = i;
        key.onclick = () => {
                keyboardKeysClick2(key);
                keyClickItem(key);
        };
        kbBG.appendChild(key);
    }
    ["清除", "0", "確定"].forEach(k => {
        const key = document.createElement("button");
        key.classList.add('keyboardKeys');
        if(k == "清除"){
            key.id = "keyboardKey-clear";
            const icon = document.createElement('img');
            icon.src = "../data/icon/bright/delete.svg";
            icon.id = "keyboardKey-icon";
            key.appendChild(icon);
            key.onclick = () => {
                keyboardKeysClick2(key);
                keyClickItem(key);
            };
        }
        else if(k == "0"){
            key.id = "keyboardKey-0";
            key.textContent = k;
            key.onclick = () => {
                keyClickItem(key);
                keyboardKeysClick2(key);
            };
        }
        else{
            key.id = "keyboardKey-enter";
            const icon = document.createElement('img');
            icon.src = "../data/icon/bright/check.svg";
            icon.id = "keyboardKey-icon";
            key.appendChild(icon);
            key.onclick = () => {
                keyClickItem(key);
                closeNumericKB2(kbBG);
            };
        }
        kbBG.appendChild(key);
    });
}

function keyboardKeysClick2(btn){
    const index = btn.id.split('-')[1];
    const textValue = selectorTextarea.value;
    let newValue;
    if (index == "clear"){
        if(textValue != null){
            newValue = textValue.slice(0, -1);
        }
    }
    else{
        let tempValue = textValue + index;
        newValue = tempValue.slice(tempValue.length-2, tempValue.length);
    }
    selectorTextarea.value = newValue.trim();
}

function closeNumericKB2(kbBG){
    kbBG.style.transform = "translateY(800px)";
    kbBG.style.scale = "1 3";
    setTimeout(() => {
        kbBG.remove();
    }, 1000);
    pageNumSection.style.transform = "translateY(0px)";
    let index = selectorTextarea.value;
    if(parseInt(index)>iframes.length){
        pageNumObj2.classList.add('shake');
        setTimeout(function(){pageNumObj2.classList.remove('shake');},500);
        return;
    }
    let newTableNumber = 0;
    if(index == "##"){
        newTableNumber = 0;
    }
    else{
        newTableNumber = parseInt(index);
    }
    const scrollLeft = pageNumContainer2.scrollLeft;
    const scrollWidth = pageNumContainer2.scrollWidth;
    const itemWidth = scrollWidth / ((iframes.length + 1) * 2);
    
    let currentPageNumber = Math.round(scrollLeft / itemWidth);
    let index2 = ((currentPageNumber + 4)%(iframes.length+1)) - newTableNumber;
    if (index2 <= -25){
        index2 += (iframes.length+1);
    }
    selectorBtn(-(index2));
    selectorTextarea.style.display = 'none';
    const selectorBtns = document.getElementsByClassName('selectorBtns');
    for(let i = 0; i < selectorBtns.length; i++){
        selectorBtns[i].disabled = false;
    }
}

function selectorBtn(x){
    const scrollLeft = pageNumContainer2.scrollLeft;
    const scrollWidth = pageNumContainer2.scrollWidth;
    const itemWidth = scrollWidth / ((iframes.length + 1) * 2);

    let currentPageNumber = Math.round(scrollLeft / itemWidth);
    if(currentPageNumber >= (iframes.length)*2-4-8){
        currentPageNumber = (currentPageNumber-(iframes.length+1));
        let targetScrollLeft2 = currentPageNumber * itemWidth + currentPageNumber / 2;
        pageNumContainer2.scrollTo({
            left: targetScrollLeft2,
            behavior: 'instant'
        });
    }
    if(currentPageNumber+x >= (iframes.length)*2-4-8){
        currentPageNumber = (currentPageNumber-(iframes.length+1));
        let targetScrollLeft2 = currentPageNumber * itemWidth + currentPageNumber / 2;
        pageNumContainer2.scrollTo({
            left: targetScrollLeft2,
            behavior: 'instant'
        });
    }
    if(currentPageNumber <= 0){
        currentPageNumber = (currentPageNumber+(iframes.length+1));
        let targetScrollLeft2 = currentPageNumber * itemWidth + currentPageNumber / 2;
        pageNumContainer2.scrollTo({
            left: targetScrollLeft2,
            behavior: 'instant'
        });
    }
    if(currentPageNumber+x <=0){
        currentPageNumber = (currentPageNumber+(iframes.length+1));
        let targetScrollLeft2 = currentPageNumber * itemWidth + currentPageNumber / 2;
        pageNumContainer2.scrollTo({
            left: targetScrollLeft2,
            behavior: 'instant'
        });
    }
    let targetScrollLeft = (currentPageNumber + x) * itemWidth + currentPageNumber / 2;
    setTimeout(() => {pageNumContainer2.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    },100);
}

const pageEdit = document.getElementById('pageEdit');

function setDefaultPageEditor(newMessages) {
    let newArray = [];
    newArray = newArray.concat(newMessages);
    newArray = newArray.concat(newArray);
    for(let i = 0; i < newArray.length; i++){
        const item = document.createElement('div');
        item.classList.add('pageEditContent');
        item.id = `pageEditorContent${i}`;
        pageEdit.appendChild(item);
        const text = document.createElement('textarea');
        if(i % newMessages.length == 0){
            text.textContent = newArray[i].substring(0,4)+"\n"+newArray[i].substring(5,newArray.length);
        }
        else{
            text.textContent = newArray[i].substring(0,newArray[i].search("桌")+1)+"\n"+newArray[i].substring(newArray[i].search("桌")+2,newArray[i].length);
        }
        text.classList.add('pageEditText');
        text.id = `pageEditText-${i}`;
        item.appendChild(text);
        text.onblur = () => {SavePageEditText(text);};
    }
}

async function SavePageEditText(x) {
    if (!x || !x.id) {
        console.error("Invalid element:", x);
        return;
    }

    const idParts = x.id.split('-');
    if (idParts.length !== 2) {
        console.error("Invalid id format:", x.id);
        return;
    }

    const index = parseInt(idParts[1]%(iframes.length+1));
    const newValue = replaceNewlinesWithSpaces(x.value);

    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        // 2. 修改指定行
        if (index >= 0 && index < lines.length) {
            lines[index] = newValue;
            if(parseInt(idParts[1])<(iframes.length)){
                document.getElementById(`pageEditText-${index+31}`).value = x.value;
            }
            else{
                document.getElementById(`pageEditText-${index}`).value = x.value;
            }
        } else {
            console.error("Invalid index:", index);
            return;
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
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

        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
        ws.send(updatedText);
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

function replaceNewlinesWithSpaces(text) {
    return text.replace(/\r\n|\r|\n/g, ' ');
}


function pageNumMenu(x) {
    isPageNumMenu = true;
    x.style.transition = 'all 0.5s cubic-bezier(.33,1.53,.69,.99)';
    x.style.width = '820px';
    x.style.height = '620px';
    x.style.top = (globalHeight - 930)/2 + "px";
    pageNumContent.style.height = '620px';
    pageNumContainer.style.top = '595x';
    pageNumContainer.style.height = '0px';
    scrollBarSection.style.transform = 'translateY(100px)';
    prePageBtn.style.transform = 'translateX(-150px)';
    nextPageBtn.style.transform = 'translateX(150px)';
    const BG = document.createElement('div');
    BG.classList.add('pageNumMenuBG');
    page.appendChild(BG);
    page.scrollTo({left: 0,behavior: 'instant'});
    BG.oncontextmenu = () => {return false};
    pageNumMenuSection.style.top = (globalHeight - 930)/2 + "px";
    const btn1 = document.getElementById('btn1');
    btn1.oncontextmenu = () => {return false};
    btn1.onclick =() => {setMaxTableNumber();};
    const btn2 = document.getElementById('btn2');
    btn2.oncontextmenu = () => {return false};
    btn2.onclick = () => {editTextDoc();};
    const btn3 = document.getElementById('btn3');
    btn3.oncontextmenu = () => {return false};
    btn3.onclick = () => {uploadEditText(btn3)};
    const btn4 = document.getElementById('btn4');
    btn4.oncontextmenu = () => {return false};
    btn4.onclick = () => {closePageNumMenu(x, BG)};
    setTimeout(() => {
        isLooking = false;
        iframes[0].contentWindow.postMessage({ isLooking }, '*');
    }, 500);
}

let MaxTableNumber = 0;
function setMaxTableNumber(){
    MaxTableNumber = iframes.length;
    const BG = document.createElement('div');
    BG.classList.add('pageNumMenuBG');
    toolSection.appendChild(BG);
    BG.oncontextmenu = () => {return false};
    const g = document.createElement('div');
    g.classList.add('g');
    BG.appendChild(g);
    const section1 = document.createElement('section');
    section1.classList.add('section1');
    g.appendChild(section1);
    section1.oncontextmenu = () => {return false};
    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = '設定最大桌數';
    section1.appendChild(title);
    title.oncontextmenu = () => {return false};
    const content = document.createElement('div');
    content.classList.add('content');
    section1.appendChild(content);
    content.oncontextmenu = () => {return false};
    const subBtn = document.createElement('button');
    subBtn.classList.add('sub');
    subBtn.textContent = "-";
    content.appendChild(subBtn);
    subBtn.oncontextmenu = () => {return false};
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea');
    textarea.value = iframes.length;
    content.appendChild(textarea);
    textarea.oncontextmenu = () => {return false};
    textarea.onblur = () => {MaxTableNumber = textarea.value};
    subBtn.onclick = () => {subMaxTableNumber(textarea)};
    const addBtn = document.createElement('button');
    addBtn.classList.add('add');
    addBtn.textContent = "+";
    content.appendChild(addBtn);
    addBtn.oncontextmenu = () => {return false};
    addBtn.onclick = () => {addMaxTableNumber(textarea)};
    const subtitle = document.createElement('div');
    subtitle.classList.add('subtitle');
    subtitle.textContent = "此功能將會影響跑馬燈的最大桌數，按下「確定」按鈕後，\n在你重新刷新瀏覽器時，最大桌數也會隨之改變，\n若有桌數新增，則系統會自動設定為「未訂席」";
    section1.appendChild(subtitle);
    subtitle.oncontextmenu = () => {return false};
    const btn1 = document.createElement('button');
    btn1.classList.add('btnn1');
    btn1.textContent = "確定";
    g.appendChild(btn1);
    btn1.oncontextmenu = () => {return false};
    btn1.onclick = () => {setMaxTableNumberBtn(textarea);setMaxTableNumberImg(textarea); setMaxTableNumberClose(BG, g)};
}



function addMaxTableNumber(textarea){
    textarea.classList.remove('shake');
    if(MaxTableNumber < 99){
        MaxTableNumber++;
        textarea.value = MaxTableNumber;
        textarea.classList.add('textareaChange');
        setTimeout(() => {
            textarea.classList.remove('textareaChange');
        }, 300);
    }
    else{
        textarea.classList.add('shake');
        setTimeout(() => {
            textarea.classList.remove('shake');
        }, 300);
    }
}

function subMaxTableNumber(textarea){
    textarea.classList.remove('shake');
    if(MaxTableNumber > 1){
        MaxTableNumber--;
        textarea.value = MaxTableNumber;
        textarea.classList.add('textareaChange');
        setTimeout(() => {
            textarea.classList.remove('textareaChange');
        }, 300);
    }
    else{
        textarea.classList.add('shake');
        setTimeout(() => {
            textarea.classList.remove('shake');
        }, 300);
    }
}

async function setMaxTableNumberBtn(textarea){
    MaxTableNumber = parseInt(textarea.value);
    let newTableNumber = MaxTableNumber - iframes.length;
    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        // 2. 修改指定行
        if (newTableNumber > 0){
            for (let i = 1; i <= newTableNumber; i++){
                let c = iframes.length + i;
                let newString = ""
                if (c < 10) {
                    newString = `第${changToCH(c)}桌 未訂席`;
                }
                else if (c == 0 ) {
                    newString = `第十桌 未訂席`;
                }
                else if(c > 10  && c < 20){
                    newString = `第十${changToCH(c%10)}桌 未訂席`;
                }
                else if (c > 10 && c % 10 == 0 && c < 100){
                    newString = `第${changToCH(Math.floor(c/10))}十桌 未訂席`;
                }
                else if (c > 10 && c % 10 != 0 && c < 100) {
                    newString = `第${changToCH(Math.floor(c/10))}十${changToCH(c%10)}桌 未訂席`;
                }
                lines.push(newString);
            }
            alert('已更改最大桌數，請重新刷新瀏覽器！');
        }
        else if (newTableNumber == 0) {
            return;
        }
        else {
            for(let i = MaxTableNumber; i < iframes.length; i++){
                lines.pop();
            }
            alert('已更改最大桌數，請重新刷新瀏覽器！');
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
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

        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

async function setMaxTableNumberImg(textarea) {
    MaxTableNumber = parseInt(textarea.value);
    let newTableNumber = MaxTableNumber - iframes.length;
    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-image-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');

        // 2. 修改指定行
        if (newTableNumber > 0){
            for (let i = 1; i <= newTableNumber; i++){
                for (let j = 0; j < 6; j++){
                    let c = iframes.length + i;
                    let newString = c+"/Default";
                    lines.push(newString);
                }
            }
        }
        else if (newTableNumber == 0) {
            return;
        }
        else {
            for(let i = MaxTableNumber; i < iframes.length; i++){
                for (let j = 0; j < 6; j++){
                    lines.pop();
                }
            }
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
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

        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
    } catch (error) {
        console.error("Error updating file:", error);
    }
}

function changToCH(Number){
    switch (Number){
        case 1: return "一"
        case 2: return "二"
        case 3: return "三"
        case 4: return "四"
        case 5: return "五"
        case 6: return "六"
        case 7: return "七"
        case 8: return "八"
        case 9: return "九"
    }
}

function setMaxTableNumberClose(BG, section1){
    BG.style.animation = 'opticityOut 0.3s cubic-bezier(.4,0,.2,1)';
    section1.style.animation = 'scaleOut 0.3s cubic-bezier(.4,0,.2,1)';
    setTimeout(function(){BG.remove();},300);
}

function editTextDoc(){
    const BG = document.createElement('div');
    BG.classList.add('pageNumMenuBG');
    toolSection.appendChild(BG);
    BG.oncontextmenu = () => {return false};
    const g = document.createElement('div');
    g.classList.add('g');
    BG.appendChild(g);
    const section2 = document.createElement('section');
    section2.classList.add('section2');
    g.appendChild(section2);
    section2.oncontextmenu = () => {return false};
    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = '一鍵編輯訂位資訊';
    section2.appendChild(title);
    title.oncontextmenu = () => {return false};
    const content = document.createElement('div');
    content.classList.add('content');
    section2.appendChild(content);
    content.oncontextmenu = () => {return false};
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea');
    content.appendChild(textarea);
    setDefaultEditTextarea(textarea);
    const btns = document.createElement('div');
    btns.classList.add('btns');
    g.appendChild(btns);
    btns.oncontextmenu = () => {return false};
    const btn1 = document.createElement('button');
    btn1.classList.add('btn');
    btn1.classList.add('btn1');
    btn1.textContent = "取消";
    btns.appendChild(btn1);
    btn1.oncontextmenu = () => {return false};
    btn1.onclick = () => {setMaxTableNumberClose(BG, g)};
    const btn2 = document.createElement('button');
    btn2.classList.add('btn');
    btn2.classList.add('btn2');
    btn2.textContent = "儲存";
    btns.appendChild(btn2);
    btn2.oncontextmenu = () => {return false};
    btn2.onclick = () => {saveEditTextarea(textarea);setMaxTableNumberClose(BG, g);}
}

async function setDefaultEditTextarea(textarea){
    const response = await fetch('/data/marquee_table_number.txt');
    const text = await response.text();
    const newMessages = text.split('\n').filter(line => line.trim() !== '');
    textarea.value = newMessages.join('\n');
}

async function saveEditTextarea(textarea) {
    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');
        const newLines = textarea.value.split('\n');

        // 2. 修改指定行
        if (lines.length > newLines.length){
            let c = lines.length - newLines.length;
            for(let i = 0; i < c; i ++){
                lines.pop();
            }
        }
        else if (lines.length < newLines.length){
            for(let i = lines.length; i < newLines.length; i++){
                for (let i = 1; i <= newTableNumber; i++){
                    let c = lines.length + i;
                    let newString = ""
                    if (c < 10) {
                        newString = `第${changToCH(c)}桌 未訂席`;
                    }
                    else if (c == 0 ) {
                        newString = `第十桌 未訂席`;
                    }
                    else if(c > 10  && c < 20){
                        newString = `第十${changToCH(c%10)}桌 未訂席`;
                    }
                    else if (c > 10 && c % 10 == 0 && c < 100){
                        newString = `第${changToCH(Math.floor(c/10))}十桌 未訂席`;
                    }
                    else if (c > 10 && c % 10 != 0 && c < 100) {
                        newString = `第${changToCH(Math.floor(c/10))}十${changToCH(c%10)}桌 未訂席`;
                    }
                    lines.push(newString);
                }
            }
        }
        for(let i = 0; i < lines.length; i++){
            lines[i] = newLines[i];
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
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
        else{
            alert("儲存成功！請重新刷新瀏覽器！");
        }
        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
        
        ws.send(updatedText);
    } catch (error) {
        console.error("Error updating file:", error);
    }
  
}
let url = window.location.href;


var ws = new WebSocket(url);

ws.onopen = () => {
  console.log('open connection');
};

ws.onclose = () => {
  console.log('Connection closed. Reconnecting...');

  // 重新建立 WebSocket 連線，使用原來的 ws 變數
  ws = new WebSocket(url);

  // 重新設定所有事件處理函式
  ws.onopen = () => {
    console.log('Reconnected!');
  };

  ws.onclose = () => {
    console.log('Connection closed. Reconnecting...');
  };

  ws.onmessage = event => {
    const pageEditText = document.getElementsByClassName('pageEditText');
    for (let i = 0; i < 31; i++) {
      pageEditText[i].value = i == 0 ? event.data.split('\n')[i].substring(0, 4) + "\n" + event.data.split('\n')[i].substring(5, event.data.split('\n')[i].length) : event.data.split('\n')[i].substring(0, event.data.split('\n')[i].search("桌") + 1) + "\n" + event.data.split('\n')[i].substring(event.data.split('\n')[i].search("桌") + 2, event.data.split('\n')[i].length);
      pageEditText[i + 31].value = i == 0 ? event.data.split('\n')[i].substring(0, 4) + "\n" + event.data.split('\n')[i].substring(5, event.data.split('\n')[i].length) : event.data.split('\n')[i].substring(0, event.data.split('\n')[i].search("桌") + 1) + "\n" + event.data.split('\n')[i].substring(event.data.split('\n')[i].search("桌") + 2, event.data.split('\n')[i].length);
    }
  };
};

ws.onerror = error => {
  console.error('WebSocket error:', error);
};

ws.onmessage = event => {
    const pageEditText = document.getElementsByClassName('pageEditText');
    for(let i = 0; i < 31; i++){
        pageEditText[i].value = i == 0 ? event.data.split('\n')[i].substring(0,4)+"\n"+event.data.split('\n')[i].substring(5,event.data.split('\n')[i].length) : event.data.split('\n')[i].substring(0,event.data.split('\n')[i].search("桌")+1)+"\n"+event.data.split('\n')[i].substring(event.data.split('\n')[i].search("桌")+2,event.data.split('\n')[i].length);
        pageEditText[i + 31].value = i == 0 ? event.data.split('\n')[i].substring(0,4)+"\n"+event.data.split('\n')[i].substring(5,event.data.split('\n')[i].length) : event.data.split('\n')[i].substring(0,event.data.split('\n')[i].search("桌")+1)+"\n"+event.data.split('\n')[i].substring(event.data.split('\n')[i].search("桌")+2,event.data.split('\n')[i].length);
    }
}

function uploadEditText(btn){
    const textInput = document.createElement('input');
    textInput.type = "file";
    textInput.accept = "text/*";
    textInput.id = "textInput";
    textInput.style.display = 'none';
    btn.appendChild(textInput);
    textInput.onchange = () => {uploadTextFileFromDevice(textInput);};
    
}

async function uploadTextFileFromDevice (textInput) {
    const file = textInput.files[0];
    if(!file){
        alert('請選擇檔案');
        return;
    }
    const formData = new FormData();
    formData.append('text', file);
    fetch('/uploadFromDeviceText', { // 後端上傳路徑
            method: 'POST',
            body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('檔案上傳成功');
            const textName = data.filename;
            preViewText(textName);

        } else {
            alert('檔案上傳失敗：' + data.message);
        }
        })
    .catch(error => {
        console.error('上傳錯誤:', error);
        alert('上傳過程中發生錯誤');
    });
}

async function preViewText(textName){
    const response = await fetch('../data/marquee_img_input/'+textName);
    const text = await response.text();
    const newMessages = text.split('\n').filter(line => line.trim() !== '');
    const BG = document.createElement('div');
    BG.classList.add('pageNumMenuBG');
    toolSection.appendChild(BG);
    BG.oncontextmenu = () => {return false};
    const g = document.createElement('div');
    g.classList.add('g');
    BG.appendChild(g);
    const section2 = document.createElement('section');
    section2.classList.add('section2');
    g.appendChild(section2);
    section2.oncontextmenu = () => {return false};
    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = '文件預覽';
    section2.appendChild(title);
    title.oncontextmenu = () => {return false};
    const preViewContent = document.createElement('div');
    preViewContent.classList.add('preViewContent');
    section2.appendChild(preViewContent);
    preViewContent.oncontextmenu = () => {return false};
    const preViewText = document.createElement('div');
    preViewText.classList.add('preViewText');
    preViewContent.appendChild(preViewText);
    preViewText.textContent = newMessages.join('\n');
    const subtitle1 = document.createElement('div');
    subtitle1.classList.add('subtitle');
    subtitle1.textContent = "是否更換為當前文字檔？一旦更換完畢，\n在你刷新瀏覽器時，跑馬燈中的文字也會隨之更換喔！"
    section2.appendChild(subtitle1);
    const btns = document.createElement('div');
    btns.classList.add('preViewBtns');
    g.appendChild(btns);
    btns.oncontextmenu = () => {return false};
    const btn1 = document.createElement('button');
    btn1.classList.add('btn');
    btn1.classList.add('btn1');
    btn1.textContent = "取消";
    btns.appendChild(btn1);
    btn1.oncontextmenu = () => {return false};
    btn1.onclick = () => {deleteUploadedText(textName);setMaxTableNumberClose(BG, g)};
    const btn2 = document.createElement('button');
    btn2.classList.add('btn');
    btn2.classList.add('btn2');
    btn2.textContent = "更換";
    btns.appendChild(btn2);
    btn2.oncontextmenu = () => {return false};
    btn2.onclick = () => {saveTextFromUpload(textName);setMaxTableNumberClose(BG, g);}
}

async function saveTextFromUpload(textName) {
    try {
        // 1. 取得現有資料
        const responseGet = await fetch('/get-marquee-data');
        if (!responseGet.ok) {
            throw new Error(`HTTP error! status: ${responseGet.status}`);
        }
        const text = await responseGet.text();
        const lines = text.split('\n');
        const response = await fetch('../data/marquee_img_input/'+textName);
        const text2 = await response.text();
        const newLines = text2.split('\n').filter(line => line.trim() !== '');

        // 2. 修改指定行
        if (lines.length > newLines.length){
            let c = lines.length - newLines.length;
            for(let i = 0; i < c; i ++){
                lines.pop();
            }
        }
        else if (lines.length < newLines.length){
            for(let i = lines.length; i < newLines.length; i++){
                for (let i = 1; i <= newTableNumber; i++){
                    let c = lines.length + i;
                    let newString = ""
                    if (c < 10) {
                        newString = `第${changToCH(c)}桌 未訂席`;
                    }
                    else if (c == 0 ) {
                        newString = `第十桌 未訂席`;
                    }
                    else if(c > 10  && c < 20){
                        newString = `第十${changToCH(c%10)}桌 未訂席`;
                    }
                    else if (c > 10 && c % 10 == 0 && c < 100){
                        newString = `第${changToCH(Math.floor(c/10))}十桌 未訂席`;
                    }
                    else if (c > 10 && c % 10 != 0 && c < 100) {
                        newString = `第${changToCH(Math.floor(c/10))}十${changToCH(c%10)}桌 未訂席`;
                    }
                    lines.push(newString);
                }
            }
        }
        for(let i = 0; i < lines.length; i++){
            lines[i] = newLines[i];
        }
        const updatedText = lines.join('\n');

        // 3. 將修改後的資料傳送到伺服器
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
        else{
            alert("儲存成功！請重新刷新瀏覽器！");
        }
        const result = await responsePost.text();
        console.log(result); // 顯示伺服器回覆
        deleteUploadedText(textName);
    } catch (error) {
        console.error("Error updating file:", error);
    }
}


async function deleteUploadedText(textName) {
    try {
        const encodedFilename = encodeURIComponent(textName); // URL 編碼
        const response = await fetch(`/deleteImage/${encodedFilename}`, {
            method: 'DELETE',
        });
      if (!response.ok) {
        throw new Error('刪除檔案失敗');
      }
  
      // 檢查伺服器端回傳的資訊 (例如 response.json())
      const data = await response.json();
      if (data.success) {
        console.log('檔案已成功刪除');
      } else {
        console.error('上傳失敗，無法刪除檔案:', data.message);
      }
    } catch (error) {
      console.error('刪除圖片失敗:', error);
    }
}

function closePageNumMenu(x, BG){
    pageNumMenuSection.style.top = globalHeight + 120 + "px";
    x.style.transition = 'all 0.5s cubic-bezier(.31, .01, .66, -.59)';
    x.style.width = '100px';
    x.style.height = '60px';
    x.style.top = globalHeight - 60 - 60 + "px";
    pageNumContent.style.height = '0px';
    pageNumContainer.style.top = '0px';
    pageNumContainer.style.height = '60px';
    BG.style.animation = 'opticityOut 0.5s cubic-bezier(.4,0,.2,1)';
    scrollBarSection.style.transform = 'translateY(0px)';
    prePageBtn.style.transform = 'translateX(-0px)';
    nextPageBtn.style.transform = 'translateX(0px)';
    setTimeout(function(){
        BG.remove();
        unlocked(lockControl);
        lockWake();
        showUI(showControl,x);
        showWake();
        isPageNumMenu = false;
        isLooking = true;
        iframes[0].contentWindow.postMessage({ isLooking }, '*');
        x.style.transition = 'all 1s cubic-bezier(.4,0,.2,1)';
    },500);
}

function adjustScale(iframe){
    const deviceWidth = window.innerWidth;
    const deviceHeight = window.innerHeight;
    const scrollBarGroup = document.getElementsByClassName("scrollBarGroup");
    globalWidth = 2000;
    globalHeight = 1200;
    if (deviceWidth/deviceHeight == 5/3) {
        globalWidth = 2000;
        globalHeight = 1200;
    }
    if (deviceWidth/deviceHeight == 22/14){
        globalWidth = 1980;
        globalHeight = 1260;
    }
    if (deviceWidth/deviceHeight == 40/25){
        globalWidth = 2000;
        globalHeight = 1250;
    }
    page.style.width = globalWidth + "px";
    page.style.height = globalHeight + "px";
    iframe.style.width = globalWidth + "px";
    iframe.style.height = globalHeight + "px";
    lockControl.style.left = globalWidth - 100 + "px";
    scrollBarSection.style.width = globalWidth + "px";
    scrollBarSection.style.top = globalHeight - 36 + "px";
    pageNumSection.style.top = globalHeight - 60 - 60 + "px";
    pageNumMenuSection.style.top = globalHeight + 120 + "px";
    prePageBtn.style.height = globalHeight - 36 + "px";
    nextPageBtn.style.height = globalHeight - 36 + "px";
    nextPageBtn.style.left = globalWidth - 100 + "px";
    for(let i = 0; i < scrollBarGroup.length; i++){
        scrollBarGroup[i].style.width = globalWidth + "px";
    }
}

window.addEventListener('message', (event) => {
    const message = event.data;
    if(message.type == "data"){
        if(message.content == "hide") hideUI(showControl);
        else showUI(showControl);
    }
});