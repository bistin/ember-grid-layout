import { _ as _defineProperty } from '../defineProperty-f419f636.js';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
function bottom(layout) {
  let max = 0,
      bottomY;

  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }

  return max;
}
function cloneLayout(layout) {
  return layout.map(layoutItem => _objectSpread({}, layoutItem)); // const newLayout = Array(layout.length);
  // for (let i = 0, len = layout.length; i < len; i++) {
  //     newLayout[i] = cloneLayoutItem(layout[i]);
  // }
  // return newLayout;
} // Fast path to cloning, since this is monomorphic

function cloneLayoutItem(layoutItem) {
  return _objectSpread({}, layoutItem);
}
/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
// export function childrenEqual(a, b) {
//   return isEqual(
//     React.Children.map(a, c => c.key),
//     React.Children.map(b, c => c.key)
//   );
// }

/**
 * Given two layoutitems, check if they collide.
 */

function collides(l1, l2) {
  if (l1.i === l2.i) return false; // same element

  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2

  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2

  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2

  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2

  return true; // boxes overlap
}
/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */

function compact(layout, compactType, cols) {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout); // We go through the items by row and column.

  const sorted = sortLayoutItems(layout, compactType); // Holding for new items.

  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = cloneLayoutItem(sorted[i]); // Don't move static elements

    if (!l.static) {
      l = compactItem(compareWith, l, compactType, cols, sorted); // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.

      compareWith.push(l);
    } // Add to output array to make sure they still come out in the right order.


    out[layout.indexOf(sorted[i])] = l; // Clear moved flag, if it exists.

    l.moved = false;
  }

  return out;
}
const heightWidth = {
  x: 'w',
  y: 'h'
};
/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */

function resolveCompactionCollision(layout, item, moveToCoord, axis) {
  const sizeProp = heightWidth[axis];
  item[axis] += 1;
  const itemIndex = layout.map(layoutItem => {
    return layoutItem.i;
  }).indexOf(item.i); // Go through each item we collide with.

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i]; // Ignore static items

    if (otherItem.static) continue; // Optimization: we can break early if we know we're past this el
    // We can do this b/c it's a sorted layout

    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(layout, otherItem, moveToCoord + item[sizeProp], axis);
    }
  }

  item[axis] = moveToCoord;
}
/**
 * Compact an item in the layout.
 */


function compactItem(compareWith, l, compactType, cols, fullLayout) {
  const compactV = compactType === 'vertical';
  const compactH = compactType === 'horizontal';

  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y); // Move the element up as far as it can go without colliding.

    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    l.y = Math.min(bottom(compareWith), l.y); // Move the element left as far as it can go without colliding.

    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  } // Move it down, and keep moving it down if it's colliding.


  let collides;

  while (collides = getFirstCollision(compareWith, l)) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, 'x');
    } else {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, 'y');
    } // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.


    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
    }
  }

  return l;
}
/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */

function correctBounds(layout, bounds) {
  const collidesWith = getStatics(layout);

  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i]; // Overflows right

    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w; // Overflows left

    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }

    if (!l.static) collidesWith.push(l);else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }

  return layout;
}
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */

function getLayoutItem(layout, id) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }

  return;
}
/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */

function getFirstCollision(layout, layoutItem) {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }

  return;
}
function getAllCollisions(layout, layoutItem) {
  return layout.filter(l => collides(l, layoutItem));
}
/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */

function getStatics(layout) {
  return layout.filter(l => l.static);
}
/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */

function moveElement(layout, l, x, y, isUserAction, preventCollision, compactType, cols) {
  if (l.static) return layout; // Short-circuit if nothing to do.

  if (l.y === y && l.x === x) return layout;
  log(`Moving element ${l.i} to [${String(x)},${String(y)}] from [${l.x},${l.y}]`);
  const oldX = l.x;
  const oldY = l.y; // This is quite a bit faster than extending the object

  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;
  l.moved = true; // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.

  let sorted = sortLayoutItems(layout, compactType);
  const movingUp = compactType === 'vertical' && typeof y === 'number' ? oldY >= y : compactType === 'horizontal' && typeof x === 'number' ? oldX >= x : false;
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l); // There was a collision; abort

  if (preventCollision && collisions.length) {
    log(`Collision prevented on ${l.i}, reverting.`);
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  } // Move each item that collides away from this element.


  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    log(`Resolving collision between ${l.i} at [${l.x},${l.y}] and ${collision.i} at [${collision.x},${collision.y}]`); // Short circuit so we can't infinite loop

    if (collision.moved) continue; // Don't move static items - we have to move *this* element away

    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction, compactType);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction, compactType);
    }
  }

  return layout;
}
/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 */

function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction, compactType, cols) {
  const compactH = compactType === 'horizontal'; // Compact vertically if not set to horizontal

  const compactV = compactType !== 'horizontal';
  const preventCollision = false; // we're already colliding
  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.

  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false; // Make a mock item so we don't modify the item here, only modify in moveElement.

    const fakeItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1'
    }; // No collision? If so, we can go up there; otherwise, we'll end up moving down as normal

    if (!getFirstCollision(layout, fakeItem)) {
      log(`Doing reverse collision on ${itemToMove.i} up to [${fakeItem.x},${fakeItem.y}].`);
      return moveElement(layout, itemToMove, compactH ? fakeItem.x : undefined, compactV ? fakeItem.y : undefined, isUserAction, preventCollision, compactType);
    }
  }

  return moveElement(layout, itemToMove, compactH ? itemToMove.x + 1 : undefined, compactV ? itemToMove.y + 1 : undefined, isUserAction, preventCollision, compactType);
}
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */

function perc(num) {
  return (num * 100).toString() + '%';
}
function setTransform({
  top,
  left,
  width,
  height
}) {
  // Replace unitless items with px
  const translate = `translate(${left}px,${top}px)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  };
}
function setTopLeft({
  top,
  left,
  width,
  height
}) {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  };
}
/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */

function sortLayoutItems(layout, compactType) {
  if (compactType === 'horizontal') return sortLayoutItemsByColRow(layout);else return sortLayoutItemsByRowCol(layout);
}
function sortLayoutItemsByRowCol(layout) {
  return [...layout].sort(function (a, b) {
    if (a.y > b.y || a.y === b.y && a.x > b.x) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }

    return -1;
  });
}
function sortLayoutItemsByColRow(layout) {
  return [...layout].sort(function (a, b) {
    if (a.x > b.x || a.x === b.x && a.y > b.y) {
      return 1;
    }

    return -1;
  });
}
/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {?String} compact      Compaction option.
 * @return {Array}                Working layout.
 */
// export function synchronizeLayoutWithChildren(
//   initialLayout,
//   children,
//   cols,
//   compactType
// ) {
//   initialLayout = initialLayout || [];
//   // Generate one layout item per child.
//   let layout = [];
//   React.Children.forEach(children, (child, i) => {
//     // Don't overwrite if it already exists.
//     const exists = getLayoutItem(initialLayout, String(child.key));
//     if (exists) {
//       layout[i] = cloneLayoutItem(exists);
//     } else {
//       if (!isProduction && child.props._grid) {
//         console.warn(
//           "`_grid` properties on children have been deprecated as of React 15.2. " + // eslint-disable-line
//             "Please use `data-grid` or add your properties directly to the `layout`."
//         );
//       }
//       const g = child.props["data-grid"] || child.props._grid;
//       // Hey, this item has a data-grid property, use it.
//       if (g) {
//         if (!isProduction) {
//           validateLayout([g], "ReactGridLayout.children");
//         }
//         layout[i] = cloneLayoutItem({ ...g, i: child.key });
//       } else {
//         // Nothing provided: ensure this is added to the bottom
//         layout[i] = cloneLayoutItem({
//           w: 1,
//           h: 1,
//           x: 0,
//           y: bottom(layout),
//           i: String(child.key)
//         });
//       }
//     }
//   });
//   // Correct the layout.
//   layout = correctBounds(layout, { cols: cols });
//   layout = compact(layout, compactType, cols);
//   return layout;
// }

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */

function validateLayout(layout, contextName = 'Layout') {
  const subProps = ['x', 'y', 'w', 'h'];
  if (!Array.isArray(layout)) throw new Error(contextName + ' must be an array!');

  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];

    for (let j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j]] !== 'number') {
        throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].' + subProps[j] + ' must be a number!');
      }
    }

    if (item.i && typeof item.i !== 'string') {
      throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].i must be a string!');
    }

    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error('ReactGridLayout: ' + contextName + '[' + i + '].static must be a boolean!');
    }
  }
} // Flow can't really figure this out, so we just use Object
// export function autoBindHandlers(el, fns) {
//     fns.forEach(key => (el[key] = el[key].bind(el)));
// }

function log(...args) {
  return; // eslint-disable-next-line no-console
}

const noop = () => {};
function addItemToLayout(layout, newItem, compactType, cols) {
  const tmpArr = [...layout].map(d => _objectSpread({}, d));
  tmpArr.forEach(d => {
    if (d.y === newItem.y && d.x === newItem.x) {
      d.y = 0.1;
    }
  });
  tmpArr.push(newItem);
  const layout2 = compact(tmpArr, compactType, cols);
  return layout2.map((d, i) => _objectSpread(_objectSpread({}, tmpArr[i]), d));
}

export { addItemToLayout, bottom, cloneLayout, cloneLayoutItem, collides, compact, compactItem, correctBounds, getAllCollisions, getFirstCollision, getLayoutItem, getStatics, moveElement, moveElementAwayFromCollision, noop, perc, setTopLeft, setTransform, sortLayoutItems, sortLayoutItemsByColRow, sortLayoutItemsByRowCol, validateLayout };
