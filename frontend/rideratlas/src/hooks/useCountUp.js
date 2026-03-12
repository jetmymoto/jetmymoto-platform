import React from 'react';
import { animate } from 'framer-motion';

export const useCountUp = (to, duration = 1.5) => {
  const nodeRef = React.useRef();

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = parseInt(node.textContent.replace(/,/g, ''), 10) || 0;

    const controls = animate(from, to, {
      duration: duration,
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString();
      }
    });

    return () => controls.stop();
  }, [to, duration]);

  return nodeRef;
};