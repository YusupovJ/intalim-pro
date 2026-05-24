<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Перформанс

- `next dev` (Turbopack) **компилирует dynamic routes лениво** при первом заходе. Первый клик на `/ticket/N` для нового `N` может занять 5–15 секунд — это нормально для dev mode.
- Чтобы реально проверить перф (мгновенные переходы) — используй `npm run build && npm start`.
- `/questions.json` (1.9МБ) **никогда не уезжает на клиент**. `/ticket/[id]` — Server Component, читает JSON с диска через `lib/data-server.ts` (`React.cache` + `fs.readFile`) и шлёт клиенту только ~20 вопросов. `/bookmarks` — Client Component, но вопросы получает через Server Action `getQuestionsByIds` из `lib/actions.ts` (та же серверная функция, RPC). Не возвращай client-side `fetch('/questions.json')` или хук типа `useQuestions` — они удалены целенаправленно.
