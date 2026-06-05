// Функция для валидации slug опроса
export function validateSlug(slug: string) {
  return /^[a-zA-Z0-9]{8}$/.test(slug);
}
