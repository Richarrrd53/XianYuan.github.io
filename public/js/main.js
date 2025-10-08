const deviceWidth = window.innerWidth;
const deviceHeight = window.innerHeight;
let globalWidth;
let globalHeight;
let count = 0;

document.addEventListener('DOMContentLoaded', () => {
  const welcomeSection = document.getElementById("welcome");
  welcomeSection.style.height = deviceHeight + 'px';
  welcome();
});

function welcome() {
  const ifm = document.createElement('iframe');
  ifm.src = '../html/home.html';
  ifm.id = "iframepage";
  ifm.frameborder = 0;
  adjustScale(ifm);
  if (globalHeight*(deviceWidth/globalWidth) > window.innerHeight){
    ifm.style.scale = deviceHeight/globalHeight;
    ifm.style.left = (deviceWidth-globalWidth*(deviceHeight/globalHeight))/2 + "px";
  }
  else{
    ifm.style.scale = deviceWidth/globalWidth;
    ifm.style.left = 0;
  }
  document.body.appendChild(ifm);
  ifm.allowfullscreen = true;
  const fullScreenBtn = document.createElement('button');
  fullScreenBtn.id = "fullScreenBtn";
  fullScreenBtn.onclick = () => {fullScreenBtnClick(fullScreenBtn)};
  document.body.appendChild(fullScreenBtn);
}

document.addEventListener('fullscreenchange', () => {
  const deviceWidth = window.innerWidth;
  const deviceHeight = window.innerHeight;
  const ifm = document.getElementById("iframepage");
  adjustScale(ifm);
  if (globalHeight*(deviceWidth/globalWidth) > window.innerHeight){
    ifm.style.scale = deviceHeight/globalHeight;
    ifm.style.left = (deviceWidth-globalWidth*(deviceHeight/globalHeight))/2 + "px";
  }
  else{
    ifm.style.scale = deviceWidth/globalWidth;
    ifm.style.left = 0;
  }
  handleFullscreenChange();
});

function fullScreenBtnClick(x){
  fullscreen();
  x.style.display = 'none';
}


function fullscreen() {
    // check if fullscreen mode is available
    if (document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled) {
      // Do fullscreen
      if (document.body.requestFullscreen) {
        document.body.requestFullscreen();
      } else if (document.body.webkitRequestFullscreen) {
        document.body.webkitRequestFullscreen();
      } else if (document.body.mozRequestFullScreen) {
        document.body.mozRequestFullScreen();
      } else if (document.body.msRequestFullscreen) {
        document.body.msRequestFullscreen();
      }
    }
    else {
      document.querySelector('.error').innerHTML = 'Your browser is not supported';
    }
}

function handleFullscreenChange() {
  const ifm = document.getElementById("iframepage");
  const fullScreenBtn = document.getElementById('fullScreenBtn');
  count = (count + 1) % 2;
  if (count % 2 == 0) {
    document.exitFullscreen();
    fullScreenBtn.style.display = 'block'; // Show button when exiting fullscreen
  }
}

function adjustScale(ifm){
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
  ifm.style.width = globalWidth + "px";
  ifm.style.height = globalHeight + "px";
}

