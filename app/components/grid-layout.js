import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    init() {
        this._super();
        this.setProperties({
            autoSize: true,
            cols: 12,
            className: "",
            style: {},
            width: 900,
            draggableHandle: "",
            draggableCancel: "",
            containerPadding: [10, 10],
            rowHeight: 30,
            maxRows: 500, // infinite vertical growth
            layoutModel: [],
            margin: [10, 10],
            isDraggable: true,
            isResizable: true,
            useCSSTransforms: true,
            verticalCompact: true,
            compactType: "vertical",
            preventCollision: false,
            // onLayoutChange: noop,
            // onDragStart: noop,
            // onDrag: noop,
            // onDragStop: noop,
            // onResizeStart: noop,
            // onResize: noop,
            // onResizeStop: noop
        });
    }
});
