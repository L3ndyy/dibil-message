# Команды для деплоя на GitHub

Выполняйте в корне проекта (в папке `dibil message`) в терминале.

## 1. Проверить, что репозиторий есть

```bash
git status
```

Если видите список файлов и ветку (например, `main`) — репозиторий уже инициализирован, переходите к шагу 2.

Если пишет «not a git repository»:

```bash
git init
git branch -M main
```

## 2. Подключить удалённый репозиторий (один раз)

Если репозиторий **уже создан на GitHub** (например, `https://github.com/L3ndyy/dibil-message`):

```bash
git remote add origin https://github.com/L3ndyy/dibil-message.git
```

Замените `L3ndyy` на свой логин, `dibil-message` — на имя репозитория, если другое.

Проверить:

```bash
git remote -v
```

Должно показать `origin` и ваш URL.

## 3. Добавить все файлы и сделать коммит

```bash
git add -A
git status
git commit -m "Русский интерфейс, тестовые аккаунты в README, деплой на GitHub Pages"
```

Или короткий вариант коммита:

```bash
git commit -m "Deploy: русский UI + инструкция по тестовым аккаунтам"
```

## 4. Отправить код на GitHub

```bash
git push -u origin main
```

При первом `push` может попросить логин и пароль (или токен). Если используете 2FA — нужен **Personal Access Token** вместо пароля (GitHub → Settings → Developer settings → Personal access tokens).

---

## Одним блоком (копируй и вставляй)

Если репозиторий уже есть, remote уже добавлен и ты просто обновил код:

```bash
cd "c:\Users\nikik\OneDrive\Desktop\! my project\dibil message"
git add -A
git commit -m "Deploy: русский интерфейс и инструкция по тестовым аккаунтам"
git push -u origin main
```

Если подключаешь remote впервые (подставь свой URL):

```bash
cd "c:\Users\nikik\OneDrive\Desktop\! my project\dibil message"
git remote add origin https://github.com/L3ndyy/dibil-message.git
git add -A
git commit -m "Deploy: русский интерфейс и инструкция по тестовым аккаунтам"
git push -u origin main
```

---

## После push

1. Зайди в репозиторий на GitHub → **Settings** → **Pages**.
2. В **Source** выбери **GitHub Actions**.
3. В **Settings** → **Secrets and variables** → **Actions** добавь секреты:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Дождись завершения workflow **Deploy to GitHub Pages** (вкладка **Actions**).
5. Сайт откроется по адресу: **https://L3ndyy.github.io/dibil-message/**
