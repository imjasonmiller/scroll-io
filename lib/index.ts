function getSelection(
    selection: string | Element | NodeListOf<Element>
): Element[] {
    if (selection instanceof Element) {
        return [selection];
    }

    return Array.from(
        typeof selection === "string"
            ? document.querySelectorAll(selection)
            : selection
    );
}

type WrappedElement = Element & {
    [key: string]: {
        index: number;
        prevRatio: number;
        prevScroll: number;
    };
};

function wrapElements(
    elements: Element[],
    namespace: string
): WrappedElement[] {
    return elements.map((element, index) =>
        Object.assign(element, {
            [namespace]: { index, prevRatio: 0, prevScroll: 0 },
        })
    );
}

type Options = {
    range: { min?: number; max?: number; steps?: number };
    namespace: string;
};

type Handler = (
    data: {
        index: number;
        enterUp: boolean;
        leaveUp: boolean;
        enterDown: boolean;
        leaveDown: boolean;
    },
    entry: IntersectionObserverEntry,
    observer: IntersectionObserver
) => void;

export class ScrollIO {
    entries: WrappedElement[];
    options: Options;
    observer: IntersectionObserver;

    constructor(
        selection: string | Element | NodeListOf<Element>,
        public handler: Handler,
        options: Partial<Options>
    ) {
        this.options = { range: {}, namespace: "_scrollio", ...options };
        this.observer = new IntersectionObserver(this.handleIntersect, {
            threshold: this.getThresholds(this.options.range),
        });

        this.entries = wrapElements(
            getSelection(selection),
            this.options.namespace
        );
        this.entries.forEach(entry => this.observer.observe(entry));
    }

    handleIntersect = (entries: IntersectionObserverEntry[]): void => {
        for (const entry of entries) {
            const target = entry.target as WrappedElement;

            const currScroll = entry.boundingClientRect.top;
            const currRatio = entry.intersectionRatio;

            const { prevRatio, prevScroll } = target[this.options.namespace];

            const enterUp = currScroll > prevScroll && currRatio > prevRatio;
            const leaveUp = currScroll > prevScroll && currRatio < prevRatio;
            const enterDown = currScroll < prevScroll && currRatio > prevRatio;
            const leaveDown = currScroll < prevScroll && currRatio < prevRatio;

            const index = target[this.options.namespace].index;

            target[this.options.namespace].prevRatio = currRatio;
            target[this.options.namespace].prevScroll = currScroll;

            this.handler(
                { index, enterUp, leaveUp, enterDown, leaveDown },
                entry,
                this.observer
            );
        }
    };

    getThresholds({ steps = 0, min = 0, max = 1 }): number[] {
        const thresholds = [min];

        for (let i = 1; i <= steps; i++) {
            const range = max - min;
            const step = i / steps;

            thresholds.push(min + step * range);
        }

        return thresholds;
    }

    public disconnect(): void {
        this.observer.disconnect();
    }
}
