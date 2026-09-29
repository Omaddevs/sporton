@echo off
chcp 65001 >nul
title SportON - ishga tushirish
cd /d "%~dp0"

echo.
echo  ===============================================
echo            SportON - ishga tushirilmoqda
echo  ===============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [XATO] Node.js o'rnatilmagan!
  echo.
  echo  1. https://nodejs.org saytiga kiring
  echo  2. "LTS" versiyasini yuklab o'rnating
  echo  3. Kompyuterni qayta yoqing va START.bat ni qayta bosing
  echo.
  start https://nodejs.org
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do echo  Node.js: %%v
echo.

rem ---------- 1. JSX ga o'tkazish (bir marta, kod o'zgarmaydi - faqat kengaytma) ----------
echo  [1/3] Komponentlar .jsx formatiga o'tkazilmoqda...
call :tojsx "App.js"
call :tojsx "src\context\AppContext.js"
call :tojsx "src\navigation\RootNavigator.js"
for %%f in (src\components\*.js) do if /i "%%~xf"==".js" call :tojsx "%%f"
for %%f in (src\screens\*.js) do if /i "%%~xf"==".js" call :tojsx "%%f"
echo.

rem ---------- 2. Paketlar ----------
echo  [2/3] Paketlar tekshirilmoqda / o'rnatilmoqda... ^(birinchi marta 2-5 daqiqa^)
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo  [XATO] npm install muvaffaqiyatsiz. Yuqoridagi xato matnini Claude'ga yuboring.
  pause
  exit /b 1
)
echo.

rem ---------- 3. Server ----------
echo  [3/3] Server ishga tushmoqda: http://localhost:8081
echo  Brauzer o'zi ochiladi. BU OYNANI YOPMANG - yopsangiz sayt to'xtaydi.
echo.
call npx expo start --web --port 8081 --clear

echo.
echo  Server to'xtadi. Xato bo'lsa, yuqoridagi matnni Claude'ga yuboring.
pause
exit /b 0

:tojsx
if exist "%~dpn1.jsx" (
  if exist "%~1" del "%~1"
) else (
  if exist "%~1" (
    ren "%~1" "%~n1.jsx"
    echo     %~1  -^>  %~n1.jsx
  )
)
exit /b 0
