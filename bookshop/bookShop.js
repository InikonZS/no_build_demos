import Control from "./control.js";
import { Catalog } from "./catalog.js";
import { Cart } from "./cart.js";

class BookShop extends Control{
  data = {};

  constructor(parentNode){
    super(parentNode);
    this.catalog = new Catalog(this.node);
    this.catalog.onBuy = (id)=>{
      this.cart.add(id);
    }
    this.catalog.onInfo = (id)=>{
      const popup = new Popup(this.node, this.data[id]);
    }
    this.cart = new Cart(this.node);
  }

  update(data){
    data.forEach(it=>{
      this.data[it.id] = it;
    })
    this.catalog.update(data);
  }
}

class Popup extends Control{
  constructor(parentNode, data){
    super(parentNode);
    this.dataContainter = new Control(this.node);
    this.dataContainter.node.innerHTML = `
    <ul>
      <li>title: ${data.title}</li>
      <li>${data.description}</li>
    </ul>
    `
    this.closeButton = new Control(this.node, "button", "", "close");
    this.closeButton.node.onclick = ()=>{
      this.destroy();
      this.onClose?.();
    }
  }
}

export default BookShop;