export const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  const limitedNumbers = numbers.slice(0, 11);

  if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  }
  if (limitedNumbers.length <= 3) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  }
  if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3)}`;
  }
  return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
};
