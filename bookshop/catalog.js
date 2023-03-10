import Control from "./control.js";

/**
 * @typedef CatalogItemData
 * @property {number} id
 * @property {string} author
 * @property {string} imageLink
 * @property {string} title
 * @property {number} price
 * @property {string} description
 */

export class Catalog extends Control{
  constructor(parentNode){
    super(parentNode, 'div', 'book-shelf');
    
  }

  /**
   * 
   * @param {Array<CatalogItemData>} catalogData 
   */
  update(catalogData){
    this.itemViews = catalogData.map(bookData=>{
      const item = new CatalogItem(this.node, bookData);
      item.onBuy = ()=>{
        this.onBuy(bookData.id);
      }
      item.onInfo = ()=>{
        this.onInfo(bookData.id);
      }
      return item;
    })
  }
}

export class CatalogItem extends Control{
  /**
   * 
   * @param {*} parentNode 
   * @param {CatalogItemData} data 
   */
  constructor(parentNode, data){
    super(parentNode, 'div', 'book-8');
    const sideA = new Control(this.node, 'div', 'imgBox');
    const sideB = new Control(this.node, 'div', 'details');

    this.author = new Control(sideB.node, 'div', '', data.author);
    this.buyButton = new Control(sideB.node, 'button', '', 'buy');
    this.buyButton.node.onclick = ()=>{
      this.onBuy();
    }
    this.infoButton = new Control(sideB.node, 'button', '', 'info');
    this.infoButton.node.onclick = ()=>{
      this.onInfo();
    }
  }
}