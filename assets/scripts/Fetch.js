import "whatwg-fetch";

const get = (url) => window.fetch(url)
    .then((r) => r.ok ? r.json() : new Promise((r) => window.setTimeout(() => r(get(url)), 1000)));

const post = (url, data) => window.fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(data),
}).then((r) => r.ok ? r.json() : Promise.reject('Cannot fetch'));

export default {get, post}

