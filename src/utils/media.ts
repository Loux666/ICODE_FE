export function getImageUrl(path?: string | null, opts?: { default?: string; prefix?: string }) {
  const def = opts?.default || 'https://via.placeholder.com/120?text=U';
  if (!path) return def;
  if (/^https?:\/\//.test(path)) return path;

  const apiEnv = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  const origin = apiEnv.replace(/\/api\/?$/, '');
  const prefix = opts?.prefix || 'storage';

  // If path is absolute (starts with '/'), join with origin if available
  if (path.startsWith('/')) {
    return origin ? `${origin}${path}` : path;
  }

  // If path already starts with the prefix (e.g. 'storage/...'), don't add duplicate prefix
  if (path.startsWith(`${prefix}/`)) {
    return origin ? `${origin}/${path}` : `/${path}`;
  }

  // Default: prefix the path with the configured prefix
  return origin ? `${origin}/${prefix}/${path}` : `/${prefix}/${path}`;
}

export function getAvatarUrl(path?: string | null, size = 120) {
  const placeholder = `https://via.placeholder.com/${size}?text=U`;
  return getImageUrl(path, { default: placeholder });
}
