const btn = document.querySelector('.click');
btn.onclick = ()=>{
    gtag('event', 'my_click_event', {
        date: new Date(),
      });
}