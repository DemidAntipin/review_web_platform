import clsx from 'clsx';
import s from './loader.module.scss';

interface LoaderProps {
  withLabel?: boolean;
  className?: string;
  noWrapper?: boolean;
  size?: number;
}

export const Loader = ({ withLabel = false, className, noWrapper = false, size }: LoaderProps) => {
  const style = size ? { '--loader-size': `${size}px` } as React.CSSProperties : {};

  const content = (
    <div className={s.loaderBox}>
      <span className={s.loader} style={style} />
      {withLabel && <span className={s.label}>Загрузка данных...</span>}
    </div>
  );

  if (noWrapper) return content;

  return (
    <div className={clsx(s.wrapper, className)}>
      {content}
    </div>
  );
};