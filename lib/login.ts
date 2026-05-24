// Mokky.dev auth требует поле `email`. Чтобы ввод выглядел как обычный логин,
// строим под капотом фиктивный email вида `<login>@intalim.local`. Пользователь
// этого никогда не видит — в UI остаётся только сам логин.

const LOGIN_EMAIL_DOMAIN = "@intalim.local";

export const LOGIN_RE = /^[a-zA-Z0-9_-]{3,}$/;
export const LOGIN_ERROR =
  "Логин: латиница, цифры, _ или - (минимум 3 символа)";

export function loginToEmail(login: string): string {
  return login.toLowerCase().trim() + LOGIN_EMAIL_DOMAIN;
}

export function emailToLogin(email: string | undefined | null): string {
  if (!email) return "";
  const idx = email.indexOf("@");
  return idx > 0 ? email.slice(0, idx) : email;
}
