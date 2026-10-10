export interface DiffToken {
  text: string;
  changed: boolean;
}

/** Einfacher Wort-Diff (LCS), um geänderte Wörter in der Korrektur hervorzuheben. */
export function diffWords(a: string, b: string): { before: DiffToken[]; after: DiffToken[] } {
  const A = a.split(/(\s+)/);
  const B = b.split(/(\s+)/);
  const norm = (s: string) => s.toLowerCase();

  const dp: number[][] = Array.from({ length: A.length + 1 }, () => new Array<number>(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) {
    for (let j = B.length - 1; j >= 0; j--) {
      dp[i][j] = norm(A[i]) === norm(B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const before: DiffToken[] = [];
  const after: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (norm(A[i]) === norm(B[j])) {
      before.push({ text: A[i], changed: false });
      after.push({ text: B[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      before.push({ text: A[i], changed: !/^\s+$/.test(A[i]) });
      i++;
    } else {
      after.push({ text: B[j], changed: !/^\s+$/.test(B[j]) });
      j++;
    }
  }
  while (i < A.length) before.push({ text: A[i], changed: !/^\s+$/.test(A[i++]) });
  while (j < B.length) after.push({ text: B[j], changed: !/^\s+$/.test(B[j++]) });
  return { before, after };
}
