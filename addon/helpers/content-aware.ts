import { helper } from '@ember/component/helper';

export function contentAware([width, fn]: [number, (x:number) => void] /*, hash*/) {
    fn(width);
}

export default helper(contentAware);
