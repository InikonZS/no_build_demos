let output = document.createElement('div');
document.body.append(output)

let a = [...document.querySelectorAll('a')].map(link => {
  link.onclick = (ev)=>{
    ev.preventDefault();
    //console.log(link.href);
    window.history.pushState(null, '', link.href)
  }
})

window.onpopstate = ()=>{
  output.textContent = window.location;
}

//window.history.pushState

window.onpopstate();