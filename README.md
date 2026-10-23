# Zakiy AI — hamma kira oladigan sayt

Fayllar:
- index.html — sayt (Sublime Text'da tahrir qilasiz: nom, ranglar, matnlar)
- api/chat.js — server qismi (Anthropic API'ga ulanadi)

## 1. Anthropic API kalit olish
1. https://console.anthropic.com saytiga kiring va hisob oching.
2. "API Keys" bo'limida yangi kalit yarating va nusxalang (sk-ant-... bilan boshlanadi).
3. "Billing" bo'limida balansni to'ldiring. Har bir javob uchun pul ketadi.
Kalitni hech kimga bermang va index.html ichiga yozmang.

## 2. Vercel'ga joylash (bepul hosting)
1. https://github.com da hisob oching, yangi repository yarating va shu papkadagi fayllarni yuklang.
2. https://vercel.com da GitHub bilan kiring → "Add New → Project" → repository'ni tanlang → Deploy.
3. Loyiha sozlamalari → "Environment Variables" bo'limida qo'shing:
   Name: ANTHROPIC_API_KEY    Value: (nusxalagan kalitingiz)
4. "Deployments" bo'limida "Redeploy" qiling.
5. Vercel bergan manzil (masalan zakiy-ai.vercel.app) — hamma kira oladigan havola.

## Xarajatni nazorat qilish
- Anthropic Console'da oylik limit (spend limit) qo'ying.
- api/chat.js ichida bitta IP uchun oddiy cheklov bor (10 daqiqada 20 ta so'rov).
