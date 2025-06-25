# Lockify
## Leverage promises to ensure a function doesn't execute concurrently

Most asynchronous functions are fine to run concurrently with themselves.
But when they're not—lockify them.

---

Lockify takes an async function (or any function that returns a promise), and lets you limit concurrency.
By default the maximum concurrency is 1.

Let's say we're getting dog descriptions from an API:

```javascript
const headers = { Authorization: 'Bearer abc123xyz890' }
function fetchDog(name) {
  const url = `http://example.com/dog/${name}`
  return fetch(url, { headers }).then(res => res.json())
}

const allDogs = Promise.all(
  ['Fido', 'Princess', 'Fluffy'].map(fetchDog)
)
```

Unfortunately this API doesn't allow your key to fetch more than one dog at a time.
Lockify can help with that:

```javascript
const headers = { Authorization: 'Bearer abc123xyz890' }
function fetchDog(name) {
  const url = `http://example.com/dog/${name}`
  return fetch(url, { headers }).then(res => res.json())
}

const politeFetchDog = lockify(fetchDog)

const allDogs = Promise.all(
  ['Fido', 'Princess', 'Fluffy'].map(politeFetchDog)
)
```

Or, if you've paid more for the "fetch two dogs at a time" plan with the dog description service:

```javascript
const politeFetchDog = lockify(fetchDog, 2)
```
