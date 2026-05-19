/**
 * Image wrapper that adds lazy loading + async decoding by default and makes
 * the common bits (responsive srcset, fallback on error) easy.
 *
 * Use it instead of bare <img> for portfolio shots, avatars, blog covers, etc.
 * For decorative images pass `alt=""`; for content images always supply alt.
 */
export default function Image({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  srcSet,
  loading = 'lazy',
  fetchPriority,
  onError,
  ...rest
}) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchpriority={fetchPriority}
      sizes={sizes}
      srcSet={srcSet}
      className={className}
      onError={onError}
      {...rest}
    />
  );
}
