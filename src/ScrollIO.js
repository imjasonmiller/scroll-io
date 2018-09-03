class ScrollIO {
    constructor({ elements, threshold, onIntersect, namespace = '__scrollio' } = {}) {
        this.namespace = namespace;
        this.elements = this.wrapElements(this.getElements(elements));

        this.onIntersect = onIntersect;
        this.handleIntersect = this.handleIntersect.bind(this);

        this.observer = new IntersectionObserver(this.handleIntersect, {
            threshold: this.thresholdRange(threshold),
        });

        this.elements.forEach(elem => this.observer.observe(elem));
    }

    disconnect() {
        this.observer.disconnect()
        this.elements = undefined
    }

    wrapElements(elements) {
        return elements.map((elem, index) => {
            elem[this.namespace] = {
                index,
                previousY: 0,
                previousRatio: 0,
            };

            return elem;
        });
    }

    getElements(elements) {
        // Single element
        if (elements.nodeType) {
            return [elements];
        }

        // String or NodeList
        return Array.from(
            typeof elements === 'string' ? document.querySelectorAll(elements) : elements
        );
    }

    handleIntersect(entries) {
        entries.forEach((entry, observer) => {
            const data = {
                index: entry.target[this.namespace].index,
                scroll: '',
                state: '',
            };

            const currentY = entry.boundingClientRect.y;
            const currentRatio = entry.intersectionRatio;

            const previousY = entry.target[this.namespace].previousY;
            const previousRatio = entry.target[this.namespace].previousRatio;

            if (entry.isIntersecting) {
                data.scroll = currentY < previousY ? 'down' : 'up';
                data.state = currentRatio > previousRatio ? 'enter' : 'leave';

                this.onIntersect(data, entry, observer);
            }

            entry.target[this.namespace].previousY = currentY;
            entry.target[this.namespace].previousRatio = currentRatio;
        });
    }

    thresholdRange({ steps = 0, min = 0, max = 1 }) {
        const thresholds = [min];

        for (let i = 1; i <= steps; i++) {
            const range = max - min;
            const step = i / steps;
            thresholds.push(min + step * range);
        }

        return thresholds;
    }
}

export default ScrollIO;
