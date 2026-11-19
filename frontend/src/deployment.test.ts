import { afterEach,expect,it,vi } from 'vitest';
import { api } from './types';
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
it('refuses backend calls in a static deployment without touching the network',async()=>{
 vi.stubEnv('VITE_STATIC_DEMO','true');const network=vi.spyOn(globalThis,'fetch');
 await expect(api('/runs',{method:'POST'})).rejects.toThrow('Java backend unavailable on GitHub Pages');
 expect(network).not.toHaveBeenCalled();
});
it('keeps real API access available when static mode is off',async()=>{
 vi.stubEnv('VITE_STATIC_DEMO','false');const network=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({healthy:true}),{status:200}));
 expect(await api('/catalog')).toEqual({healthy:true});expect(network).toHaveBeenCalledWith('/api/catalog',expect.any(Object));
});
