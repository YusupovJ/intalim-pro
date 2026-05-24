"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { apiRegister } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { LOGIN_ERROR, LOGIN_RE, loginToEmail } from "@/lib/login";
import { migrateLocalToApi } from "@/lib/migrate";

export default function RegisterPage() {
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);

  return (
    <AuthForm
      title="Регистрация"
      subtitle="Создай аккаунт чтобы синхронизировать билеты и закладки"
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
          autoComplete: "new-password",
          minLength: 6,
        },
      ]}
      submitLabel="Зарегистрироваться"
      altLink={{ href: "/login", label: "Уже есть аккаунт? Войти" }}
      onSubmit={async (v) => {
        const login = v.login.trim();
        if (!LOGIN_RE.test(login)) throw new Error(LOGIN_ERROR);
        const res = await apiRegister({
          fullName: login,
          email: loginToEmail(login),
          password: v.password,
        });
        authLogin(res.token, res.data);
        await migrateLocalToApi(res.token, res.data.id);
        router.replace("/");
      }}
    />
  );
}
