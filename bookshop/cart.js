import Control from "./control.js";

class CartModel {
  data = null;

  constructor(initialData, onUpdate){
    this.data = initialData;
    this.onUpdate = onUpdate;
  }

  //set data()
  get totalPrice(){
    const sum = Object.values(this.data).reduce((res, it)=>{
      return res + it;
    }, 0);
    return sum;
  }

  _setData(id, itemData){
    if (typeof itemData == 'function'){
      this.data[id] = itemData(this.data[id]);
    } else {
      this.data[id] = itemData;
    }
    this.onUpdate(this.data, this.totalPrice);
  }

  add(id){
    this._setData(id, (last) => (last != null) ? last + 1 : 1);
    /*this.data[id] = this.data[id] != null ? this.data[id] + 1 : 1;
    this.onUpdate(this.data)*/
    /*this.data = {...this.data, [id]: this.data[id] != null ? this.data[id] + 1 : 1};
    this.onUpdate(this.data)*/
  }

  remove(id){
    this._setData(id, (last) => last - 1 );
  }

  removeAll(id){
    this._setData(id, 0);
  }
}

export class Cart extends Control{
  constructor(parentNode){
    super(parentNode);
    this.itemContainer = new Control(this.node);
    this.summaryContainer = new Control(this.node);
    this.views = {};
    this.model = new CartModel({}, (data, totalPrice)=>{
      Object.keys(data).forEach(id=>{
        if (this.views[id]){
          this.views[id].update({count: data[id]});
        } else {
          const item = new CartItem(this.itemContainer.node, id);
          item.onDelete = ()=>{
            this.model.remove(id);
          };
          this.views[id] = item;
        }
      });
      Object.keys(this.views).forEach(id=>{
        if (!this.model.data[id]){
          this.views[id].destroy();
        }
      });
      this.summaryContainer.node.textContent = totalPrice;
      //this.updateSum();
    })
    //this.data = {};
  }

  /*updateSum(){
    const sum = Object.values(this.model.data).reduce((res, it)=>{
      return res + it;
    }, 0);
    this.summaryContainer.node.textContent = sum;
  }*/

  add(id){
    this.model.add(id);
  }
    /*const handleDelete = ()=>{
      this.data[id] = this.data[id] - 1;
      if (this.data[id] == 0){
        this.views[id].destroy();
      } else {
        this.views[id].update({count: this.data[id]});
      }
      this.updateSum();
    }    
    
    this.data[id] = this.data[id] != null ? this.data[id] + 1 : 1;
    if (this.data[id] == 1){
      const item = new CartItem(this.itemContainer.node, id);
          item.onDelete = handleDelete;
      this.views[id] = item;
    } else {
      this.views[id].update({count: this.data[id]});
    }
    this.updateSum();

  }*/
}

export class CartItem extends Control{
  constructor(parentNode, id){
    super(parentNode);
    this.idView = new Control(this.node, 'div', '', id);
    this.countView = new Control(this.node, 'div', '', '1');
    this.deleteButton = new Control(this.node, "button", "", "remove");
    this.deleteButton.node.onclick = ()=>{
      this.onDelete();
    }
  }

  update(data){
    this.countView.node.textContent = data.count;
  }
}
