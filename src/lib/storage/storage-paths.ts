export function extractStorageObjectPathFromUrl(url: string, bucket: string) {
  if (!url || !bucket) return null;

  try {
    const parsed = new URL(url);
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const signedMarker = `/storage/v1/object/sign/${bucket}/`;

    const publicIndex = parsed.pathname.indexOf(publicMarker);
    if (publicIndex >= 0) {
      const path = parsed.pathname.slice(publicIndex + publicMarker.length);
      return path ? decodeURIComponent(path) : null;
    }

    const signedIndex = parsed.pathname.indexOf(signedMarker);
    if (signedIndex >= 0) {
      const path = parsed.pathname.slice(signedIndex + signedMarker.length);
      return path ? decodeURIComponent(path) : null;
    }
  } catch {
    return null;
  }

  return null;
}

