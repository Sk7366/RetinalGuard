import React, { useEffect } from 'react';
import { LanguageCode } from './translations';
import { PHRASE_MAP } from './comprehensiveTranslations';

interface DOMTranslatorProps {
  language: LanguageCode;
}

const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

export const DOMTranslator: React.FC<DOMTranslatorProps> = ({ language }) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const phrases = PHRASE_MAP[language] || {};

    const isBrandElement = (el: Element | null): boolean => {
      if (!el) return false;
      if (el.id === 'navbar-brand-logo-btn' || el.closest('#navbar-brand-logo-btn')) {
        return true;
      }
      if (el.classList?.contains('keep-brand') || el.closest('.keep-brand')) {
        return true;
      }
      return false;
    };

    const shouldSkipElement = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toUpperCase();
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA'].includes(tag)) {
        return true;
      }
      return isBrandElement(el);
    };

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (shouldSkipElement(parent)) return;

        const currentVal = node.nodeValue || '';
        const trimmed = currentVal.trim();
        if (!trimmed) return;

        if (language === 'en') {
          // Restore original if available
          if (originalTextMap.has(node)) {
            const original = originalTextMap.get(node);
            if (original !== undefined && node.nodeValue !== original) {
              node.nodeValue = original;
            }
          }
          return;
        }

        // Check if we have an exact match or key in dictionary
        const sourceText = originalTextMap.get(node) || trimmed;
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal);
        }

        if (phrases[sourceText]) {
          const replacement = phrases[sourceText];
          // Preserve leading and trailing spaces
          const leadingSpaces = currentVal.match(/^\s*/)?.[0] || '';
          const trailingSpaces = currentVal.match(/\s*$/)?.[0] || '';
          node.nodeValue = leadingSpaces + replacement + trailingSpaces;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (shouldSkipElement(el)) return;

        // Check placeholder & title attributes
        const attrs = ['placeholder', 'title', 'aria-label'];
        attrs.forEach((attr) => {
          const val = el.getAttribute(attr);
          if (val) {
            const trimmed = val.trim();
            if (language === 'en') {
              const saved = originalAttrMap.get(el);
              if (saved && saved[attr]) {
                el.setAttribute(attr, saved[attr]);
              }
            } else {
              let saved = originalAttrMap.get(el);
              if (!saved) {
                saved = {};
                originalAttrMap.set(el, saved);
              }
              if (!saved[attr]) {
                saved[attr] = val;
              }
              const original = saved[attr] || trimmed;
              if (phrases[original]) {
                el.setAttribute(attr, phrases[original]);
              }
            }
          }
        });

        // Walk children
        node.childNodes.forEach((child) => translateNode(child));
      }
    };

    // Initial pass
    translateNode(document.body);

    // Observe mutations
    let isMutating = false;
    const observer = new MutationObserver((mutations) => {
      if (isMutating) return;
      isMutating = true;
      try {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((added) => translateNode(added));
          } else if (mutation.type === 'characterData') {
            translateNode(mutation.target);
          }
        });
      } finally {
        isMutating = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return null;
};
