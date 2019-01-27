class ScrollIO {
    constructor({
        elements,
        threshold,
        onIntersect,
        namespace = '__scrollio',
    } = {}) {
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
        this.observer.disconnect();
        this.elements = undefined;
    }

    wrapElements(elements) {
        return elements.map((elem, index) => {
            elem[this.namespace] = { index, prevY: 0, prevRatio: 0 };
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
            typeof elements === 'string'
                ? document.querySelectorAll(elements)
                : elements
        );
    }

    handleIntersect(entries) {
        entries.forEach((entry, observer) => {
            const data = {
                index: entry.target[this.namespace].index,
                scroll: '',
                state: '',
            };

            const currY = entry.boundingClientRect.y;
            const currRatio = entry.intersectionRatio;

            const prevY = entry.target[this.namespace].prevY;
            const prevRatio = entry.target[this.namespace].prevRatio;

            data.scroll = currY < prevY ? 'down' : 'up';
            data.state = currRatio > prevRatio ? 'enter' : 'leave';

            this.onIntersect(data, entry, observer);

            entry.target[this.namespace].prevY = currY;
            entry.target[this.namespace].prevRatio = currRatio;
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
