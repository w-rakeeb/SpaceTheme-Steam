// Steam still reconciles a moved control against its original parent. Forward only
// operations on controls this theme moved; leave every other DOM operation native.
const owners = new WeakMap();
export function moveControl(control, target) {
    const parent = control.parentNode;
    if (!parent) { target.appendChild(control); return; }
    let moved = owners.get(parent);
    if (!moved) {
        moved = new WeakSet();
        owners.set(parent, moved);
        const {insertBefore, removeChild, replaceChild} = parent;
        parent.insertBefore = function (node, reference) {
            if (reference && moved.has(reference) && reference.parentNode && reference.parentNode !== this) {
                moved.add(node);
                return reference.parentNode.insertBefore(node, reference);
            }
            return insertBefore.call(this, node, reference);
        };
        parent.removeChild = function (node) {
            if (moved.has(node) && node.parentNode && node.parentNode !== this) {
                moved.delete(node);
                return node.parentNode.removeChild(node);
            }
            return removeChild.call(this, node);
        };
        parent.replaceChild = function (node, previous) {
            if (moved.has(previous) && previous.parentNode && previous.parentNode !== this) {
                moved.delete(previous);
                moved.add(node);
                return previous.parentNode.replaceChild(node, previous);
            }
            return replaceChild.call(this, node, previous);
        };
    }
    moved.add(control);
    target.appendChild(control);
}
