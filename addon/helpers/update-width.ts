import { helper } from '@ember/component/helper';

export function updateWidth([width, fn]: [number, (x:number) => void] /*, hash*/) {
    fn(width);
}

export default helper(updateWidth);
