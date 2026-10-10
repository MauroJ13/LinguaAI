import { LEVELS, levelIndex } from '../../data/levels';
import { useI18n } from '../../i18n';
import type { Level } from '../../types';
import './LevelSelector.scss';

interface LevelSelectorProps {
  value: Level;
  onChange: (level: Level) => void;
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  const { t } = useI18n();
  const index = levelIndex(value);

  return (
    <div className="level-selector">
      <div className="level-selector__track" role="radiogroup" aria-label={t('tabLevel')}>
        {LEVELS.map((level, i) => {
          const selected = level === value;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`level-chip${selected ? ' is-selected' : ''}${i <= index ? ' is-filled' : ''}`}
              onClick={() => onChange(level)}
            >
              <span className="level-chip__id">{level}</span>
              <span className="level-chip__title">{t(`level_${level}`)}</span>
              <span className="level-chip__bar" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="level-selector__description" key={value}>
        <strong>
          {value} · {t(`level_${value}`)}
        </strong>{' '}
        — {t(`levelDesc_${value}`)}
      </p>
    </div>
  );
}
