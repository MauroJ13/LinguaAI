import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import type { CorrectionAnalysis } from '../../../types';
import { diffWords, type DiffToken } from '../../../utils/diffWords';

function Tokens({ tokens, variant }: { tokens: DiffToken[]; variant: 'wrong' | 'right' }) {
  return (
    <>
      {tokens.map((tok, i) =>
        tok.changed ? (
          <mark key={i} className={`panel__mark panel__mark--${variant}`}>
            {tok.text}
          </mark>
        ) : (
          <span key={i}>{tok.text}</span>
        ),
      )}
    </>
  );
}

export function CorrectionPanel({ content, rtl }: { content: CorrectionAnalysis; rtl?: boolean }) {
  const { t } = useI18n();
  const diff = useMemo(() => diffWords(content.original, content.corrected), [content.original, content.corrected]);
  const dir = rtl ? 'rtl' : 'auto';

  return (
    <div className="panel">
      <h2 className="panel__title">
        <span aria-hidden="true">✍️</span> {t('correction')}
      </h2>

      <div className="compare">
        <div className="compare__row compare__row--wrong">
          <span className="compare__icon" aria-label={t('wrong')}>
            ❌
          </span>
          <p dir={dir}>
            <Tokens tokens={diff.before} variant="wrong" />
          </p>
        </div>
        <div className="compare__row compare__row--right">
          <span className="compare__icon" aria-label={t('right')}>
            ✅
          </span>
          <p dir={dir}>
            <Tokens tokens={diff.after} variant="right" />
          </p>
        </div>
      </div>

      {content.reasons.length > 0 && (
        <div className="panel__section">
          <span className="panel__label">{t('why')}</span>
          {content.reasons.map((r, i) => (
            <div className="reason" key={`${r.title}-${i}`}>
              {r.title && <h3 className="reason__title">{r.title}</h3>}
              {r.text && <p className="reason__text">{r.text}</p>}
              {r.hint && <p className="reason__hint">{r.hint}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
