## Checkpoint.js

Abstraction for `IntersectionObserver` that also returns the current scroll state:

---

```js
import Checkpoint from 'checkpoint';

// Cache children of each '.feature'
const captions = document.querySelectorAll('.caption');

const handleIntersect = ({ index, state, scroll }, entry, observer) => {
    const ratio = entry.intersectionRatio;

    // prettier-ignore
    if ((state === 'enter' && scroll === 'down') ||
        (state === 'leave' && scroll === 'up')) {
        captions[index].style.transform = `translateY(${50 * (1 - ratio)}%)`;
        captions[index].style.opacity = ratio;
    }
};

const observer = new Checkpoint({
    elements: '.feature',
    threshold: { steps: 50 },
    onIntersect: handleIntersect,
});
```

## Options

### elements

| Default | Type   |
| ------- | ------ |
| `null`  | String | Element | NodeList | Array |

### threshold

| Default                         | Type   |
| ------------------------------- | ------ |
| `{ min: 0, max: 1, steps: 10 }` | Object |

### onIntersect

| Default | Type     |
| ------- | -------- |
| `null`  | Function |
