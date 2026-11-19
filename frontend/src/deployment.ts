/** GitHub Pages serves static files only; never probe or pretend to run a Java API there. */
export const staticDemo=import.meta.env.VITE_STATIC_DEMO==='true';
export const publicAsset=(path:string)=>`${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
