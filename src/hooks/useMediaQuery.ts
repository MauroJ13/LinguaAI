import { useEffect, useState } from 'react';

/** Reagiert live auf eine CSS-Media-Query (z. B. Smartphone vs. Desktop). */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Gleiche Grenze wie $bp-md in den Styles: darunter Smartphone-Darstellung. */
export const MOBILE_QUERY = '(max-width: 860px)';
