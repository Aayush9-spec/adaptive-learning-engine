# Landing Page - Quick Reference & Code Snippets

## Table of Contents
1. [Quick Customizations](#quick-customizations)
2. [Component Snippets](#component-snippets)
3. [Styling Tips](#styling-tips)
4. [Common Modifications](#common-modifications)
5. [Integration Patterns](#integration-patterns)

## Quick Customizations

### Change Primary Color (Entire Page)

**Command Line Find & Replace:**
```bash
# Replace blue with green
sed -i 's/from-blue-600 to-cyan-600/from-green-600 to-emerald-600/g' LandingPage.tsx
sed -i 's/blue-400 to-cyan-300/green-400 to-emerald-300/g' LandingPage.tsx
```

**Or in VS Code:**
- Press `Ctrl+H` (Find & Replace)
- Find: `from-blue-600 to-cyan-600`
- Replace: `from-green-600 to-emerald-600`
- Replace All

### Update Company Name

```typescript
// Before:
const companyName = "AI Learning Intelligence";

// After:
const companyName = "Your Company Name";

// Then replace all instances:
// Line 77, Line 155, Footer section
```

### Modify Headline Text

```typescript
// Find around line 155:
<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  Your AI-Powered Learning
  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
    Intelligence System
  </span>
</h1>

// Change to:
<h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
  Your New Headline Here
  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
    Your Subtitle Here
  </span>
</h1>
```

## Component Snippets

### Add a New Feature Card

```typescript
// Find the features array around line 10
const newFeature = {
  icon: Lightbulb,  // Choose from lucide-react
  title: 'Your Feature Title',
  description: 'Your feature description'
};

// Add to features array:
const features = [
  // ... existing features
  newFeature
];
```

### Add a New Pricing Tier

```typescript
// Find the pricingTiers array around line 100
const newTier = {
  name: 'Starter',
  price: '49',
  description: 'For growing teams',
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ],
  cta: 'Choose Starter',
  highlighted: false,
};

// Add to pricingTiers array
```

### Create a Custom Button Component

```typescript
export const CTAButton = ({ 
  text, 
  isPrimary = true, 
  onClick 
}) => (
  <motion.button
    className={`px-8 py-4 rounded-lg font-bold transition transform hover:scale-105 flex items-center justify-center gap-2 ${
      isPrimary
        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
        : 'border-2 border-blue-500/50 text-white'
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {text}
    <ArrowRight size={20} />
  </motion.button>
);

// Usage:
<CTAButton text="Get Started" isPrimary onClick={() => {}} />
```

## Styling Tips

### Add Glassmorphism Effect

```tsx
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
  {/* Your content */}
</div>
```

### Add Gradient Text

```tsx
<h1 className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Add Box Shadow Glow

```tsx
<div className="shadow-lg shadow-blue-500/50">
  {/* Your content */}
</div>
```

### Add Smooth Animation Transition

```tsx
<div className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl">
  {/* Your content */}
</div>
```

### Create Hover Lift Effect

```tsx
<div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
  {/* Your content */}
</div>
```

## Common Modifications

### Remove Mouse Gradient Background

```typescript
// Comment out or remove:
<motion.div 
  className="absolute w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"
  style={{
    left: `${mousePosition.x - 192}px`,
    top: `${mousePosition.y - 192}px`,
    transition: 'all 0.3s ease-out'
  }}
/>

// And remove the useEffect that tracks mouse movement
```

### Change Feature Grid Layout

```typescript
// From 3 columns:
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

// To 2 columns:
<div className="grid md:grid-cols-2 gap-6">

// To 4 columns:
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### Adjust Spacing

```typescript
// Tight spacing:
py-12 md:py-16
px-4 md:px-8

// Normal spacing (default):
py-20 md:py-32
px-6 md:px-12

// Loose spacing:
py-24 md:py-40
px-8 md:px-16
```

### Change Button Styles

```typescript
// Gradient button (default):
bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500

// Solid button:
bg-blue-600 hover:bg-blue-500

// Outline button:
border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10

// Ghost button:
hover:bg-white/5 text-gray-300 hover:text-white
```

### Adjust Text Size

```typescript
// Hero title sizes:
// Mobile: text-4xl (36px)
// Tablet: text-5xl (48px)
// Desktop: text-7xl (96px)

// Change by replacing:
text-5xl md:text-7xl

// To your preference:
text-4xl md:text-6xl  // Smaller
text-6xl md:text-8xl  // Larger
```

## Integration Patterns

### Connect "Start Free" Button to Sign Up

```typescript
import { useNavigate } from 'react-router';

export const LandingPageWithNavigation = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/signup')}
      className="..."
    >
      Start Free
    </button>
  );
};
```

### Add Google Analytics

```typescript
import ReactGA from 'react-ga4';

useEffect(() => {
  ReactGA.initialize('GA_MEASUREMENT_ID');
  
  // Track button clicks
  const trackCTA = (action) => {
    ReactGA.event({
      category: 'CTA',
      action: action,
    });
  };

  return trackCTA;
}, []);
```

### Add Form Submission Handler

```typescript
const handleGetStarted = async (email) => {
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (response.ok) {
      alert('Thanks for signing up!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Dark Mode Toggle (if needed)

```typescript
export const LandingPageWithTheme = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <div className={theme === 'dark' ? 'bg-slate-950' : 'bg-white'}>
      {/* Your content */}
    </div>
  );
};
```

## Advanced Tricks

### Add Video Background to Hero

```typescript
<div className="relative">
  <video
    autoPlay
    muted
    loop
    className="absolute inset-0 w-full h-full object-cover opacity-20"
  >
    <source src="/hero.mp4" type="video/mp4" />
  </video>
  
  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</div>
```

### Add Floating Card Animation

```typescript
import { motion } from 'framer-motion';

<motion.div
  animate={{
    y: [0, -20, 0],
    rotateZ: [0, 2, -2, 0],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    type: 'smooth',
  }}
>
  {/* Your card content */}
</motion.div>
```

### Dynamic Feature Icons

```typescript
// Instead of importing each icon separately:
import * as Icons from 'lucide-react';

const features = [
  { iconName: 'Brain', title: '...' },
  { iconName: 'Zap', title: '...' },
];

// Render dynamically:
{features.map((feature) => {
  const IconComponent = Icons[feature.iconName];
  return <IconComponent key={feature.iconName} />;
})}
```

### Conditional Rendering Based on Screen Size

```typescript
import { useMediaQuery } from 'react-responsive';

export const ResponsiveSection = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  return isMobile ? (
    <MobileLayout />
  ) : (
    <DesktopLayout />
  );
};
```

## Testing Snippets

### Visual Regression Testing

```typescript
// Using Percy by BrowserStack
import { percySnapshot } from '@percy/cli';

describe('Landing Page', () => {
  it('renders correctly', () => {
    cy.visit('/');
    percySnapshot('Landing Page');
  });
});
```

### Performance Testing

```typescript
// Lighthouse API
const lighthouseScore = async () => {
  const result = await lighthouse('https://yoursite.com');
  console.log('Performance:', result.lhr.categories.performance.score);
};
```

## Deploy Checklist

- [ ] Update page title in browser tab
- [ ] Add meta descriptions
- [ ] Replace all #dummy links
- [ ] Add real images/logos
- [ ] Test form submissions
- [ ] Set up email confirmation
- [ ] Add privacy policy link
- [ ] Add terms of service link
- [ ] Configure analytics
- [ ] Test on mobile devices
- [ ] Check loading performance
- [ ] Verify all external links
- [ ] Add sitemap.xml
- [ ] Add robots.txt
- [ ] Set up SSL certificate

## Keyboard Shortcuts (VS Code)

| Action | Shortcut |
|--------|----------|
| Find & Replace | Ctrl+H |
| Quick Open | Ctrl+P |
| Format Document | Shift+Alt+F |
| Comment Line | Ctrl+/ |
| Move Line | Alt+Up/Down |
| Duplicate Line | Ctrl+Shift+D |

## Useful Tailwind Classes Quick Reference

```plaintext
Spacing:
  p-4 (padding), m-4 (margin), gap-4 (gap)

Colors:
  text-white, bg-blue-600, border-blue-500

Sizing:
  w-full, h-screen, min-h-screen

Display:
  flex, grid, hidden, block

Responsive:
  md:grid-cols-2, lg:text-5xl, sm:p-4

Effects:
  shadow-lg, blur-3xl, opacity-50, rounded-xl
```

## Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module 'lucide-react'` | Run `npm install lucide-react` |
| `Tailwind classes not applying` | Check Tailwind CSS import in your CSS file |
| `TypeError: Cannot read property of undefined` | Check if data arrays (features, pricing) are defined |
| `Module not found` | Clear node_modules: `rm -rf node_modules && npm install` |

## Resources

- **Tailwind Docs:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev
- **Framer Motion:** https://www.framer.com/motion
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **React Docs:** https://react.dev

---

Need more help? Check out `LANDING_PAGE_DOCS.md` or `LANDING_PAGE_SETUP.md`
