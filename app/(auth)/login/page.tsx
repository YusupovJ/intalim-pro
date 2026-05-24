"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { apiLogin } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { LOGIN_ERROR, LOGIN_RE, loginToEmail } from "@/lib/login";

export default function LoginPage() {
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);

  return (
    <AuthForm
      title="Вход"
      subtitle="Войди чтобы синхронизировать билеты и закладки"
      fields={[
        {
          name: "login",
          label: "Логин",
          type: "text",
          autoComplete: "username",
          minLength: 3,
        },
        {
          name: "password",
          label: "Пароль",
          type: "password",
          autoComplete: "current-password",
          minLength: 6,
        },
      ]}
      submitLabel="Войти"
      altLink={{ href: "/register", label: "Нет аккаунта? Зарегистрироваться" }}
      onSubmit={async (v) => {
        const login = v.login.trim();
        if (!LOGIN_RE.test(login)) throw new Error(LOGIN_ERROR);
        const res = await apiLogin({
          email: loginToEmail(login),
          password: v.password,
        });
        authLogin(res.token, res.data);
        router.replace("/");
      }}
    />
  );
}
