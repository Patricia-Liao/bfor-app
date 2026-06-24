 
 //NAVIGATION//
 function openMenu() {
  if (window.innerWidth <= 800) {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
  }
}

function closeMenu() {
  if (window.innerWidth <= 800) {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
  }
}
//NAVIGATION//

