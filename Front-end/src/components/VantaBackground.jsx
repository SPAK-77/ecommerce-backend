import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();

  // Initialize Vanta Waves with #6497b1 Ice Blue & Crisp #ffffff White Theme Colors
  useEffect(() => {
    let effect = null;
    let timer = null;

    const initVanta = () => {
      if (window.VANTA && window.VANTA.WAVES && vantaRef.current) {
        if (effect) effect.destroy();

        effect = window.VANTA.WAVES({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: isDark ? 0x0c1b26 : 0xeaf4f9,
          shininess: isDark ? 140.0 : 90.0,
          waveHeight: 20.0,
          waveSpeed: 1.8,
          zoom: 0.70
        });
        setVantaEffect(effect);
      }
    };

    if (window.VANTA && window.VANTA.WAVES) {
      initVanta();
    } else {
      timer = setInterval(() => {
        if (window.VANTA && window.VANTA.WAVES) {
          initVanta();
          clearInterval(timer);
        }
      }, 50);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (effect) effect.destroy();
    };
  }, [isDark]);

  // Route change zoom pulse (navigating between products, profile, cart, dashboard, etc.)
  useEffect(() => {
    setIsZoomed(true);
    const pulseTimer = setTimeout(() => {
      setIsZoomed(false);
    }, 1200);
    return () => clearTimeout(pulseTimer);
  }, [location.pathname, location.search]);

  // Global Event listeners for inputs (search bar, profile fields) & interactive elements (products, buttons, links)
  useEffect(() => {
    let resetTimer = null;

    const handleFocusIn = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        setIsZoomed(true);
      }
    };

    const handleFocusOut = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        setIsZoomed(false);
      }
    };

    const handleClick = (e) => {
      const target = e.target.closest('.product-card, .category-card-realistic, .btn, .nav-link, .user-avatar-btn, .dropdown-item, .hero-quick-pill, .search-input, input, button, a');
      if (target) {
        setIsZoomed(true);
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          setIsZoomed(false);
        }, 1000);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('click', handleClick);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  // Update Vanta 3D zoom & color settings dynamically when zoomed/selected
  useEffect(() => {
    if (vantaEffect && vantaEffect.setOptions) {
      vantaEffect.setOptions({
        zoom: isZoomed ? 0.88 : 0.70,
        waveHeight: isZoomed ? 25.0 : 20.0,
        color: isDark ? (isZoomed ? 0x142e40 : 0x0c1b26) : (isZoomed ? 0xddeef7 : 0xeaf4f9)
      });
    }
  }, [isZoomed, vantaEffect, isDark]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: isZoomed ? 'scale(1.15)' : 'scale(1.0)',
        transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1), filter 0.7s ease',
        filter: isZoomed ? 'brightness(1.18)' : 'brightness(1.0)'
      }}
    />
  );
};

export default VantaBackground;
