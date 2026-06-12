# errenn.com - Umut Eren Kaplan | Portfolio & Admin Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**errenn.com**, Bilgisayar Mühendisi, Mobil Uygulama ve Oyun Geliştiricisi **Umut Eren Kaplan**'ın kişisel portföy web sitesi ve yönetim panelidir. Next.js (App Router), TypeScript, TailwindCSS ve Firebase kullanılarak modern, performanslı ve çift dilli (TR/EN) olarak geliştirilmiştir.

---

## 🇹🇷 Türkçe Proje Detayları

### 🚀 Özellikler

- **Dinamik Çift Dil Desteği (i18n):** Alt dizin yönlendirmesi (`/tr` ve `/en`) ile tamamen yerelleştirilmiş içerik.
- **Firebase Entegrasyonu:**
  - **Firebase Auth:** Güvenli admin girişi.
  - **Firestore Database:** Ziyaret sayıları (views), iletişim mesajları ve portföy verileri.
  - **Firebase Storage:** Özgeçmiş (CV) ve görsel yüklemeleri.
- **Yönetim Paneli (Admin Dashboard):** Şifre korumalı özel bir arayüz üzerinden portföy projelerini yönetme, gelen mesajları görüntüleme ve site istatistiklerini izleme.
- **Telegram Entegrasyonu (Webhook):** İletişim formundan yeni bir mesaj gönderildiğinde, Telegram Bot API aracılığıyla geliştiriciye anlık bildirim iletilmesi.
- **Modern Arayüz:** Akıcı animasyonlar, karanlık mod uyumu, glassmorphism efektleri ve responsive (mobil uyumlu) yapı.

---

## 🇬🇧 English Project Details

### 🚀 Features

- **Dynamic Bilingual Support (i18n):** Subpath routing (`/tr` and `/en`) using unified localization files.
- **Firebase Integration:**
  - **Firebase Auth:** Secure administration login.
  - **Firestore Database:** Stores view statistics, contact forms, and portfolio metadata.
  - **Firebase Storage:** Uploads CV documentations and project galleries.
- **Admin Dashboard:** Password-protected portal to manage projects, view inquiries, and track website analytics.
- **Telegram Webhook Notification:** Sends instant alerts to the developer's Telegram account when a new contact message is received.
- **Modern UI/UX:** Smooth transitions, dark-mode compatibility, glassmorphism designs, and full responsiveness.

---

## 📂 Proje Yapısı / Project Structure

```text
errenn.com/
  src/
    app/                   # App Router & API Endpoints
      (en)/                # English localization pages
      (tr)/                # Turkish localization pages
      admin/               # Private dashboard interface
      api/                 # Backend endpoints (Telegram, Auth, Upload, Views)
    components/            # Modular UI components (Hero, Contact, Projects, Spotlight)
    i18n/                  # Localization JSON files and translation logic
    layouts/               # Layout models (BoxLayout, MainLayout, SectionLayout)
    lib/                   # Utility wrappers, firebase config, and fetch helpers
```

---

## 🛠️ Teknolojiler / Technologies

- **Frontend:** Next.js (App Router), React, TypeScript, TailwindCSS, Lucide React
- **Backend / Bağımlılıklar:** Next.js Route Handlers (API), Firebase Client & Admin SDK, Telegram Bot API
- **Barındırma / Hosting:** Vercel / Firebase Hosting

---

## 📦 Kurulum ve Çalıştırma / Setup & Local Development

### 1. Bağımlılıkları Yükleyin / Install Dependencies
```bash
npm install
```

### 2. Çevre Değişkenleri / Environment Variables
Kök dizinde `.env.local` dosyası oluşturun ve aşağıdaki anahtarları kendi projenize göre doldurun:
Create an `.env.local` file at the root and fill in your credential configurations:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Telegram Webhook Credentials
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Geliştirme Sunucusunu Başlatın / Run Development Server
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresinden portföyü test edebilirsiniz.
You can view the project in your browser at `http://localhost:3000`.
