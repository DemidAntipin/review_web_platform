import clsx from 'clsx';
import s from './loader.module.scss';

interface LoaderProps {
  withLabel?: boolean;
  className?: string;
}

export const Loader = ({ withLabel = false, className }: LoaderProps) => {
  return (
    <div className={clsx(s.wrapper, className)}>
      <div className={s.loaderBox}>
        <span className={s.loader} />
        {withLabel && <span className={s.label}>Загрузка данных...</span>}
      </div>
    </div>
  );
};