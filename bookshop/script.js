import Control from "./control.js";
import BookShop from "./bookShop.js";

const frag = document.createDocumentFragment();
const app = new BookShop(frag);
document.body.append(frag);
fetch('./books.json').then(res=>res.json()).then(booksData=>{
  app.update(booksData);
})
