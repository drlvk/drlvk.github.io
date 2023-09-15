window.onload = displayClock();
function displayClock(){
  document.getElementById("time").innerText = new Date().toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"});
  setTimeout(displayClock, 1000); 
}