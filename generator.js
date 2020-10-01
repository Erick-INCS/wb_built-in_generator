class Cloner {
    constructor({animation, tryResponsive}) {
        this.animation = animation;
        this.tryResponsive = tryResponsive;
        this.attributes = [];
        this.widthFactor = 0;
        this.heightFactor = 0;
        
        this.cssName = function (jsName) {
            let word = '';
            for (const l of jsName) word += l === l.toUpperCase() ? '-' + l.toLowerCase() : l;
        
            return word;
        };

        this.convertToResponsive = function (value, factor, unit) {
            if (!value || typeof(value) !== 'string') return value;
            value = value.split(' ');
            for (let i = 0; i < value.length; i++) {
                if (value[i].includes('px')) {
                    value[i] = parseFloat(value[i].replace('px', ''))/factor + unit; 
                }
                
            }

            return value.join(' ');
        }

        this.buildUnit = function (element) {
            let reverted = document.createElement(element.tagName),
            customStyles = window.getComputedStyle(element),
            stylesStr = '',
            style = '';
            const needFill = !this.attributes.length;
        
            document.body.appendChild(reverted);
            
            for (const attr in reverted.style) {
                if (
                    needFill &&
                    !(!this.animation && attr === 'animation') &&
                    this.tryResponsive && (!attr.includes('height') || !attr.includes('width'))
                    ) {
                    this.attributes.push(attr);
                }

                style += `${this.cssName(attr)}:revert;`;
            }

            reverted.setAttribute('style', style);
        
            const defaultStyles = window.getComputedStyle(reverted);
            
            for (const attr of this.attributes) {
                if (!attr.includes('webkit') && attr != 'cssText' && defaultStyles[attr] !== customStyles[attr]) {
                    
                    let val = customStyles[attr] || 'revert';

                    if (this.tryResponsive && val.includes('px')) {
                        if (val.includes('height')) {
                            val = this.convertToResponsive(val, this.heightFactor, 'vh');
                        } else  {
                            val = this.convertToResponsive(val, this.widthFactor, 'vw');
                        }  
                    }

                    stylesStr += `${this.cssName(attr)}:${val};`;
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

        this.generateElement = function (selector) {
            let div = document.createElement('div'),
            st;

            div.style.height = '1vh';
            div.style.width = '1vw';
            
            document.body.appendChild(div);
            
            st = window.getComputedStyle(div);
            
            this.widthFactor = parseFloat(st.width.replace('px', ''));
            this.heightFactor = parseFloat(st.height.replace('px', ''));

            return this.generate(selector);
        }
    }
}

/*
    Example
*/

var cl = new Cloner({tryResponsive: true, animation: false});
cl.generateElement('h1');
