class Cloner {
    constructor() {
        
        this.attributes = [];
        
        this.cssName = function (jsName) {
            let word = '';
            for (const l of jsName) word += l === l.toUpperCase() ? '-' + l.toLowerCase() : l;
        
            return word;
        };

        this.buildUnit = function (element) {
            let reverted = document.createElement(element.tagName),
            customStyles = window.getComputedStyle(element),
            stylesStr = '',
            style = '';
            const needFill = !this.attributes.length;
        
            document.body.appendChild(reverted);
            
            for (const attr in reverted.style) {
                if (needFill) this.attributes.push(attr);
                style += `${this.cssName(attr)}:revert;`;
            }

            reverted.setAttribute('style', style);
        
            const defaultStyles = window.getComputedStyle(reverted);
            
            for (const attr of this.attributes) {
                if (!attr.includes('webkit') && attr != 'cssText' && defaultStyles[attr] !== customStyles[attr]) {
                    stylesStr += `${this.cssName(attr)}:${customStyles[attr] || 'revert'};`;
                } 
            }
        
            reverted.remove();
        
            return stylesStr;
        };
        
        this.generate = function (selector) {
            let objetive,
            innerContent = '',
            nodeCopy;
        
            if (!selector) return '';
            
            if (typeof(selector) === 'string') {
                if (!$) {
                    objetive = document.querySelector(selector);
                } else {
                    objetive = $(selector);
                    if (objetive[0]) objetive = objetive[0];
                }
            } else {
                objetive = selector;
            }
        
            nodeCopy = document.createElement(objetive.tagName);
        
            for (const node of objetive.childNodes) {
                if (node.nodeName == '#comment') continue;
        
                if (node.nodeName == '#text') {
                    innerContent += node.textContent;
                } else if (node.hasChildNodes()) {
                    innerContent += this.generate(node);
                } else {
                    innerContent += node.outerHTML;
                }
            }
        
            nodeCopy.innerHTML = innerContent;
            nodeCopy.setAttribute('style', this.buildUnit(objetive));
            return nodeCopy.outerHTML;
        }
    }
}

/*
    Example
*/

var cl = new Cloner();
cl.generate('h1');
