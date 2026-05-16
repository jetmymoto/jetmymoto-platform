# Remotion Technical Documentation Harvest

## [useDelayRender] Implementation Patterns for High-Resolution Tile Loading

### Core Strategy
When loading high-resolution tiles, wrap each tile's loading logic in a `useDelayRender` call. This ensures that the rendering process pauses until all necessary data is loaded, preventing frames from being captured with missing or low-resolution content.

### Implementation Steps
1. **Initialize the Delay**: Call `delayRender()` as soon as the component mounts or the tile URL is determined.
2. **Load the Asset**: Use a standard loading mechanism (like an `Image` object or `fetch`).
3. **Continue the Render**: Once the tile is fully loaded, call `continueRender(handle)`.
4. **Handle Errors**: Use `cancelRender(error)` if a tile fails to load to prevent the render from hanging.

### Example Code
```tsx
import React, { useState, useEffect } from 'react';
import { useDelayRender } from 'remotion';

const HighResTile = ({ src }) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading tile: ${src}`));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
      continueRender(handle);
    };
    img.onerror = (err) => cancelRender(new Error(`Failed to load tile: ${src}`));
  }, [src, handle, continueRender, cancelRender]);

  if (!loaded) return null;
  return <img src={src} style={{ width: 256, height: 256 }} />;
};
```

---

## [Geodesic Line Animation] using @turf/turf for "Airlift" Flight Paths

### Core Implementation Strategy
1. **Generate Full Path**: Use `turf.greatCircle(start, end)` to create a curved LineString.
2. **Calculate Distance**: Use `turf.length(fullRoute)` for total distance.
3. **Slice the Line**: Use `turf.lineSliceAlong(fullRoute, 0, currentDistance)` where `currentDistance` is driven by `useCurrentFrame()`.

### Example Code
```tsx
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import * as turf from '@turf/turf';

export const FlightPath = ({ startPoint, endPoint }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fullRoute = useMemo(() => turf.greatCircle(startPoint, endPoint), []);
  const totalDistance = useMemo(() => turf.length(fullRoute), [fullRoute]);

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const animatedLine = turf.lineSliceAlong(fullRoute, 0, totalDistance * progress);
  return <path d={/* convert animatedLine to SVG path */} />;
};
```

---

## [GPU-Accelerated Rendering] Flags for Headless Server Environments

### Recommended Flags
- **Local Desktop**: `--gl=angle`
- **Linux Server (with GPU)**: `--gl=angle-egl`
- **Headless Server (no GPU)**: `--gl=swangle`

### Configuration (`remotion.config.ts`)
```typescript
import { Config } from '@remotion/cli/config';

Config.setChromiumOpenGlRenderer('angle-egl'); // Best for Linux GPU instances
Config.setChromeMode('chrome-for-testing');    // Ensures GPU activation in headless environments
```
