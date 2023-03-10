class Control{
  /** 
   * @type {HTMLElement}
   */
  node = null;

  /**
   * 
   * @param {HTMLElement} parentNode 
   * @param {string} tag 
   * @param {string} className 
   * @param {string} content 
   */
  constructor(parentNode, tag = "div", className = "", content = ""){
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = content;
    parentNode.append(element);
    this.node = element;
  }

  destroy(){
    this.node.remove();
  }
}

export default Control;
