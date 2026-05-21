// Client-side guards mirroring the backend MeaningfulText rule. They block the
// obvious junk (too short, single repeated char, symbols-only, keyboard mashing)
// while letting any genuine text through. Return an Arabic error string, or null
// if the value is acceptable.

const hasRealLetters = (t) => /[؀-ۿA-Za-z]/.test(t);
const isSingleRepeatedChar = (t) => new Set(t.replace(/\s+/g, '')).size <= 1;
const hasLongRun = (t) => /(.)\1{3,}/u.test(t); // 4+ same char in a row

export function validateMeaningfulText(value, { minLength = 3, requireMultipleWords = false } = {}) {
  const text = (value || '').trim();
  if (text.length < minLength) return `النص قصير جداً (الحد الأدنى ${minLength} حروف).`;
  if (!hasRealLetters(text)) return 'اكتب نصاً واضحاً يحتوي على حروف.';
  if (isSingleRepeatedChar(text)) return 'النص يبدو غير صحيح، اكتب وصفاً حقيقياً.';
  if (hasLongRun(text)) return 'النص يحتوي على حروف مكررة بشكل غير طبيعي.';
  if (requireMultipleWords && text.split(/\s+/).filter(Boolean).length < 2) {
    return 'اكتب عنواناً وصفياً (أكثر من كلمة).';
  }
  return null;
}

export const validateProjectTitle = (v) => validateMeaningfulText(v, { minLength: 3, requireMultipleWords: true });
export const validateProjectDescription = (v) => validateMeaningfulText(v, { minLength: 15 });
