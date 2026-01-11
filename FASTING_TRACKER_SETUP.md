# 🍎 Fasting Tracker Setup (React + Web Components)

**Architecture:** React app wrapped as a Web Component, loaded dynamically by Angular Shell.

---

## 🚀 How to Run

### **1. Fasting Tracker (Port 4206)**
This must run as a static file server to serve the built Web Component.

```bash
cd fitlog-fasting-tracker
npm run build
npx http-server dist -p 4206 --cors
```

**Verify:** Open http://localhost:4206/fasting-tracker.js in your browser. You should see JavaScript code.

### **2. Shell (Port 4200)**
Run the Angular shell normally.

```bash
cd fitlog-shell
npm start
```

**Verify:** Open http://localhost:4200/fasting. You should see the React app!

---

## 🛠️ Configuration Details

### **React Side (`fitlog-fasting-tracker`)**
- **Type:** React 19
- **Build:** Vite Library Mode
- **Output:** `dist/fasting-tracker.js` (Self-contained Web Component)
- **Wrapper:** `src/web-component.tsx` defines `<fitlog-fasting-tracker-element>`

### **Angular Side (`fitlog-shell`)**
- **Integration:** `FastingWrapperComponent`
- **Mechanism:** Manually injects `<script>` tag pointing to localhost:4206
- **Routing:** `/fasting` route mapped to wrapper

---

## ❓ Troubleshooting

### **"Failed to load React Fasting Tracker"**
1. Check if port 4206 is running (`npx http-server` command).
2. Check if you can access http://localhost:4206/fasting-tracker.js directly.
3. Check browser console for CORS errors (should be fixed by `--cors` flag).

### **Updates not showing?**
Since it's a static build, you MUST run `npm run build` in `fitlog-fasting-tracker` after every change!

---

## 📝 Why this approach?
We switched from **Module Federation** to **Web Components** for the React app because:
1. **Stability:** Integrating Vite Module Federation with Angular Native Federation is unstable.
2. **Simplicity:** Web Components are browser-native and framework-agnostic.
3. **Isolation:** React styles and lifecycle are better isolated.
