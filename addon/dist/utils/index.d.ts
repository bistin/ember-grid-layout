type CompactType = 'horizontal' | 'vertical';
type LayoutItem = {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
};
type Layout = LayoutItem[];
type Position = {
    left: number;
    top: number;
    width: number;
    height: number;
};
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
declare function bottom(layout: Layout): number;
declare function cloneLayout(layout: Layout): Layout;
declare function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem;
/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
/**
 * Given two layoutitems, check if they collide.
 */
declare function collides(l1: LayoutItem, l2: LayoutItem): boolean;
/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
declare function compact(layout: Layout, compactType: CompactType, cols: number): Layout;
/**
 * Compact an item in the layout.
 */
declare function compactItem(compareWith: Layout, l: LayoutItem, compactType: CompactType, cols: number, fullLayout: Layout): LayoutItem;
/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
declare function correctBounds(layout: Layout, bounds: {
    cols: number;
}): Layout;
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
declare function getLayoutItem(layout: Layout, id: string): LayoutItem | undefined;
/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
declare function getFirstCollision(layout: Layout, layoutItem: LayoutItem): LayoutItem | undefined;
declare function getAllCollisions(layout: Layout, layoutItem: LayoutItem): LayoutItem[];
/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
declare function getStatics(layout: Layout): LayoutItem[];
/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */
declare function moveElement(layout: Layout, l: LayoutItem, x: number | undefined, y: number | undefined, isUserAction: boolean, preventCollision: boolean, compactType: CompactType, cols: number): Layout;
/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 */
declare function moveElementAwayFromCollision(layout: Layout, collidesWith: LayoutItem, itemToMove: LayoutItem, isUserAction: boolean, compactType: CompactType, cols: number): Layout;
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
declare function perc(num: number): string;
declare function setTransform({ top, left, width, height }: Position): {
    transform: string;
    WebkitTransform: string;
    MozTransform: string;
    msTransform: string;
    OTransform: string;
    width: string;
    height: string;
    position: string;
};
declare function setTopLeft({ top, left, width, height }: Position): {
    top: string;
    left: string;
    width: string;
    height: string;
    position: string;
};
/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
declare function sortLayoutItems(layout: Layout, compactType: CompactType): LayoutItem[];
declare function sortLayoutItemsByRowCol(layout: Layout): LayoutItem[];
declare function sortLayoutItemsByColRow(layout: Layout): LayoutItem[];
/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
declare function validateLayout(layout: Layout, contextName?: string): void;
declare const noop: () => void;
declare function addItemToLayout(layout: Layout, newItem: LayoutItem, compactType: CompactType, cols: number): Layout;
export { CompactType, LayoutItem, Layout, Position, bottom, cloneLayout, cloneLayoutItem, collides, compact, compactItem, correctBounds, getLayoutItem, getFirstCollision, getAllCollisions, getStatics, moveElement, moveElementAwayFromCollision, perc, setTransform, setTopLeft, sortLayoutItems, sortLayoutItemsByRowCol, sortLayoutItemsByColRow, validateLayout, noop, addItemToLayout };
