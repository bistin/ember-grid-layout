import Controller from '@ember/controller';
import { compact, moveElement } from 'ember-grid-layout/utils';
import { setProperties, action } from '@ember/object';
import 'ember-grid-layout/styles/grid-layout.css';

let i = 10;
let layout = [
    { x: 0, y: 0, w: 2, h: 4, i: '0', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '1', static: false },
    { x: 0, y: 0, w: 1, h: 4, i: '2', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '3', static: false },
];

layout = compact(layout, 'vertical', 12);

const wrappedLayout = layout.map((d, i) => ({
    data: i,
    position: d,
}));

export default class IndexController extends Controller {
    compactType = 'vertical';
    preventCollision = true;
    cols = 2;
    width = 555;
    wrappedLayout = wrappedLayout;

    init() {
        super.init(...arguments);
    }

    @action
    updatePosition(newLayout, moving) {
        this.wrappedLayout.forEach((d, i) => {
            setProperties(d.position, newLayout[i]);
        });
    }

    @action
    add() {
        i = i + 1;
        let newX = i % 2;
        let newY = -0.1;
        const newL = {
            position: {
                x: newX,
                y: newY,
                w: 1,
                h: 2,
                i: i.toString(),
                static: false,
            },
            data: i,
        };
        this.wrappedLayout.pushObject(newL);
    }

    @action
    changeWidth() {
        this.set('width', this.width * 0.8);
    }
}
