<div align="center">

<img src="public/bungkus.png" alt="Bungkus" width="200" />

# Bungkus

[![NPM Version](https://img.shields.io/npm/v/bungkus?style=flat-square&color=blue)](https://www.npmjs.com/package/bungkus)
[![License](https://img.shields.io/github/license/nafhansa/bungkus?style=flat-square&color=orange)](https://github.com/nafhansa/bungkus/blob/main/LICENSE)
[![Minzipped Size](https://img.shields.io/bundlephobia/minzip/bungkus?style=flat-square&color=success)](https://bundlephobia.com/package/bungkus)
[![Downloads](https://img.shields.io/npm/dm/bungkus?style=flat-square&color=red)](https://www.npmjs.com/package/bungkus)

**Form persistence for the paranoid**<br>
Saves form data (including Files/Blobs) to IndexedDB with encryption and auto-expiration

</div>

---

## The Problem

Your user spends 20 minutes filling out a registration form. They attach a photo of their KTP. Then, they accidentally hit "Refresh" or their WiFi dies. The form resets. **The user rage-quits.**

## The Solution

`bungkus` fixes this by silently saving every keystroke and file upload to a secure local database. When the user comes back, the data is restored instantly.

### Why not just use `localStorage`?

Because `localStorage` is weak. It chokes on files (images/PDFs), it's unencrypted (anyone inspecting the browser can read it), and it stays there forever until you manually clear it.

We provide **File Support**, **Encryption**, and **Auto-Expiry**. All in one tiny hook.

| Feature | `localStorage` | `bungkus` |
| :--- | :--- | :--- |
| **Saves Text** | ✅ Yes | ✅ Yes |
| **Saves Files (Images/PDF)** | ❌ No (String only) | ✅ **Yes (Blobs)** |
| **Encryption** | ❌ Naked Text | ✅ **Obfuscated** |
| **Auto-Expiry (TTL)** | ❌ Manual only | ✅ **Automatic** |

---

## Install

```bash
npm install bungkus
```

---

## 🎮 Try It Locally

Want to see the magic before installing? We included a full playground in this repo.

```bash
# 1. Clone the repo
git clone https://github.com/nafhansa/bungkus.git

# 2. Install & Run
cd bungkus
npm install
npm run dev
```

Try filling out the form, uploading a file, and refreshing the browser. The data persists!

> ⚠️ **Note on File Inputs:** Due to browser security, we cannot programmatically restore the value of `<input type="file" />`. The file input will look empty after refresh, but the File/Blob data is safely stored.
>
> You should use a visual preview (like an `<img>` tag) to show the user that their file is still there. (See [src/App.tsx](src/App.tsx) for the implementation example).

---

## Usage

### The "Safety Net" (Basic Usage)

Perfect for long forms. It watches your inputs and saves them. If the browser crashes, the data survives.

```typescript
import { useBungkus } from 'bungkus';

function RegistrationForm() {
  const { daftarkan, buangBungkus } = useBungkus('register-v1');

  return (
    <form onSubmit={() => buangBungkus()}>
      {/* Just use {...daftarkan('key')} instead of value/onChange */}
      <input type="text" {...daftarkan('username')} />
      <input type="file" {...daftarkan('avatar')} />
    </form>
  );
}
```

### The "Secret Agent" (Encryption)

For when you don't want curious eyes reading sensitive data in the DevTools > Application tab. Text data is obfuscated before hitting the database.

```typescript
const { daftarkan } = useBungkus('secret-mission', { 
  rahasia: true
});
```

### The "Self-Destruct" (Auto-Expiry)

Don't let old data rot in the user's browser. Set a timer. If the user comes back after the time limit, the data is treated as "expired" and purged automatically.

```typescript
const { values } = useBungkus('short-lived-form', { 
  kadaluarsa: 1
});
```

---

## Cheat Sheet (Docs)

Look, I built this because I needed to save files in a form without a backend. Here is the quick API:

### `useBungkus(formId, config?)`

**Parameters:**
- `formId` (required): Unique string to identify the form.
- `config.kadaluarsa` (default: `24`): Hours before data expires.
- `config.rahasia` (default: `true`): Encrypt text data.

**Returns:**
- `daftarkan(name)`: Helper to spread into `<input>`. Handles value, onChange, and files.
- `buangBungkus()`: Call this on successful submit to clear the storage.
- `values`: The raw data object (if you need it manually).
- `status`: `'idle' | 'memulihkan' | 'siap'`.

---

## License

MIT
