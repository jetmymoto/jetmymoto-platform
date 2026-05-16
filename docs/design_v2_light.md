# DESIGN V2 LIGHT — HARD DESIGN CONTRACT

## 🚫 FORBIDDEN ELEMENTS (IMMEDIATE REJECTION)

### Colors - BANNED:
- `#050505` (old jet-dark)
- `bg-black`, `bg-zinc-900`, `bg-gray-900`
- Any gradients to black
- "Dark mode" references
- Tactical color schemes

### Typography - BANNED:
- `uppercase` class spam
- All-caps text everywhere
- "TACTICAL", "PROTOCOL", "INTERCEPT" language
- Military/tactical terminology

### Aesthetic - BANNED:
- "Luxury-watch aesthetic"
- "Mechanical brutalist"
- "Tactical UI"
- "Protocol-driven"
- Dark glass morphism

---

## ✅ REQUIRED LIGHT SYSTEM

### Core Color Palette:
```css
DEFAULT_BACKGROUND: #F7F6F3    /* Warm white base */
CARD_BACKGROUND: #FFFFFF       /* Pure white cards */
TEXT_PRIMARY: #1F2937          /* Dark gray text */
TEXT_SECONDARY: #6B7280        /* Medium gray text */
ACCENT_PRIMARY: #2563EB        /* Clean blue */
ACCENT_SECONDARY: #059669      /* Success green */
BORDER_LIGHT: #E5E7EB          /* Light gray borders */
```

### Card System:
```css
Cards = bg-white + subtle shadow
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
```

### Typography Rules:
- **Headlines:** Mixed case, clean sans-serif
- **Body:** Normal sentence case
- **Buttons:** Mixed case ("Learn more" not "LEARN MORE")
- **Labels:** Sentence case with proper capitalization

---

## 🎨 DESIGN INSPIRATION

### Reference Style:
- **Apple Travel** - Clean, minimal, premium
- **Airbnb** - Friendly, accessible, trustworthy  
- **Tesla UI** - Modern, sophisticated, uncluttered

### Visual Principles:
1. **Generous whitespace** - let content breathe
2. **Subtle shadows** - depth without drama
3. **Soft rounded corners** - approachable, not harsh
4. **Clean typography hierarchy** - clear information flow
5. **Purposeful color** - accent colors guide action

---

## 📱 COMPONENT STANDARDS

### Navigation:
```jsx
<nav className="bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <Logo className="h-8 text-blue-600" />
        <span className="ml-3 text-lg font-semibold text-gray-900">JetMyMoto</span>
      </div>
    </div>
  </div>
</nav>
```

### Hero Sections:
```jsx
<section className="bg-gradient-to-br from-blue-50 to-indigo-100">
  <div className="max-w-7xl mx-auto px-4 py-24">
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
      Ship your bike anywhere
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl">
      Reliable motorcycle shipping and rental network across Europe and beyond.
    </p>
  </div>
</section>
```

### Feature Cards:
```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-blue-600" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature title</h3>
  <p className="text-gray-600">Clean, readable description text.</p>
</div>
```

### Buttons:
```jsx
/* Primary Button */
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Get started
</button>

/* Secondary Button */
<button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
  Learn more
</button>
```

---

## 🔧 IMPLEMENTATION RULES

### For All Generators (Stitch, Code, etc.):
1. **Always reference this document** before generating UI
2. **Reject any output** containing forbidden elements
3. **Default to light theme** unless explicitly overridden
4. **Use reference examples** from Apple Travel/Airbnb/Tesla

### For Stitch Prompts:
```
Design Requirements:
- Light theme with #F7F6F3 default background
- White cards with subtle shadows
- Mixed case typography (no uppercase spam)
- Apple Travel/Airbnb/Tesla aesthetic
- NO dark/tactical elements
- Clean, modern, approachable design
```

### For Code Generation:
- Import design tokens from this contract
- Validate against forbidden color list
- Use component examples as baseline

---

## 🧪 VALIDATION CHECKLIST

Before approving any design:
- [ ] No #050505 or black backgrounds
- [ ] No uppercase text spam
- [ ] Cards use white + shadow
- [ ] Typography follows mixed case rules
- [ ] Aesthetic matches Apple Travel/Airbnb/Tesla
- [ ] No tactical/military language
- [ ] Light theme is default

---

## 📄 AUTHORITY

This document **OVERRIDES**:
- Previous dark theme guidelines
- Halation compliance rules (archived)
- Any tactical UI specifications
- Legacy design tokens

**Effective immediately** - all new designs must comply with this light contract.