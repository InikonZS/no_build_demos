class Control {
    constructor(parentNode, tagName = 'div', className = '', content = '') {
        let el = document.createElement(tagName);
        el.className = className;
        el.textContent = content;
        parentNode.appendChild(el);
        this.node = el;
    }
}

class CubeGeneric extends Control {
    constructor(parentNode, className, size, sideClassNames, sideContents) {
        super(parentNode, 'div', className);
        this.sides = [];
        this._size = size;
        for (let i = 0; i < 6; i++) {
            let sideElement = new Control(this.node, 'div', sideClassNames[i], sideContents[i]);
            sideElement.node.style.width = 2 * size + 'px';
            sideElement.node.style.height = 2 * size + 'px';
            sideElement.node.style['font-size'] = size + 'px';
            this.sides.push(sideElement);
        }
    }

    setTransform(x, y, ox, oy, oz) {
        let sides = this.sides.map(it => it.node);
        let size = this._size;
        sides[0].style.transform = `rotateY(${y}deg) rotateX(${x}deg)  translate3d(${ox}px, ${-oy}px, ${oz + size}px)`;
        sides[1].style.transform = `rotateY(${y}deg) rotateX(${x + 90}deg) translate3d(${ox}px, ${oz}px, ${oy + size}px)`;
        sides[2].style.transform = `rotateY(${y}deg) rotateX(${x + 180}deg)  translate3d(${ox}px, ${oy}px, ${-oz + size}px)`;
        sides[3].style.transform = `rotateY(${y}deg) rotateX(${x + 270}deg)  translate3d(${ox}px, ${-oz}px, ${-oy + size}px)`;
        sides[4].style.transform = `rotateY(${y + 90}deg) rotateX(${0}deg) rotateZ(${x}deg) translate3d(${-oz}px, ${-oy}px, ${size + ox}px)`;
        sides[5].style.transform = `rotateY(${y - 90}deg) rotateX(${0}deg) rotateZ(${-x}deg) translate3d(${oz}px, ${-oy}px, ${size - ox}px)`;
    }
}

class Cube extends CubeGeneric {
    constructor(parentNode, size = 50) {
        let sideClasses = [];
        let sideContents = [];
        for (let i = 0; i < 6; i++) {
            sideClasses.push(`side side${i + 1}`);
            sideContents.push(i + 1);
        }
        super(parentNode, 'box_wrapper', size, sideClasses, sideContents);
        this.position = { x: 0, y: 0 };
        this.startPosition = { x: 0, y: 0 };
        this.nextPosition = { x: 0, y: 0 };
        this.lerpValue = 0;
    }

    animatePosition(speed, deltaTime, onStart, onEnd) {
        if (this.lerpValue < 1) {
            if (this.lerpValue == 0) {
                onStart && onStart();
            }
            this.position.x = this.nextPosition.x * this.lerpValue + this.startPosition.x * (1 - this.lerpValue);
            this.position.y = this.nextPosition.y * this.lerpValue + this.startPosition.y * (1 - this.lerpValue);
            this.lerpValue += speed * deltaTime;
        } else {
            this.lerpValue = 1;
            this.startPosition.x = this.nextPosition.x;
            this.startPosition.y = this.nextPosition.y;
            this.position.x = this.nextPosition.x;
            this.position.y = this.nextPosition.y;
            onEnd && onEnd();
        }
    }
}

class Selector extends Control {
    constructor(parentNode, className, leftButtonClassName, rightButtonClassName, variantsClassName, itemClassName) {
        super(parentNode, 'div', className);
        this.leftButton = new Control(this.node, 'div', leftButtonClassName);
        this.variantContainer = new Control(this.node, 'div', variantsClassName);
        this.rightButton = new Control(this.node, 'div', rightButtonClassName);
        this.itemClassName = itemClassName;
        this.items = [];
        this.position = 0;

        this.rightButton.node.addEventListener('click', () => {
            this.slide(this.position + 1);
        })

        this.leftButton.node.addEventListener('click', () => {
            this.slide(this.position - 1);
        })
    }
    add(itemInner) {
        let item = new Control(this.variantContainer.node, 'div', this.itemClassName, itemInner);
        this.items.push(item);
        item.node.style.transform = `translate(${((this.items.length - 1) - this.position) * 100}% ,0px)`
    }

    slide(position) {
        if (position >= 0 && position < this.items.length) {
            this.position = position;
            this.items.forEach((it, i) => {
                it.node.style.transform = `translate(${(i - this.position) * 100}% ,0px)`
            });
            this.onChange && this.onChange(this.items[this.position], this.position);
        }
    }
}

class MainMenuButton extends Control {
    constructor(parentNode, className, frontClassName, backClassName, onClick) {
        super(parentNode, 'div', className);
        this.frontLayer = new Control(this.node, 'div', frontClassName);
        this.backLayer = new Control(this.node, 'div', backClassName);
        this.onClick = onClick;
        this.node.addEventListener('click', () => { this.onClick && this.onClick() });
    }
}