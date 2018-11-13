/* global window */

export default function ready(fn) {
    const doc = window.document;
    if (doc.attachEvent ? doc.readyState === "complete" : doc.readyState !== "loading") {
        fn();
    } else {
        doc.addEventListener('DOMContentLoaded', fn);
    }
}