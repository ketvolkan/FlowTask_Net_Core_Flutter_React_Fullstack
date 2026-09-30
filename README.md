# FlowTask — Multi-Tenant Enterprise Task & Workflow Management Platform

<p align="center">
  <img src="docs/screenshots/web/Screenshot%202026-09-29%20185813.png" width="850" alt="FlowTask Hero Banner" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <strong>Modern, ölçeklenebilir ve kurumsal seviyede çok kiracılı (multi-tenant) proje ve görev yönetim sistemi.</strong><br/>
  .NET 8 Clean Architecture backend, React 18 + TypeScript web paneli ve Flutter mobil uygulamasını tek bir monorepo yapısında buluşturur.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt=".NET 8" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Flutter-3.x-02569B?style=flat-square&logo=flutter&logoColor=white" alt="Flutter" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/SignalR-Realtime-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="SignalR" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Architecture-Clean%20%2F%20CQRS-10B981?style=flat-square" alt="Clean Architecture" />
</p>

---

## 📑 İçindekiler
1. [Proje Hakkında](#-proje-hakkında)
2. [Ekran Görüntüleri Galerisi](#-ekran-görüntüleri-galerisi)
   - [Web Uygulaması](#web-uygulaması-react-18--typescript)
   - [Mobil Uygulama](#mobil-uygulama-flutter)
3. [Mimariler ve Kullanılan Teknolojiler](#-mimariler-ve-kullanılan-teknolojiler)
   - [Backend (.NET 8 Clean Architecture)](#backend-api--servis-katmanı)
   - [Frontend (React 18 & TypeScript)](#frontend-web-uygulaması)
   - [Mobile (Flutter & BLoC)](#mobile-mobil-uygulama)
4. [Monorepo Proje Yapısı](#-monorepo-proje-yapısı)
5. [Temel Fonksiyonel Özellikler](#-temel-fonksiyonel-özellikler)
6. [Kurulum ve Çalıştırma Rehberi](#-kurulum-ve-çalıştırma-rehberi)
   - [Ön Koşullar](#ön-koşullar)
   - [1. Veritabanı ve Redis (Docker)](#1-veritabanı-ve-redis-docker)
   - [2. Backend Çalıştırma](#2-backend-çalıştırma)
   - [3. Frontend Web Çalıştırma](#3-frontend-web-çalıştırma)
   - [4. Mobil Uygulama Çalıştırma](#4-mobil-uygulama-çalıştırma)
7. [API Uç Noktaları ve Swagger](#-api-uç-noktaları-ve-swagger)
8. [Demo Kullanıcı Hesapları](#-demo-kullanıcı-hesapları)

---

## 🎯 Proje Hakkında

**FlowTask**, ekiplerin projelerini, görevlerini ve iş akışlarını kolayca takip edebilmesi için geliştirilmiş bir proje yönetim platformudur.

* **Şirket ve Departman Yönetimi:** Her şirket kendi projelerini, ekiplerini ve departmanlarını ayrı alanlarda yönetir.
* **Otomatik Görev Kodları:** Her göreve projesine özel benzersiz bir kod atanır (`FLOW-1`, `FLOW-2`, `INNO-5`).
* **Canlı Durum Güncellemesi:** Panodaki sürükle-bırak hareketleri, durum değişiklikleri ve yorumlar anında ekrana yansır.
* **Modern Açık Tema:** Gözü yormayan, sade ve net bir arayüz deneyimi sunar.

---

## 📸 Ekran Görüntüleri Galerisi

### Web Uygulaması (React 18 + TypeScript)

| **Sürükle-Bırak Kanban Pano** | **Dashboard & Yönetici Kontrol Paneli** |
|:---:|:---:|
| <img src="docs/screenshots/web/Screenshot%202026-09-29%20185813.png" width="450" alt="Kanban Board" /> | <img src="docs/screenshots/web/Screenshot%202026-09-29%20185858.png" width="450" alt="Dashboard" /> |
| *4 sütunlu sürükle-bırak görev akış panosu* | *Proje durumları, ekip performansı ve görev dağılımı* |

| **Sprint & Backlog Filtreleme** | **Ekip & Aktif Kullanıcılar Panosu** |
|:---:|:---:|
| <img src="docs/screenshots/web/Screenshot%202026-09-29%20185840.png" width="450" alt="Sprint Selection" /> | <img src="docs/screenshots/web/Screenshot%202026-09-29%20185804.png" width="450" alt="Team Board" /> |
| *Sprint ve backlog bazlı anlık tahta filtreleme* | *Kullanıcı bazlı iş yükü ve görev dağılımı* |

| **Detaylı Görev & Aktivite Modalı** | **Yeni Görev Oluşturma Formu** |
|:---:|:---:|
| <img src="docs/screenshots/web/Screenshot%202026-09-29%20190006.png" width="450" alt="Task Modal" /> | <img src="docs/screenshots/web/Screenshot%202026-09-29%20190047.png" width="450" alt="Create Task" /> |
| *Yorumlar, dosya ekleri ve görev detayları* | *Görev tipi, öncelik ve atanan kişi seçimi* |

| **Global Arama & Command Palette** | **Önemli Sistem Bildirimi / Acil Uyarı** |
|:---:|:---:|
| <img src="docs/screenshots/web/Screenshot%202026-09-29%20185947.png" width="450" alt="Search" /> | <img src="docs/screenshots/web/Screenshot%202026-09-29%20185734.png" width="450" alt="Notification Modal" /> |
| *Görev ve projeler için hızlı arama menüsü* | *Kritik duyurular ve sistem bildirimleri* |

---

### Mobil Uygulama (Flutter)

<p align="center">
  <img src="docs/screenshots/mobile/Screenshot_1790780284.png" width="230" alt="Mobil Dashboard" style="margin: 6px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
  <img src="docs/screenshots/mobile/Screenshot_1790780383.png" width="230" alt="Mobil Pano" style="margin: 6px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
  <img src="docs/screenshots/mobile/Screenshot_1790780386.png" width="230" alt="Mobil Görev Detay" style="margin: 6px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
</p>
<p align="center">
  <img src="docs/screenshots/mobile/Screenshot_1790780993.png" width="230" alt="Mobil Profil" style="margin: 6px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
  <img src="docs/screenshots/mobile/Screenshot_1790781096.png" width="230" alt="Mobil Modal Proje Seçici" style="margin: 6px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
</p>

* **Anasayfa & Özet:** Görev tamamlama oranı, durum kartları ve son görevler listesi.
* **Görevler Panosu:** Yapılacak, Devam Eden, İncelemede ve Tamamlandı filtreleme ızgarası.
* **Proje Seçici:** Projeler ve tüm şirket görevleri arasında tek dokunuşla hızlı geçiş.
* **Çift Dil Desteği:** Türkçe ve İngilizce dil seçeneği.

---

## 🏗 Mimariler ve Kullanılan Teknolojiler

```mermaid
flowchart TD
    subgraph Clients["İstemci Katmanı"]
        WebClient["React 18 + Vite SPA\n(TypeScript, Tailwind CSS, Zustand)"]
        MobileClient["Flutter Mobil App\n(BLoC, Dio, Clean Arch)"]
    end

    subgraph Gateway["API & İletişim"]
        REST["ASP.NET Core 8 Web API\n(Controllers, Swagger, JWT Auth)"]
        SignalRHub["SignalR Realtime Hub\n(/hubs/board)"]
    end

    subgraph CoreBackend["Application & Domain (Clean Architecture)"]
        MediatR["MediatR CQRS Pipeline\n(Commands & Queries)"]
        Validation["FluentValidation Behaviors"]
        Domain["Domain Entities & Business Rules\n(Projects, Issues, Sprints, Comments)"]
    end

    subgraph Persistence["Veri & Önbellek Katmanı"]
        EFCore["Entity Framework Core 8\n(Repository Pattern & Migrations)"]
        Postgres[(PostgreSQL 16\nRelational DB)]
        RedisCache[(Redis\nDistributed Cache)]
    end

    WebClient -->|REST API / HTTPS| REST
    WebClient -->|WebSockets / SignalR| SignalRHub
    MobileClient -->|REST API / HTTPS| REST

    REST --> MediatR
    SignalRHub --> MediatR
    MediatR --> Validation
    Validation --> Domain
    Domain --> EFCore
    EFCore --> Postgres
    MediatR --> RedisCache
```

---

### Backend (API & Servis Katmanı)
* **Framework:** .NET 8 (C# 12) Web API
* **Mimari:** Clean Architecture (Domain, Application, Infrastructure, Presentation) + **CQRS (Command Query Responsibility Segregation)**
* **Orchestration / Mediator:** `MediatR` ile ayrıştırılmış Command/Query işleyicileri
* **Doğrulama:** `FluentValidation` + Validation Pipeline Behaviors
* **Veritabanı & ORM:** `PostgreSQL 16` + `Entity Framework Core 8` (Code-First Migrations, Fluent API Configuration)
* **Önbellekleme:** `Redis` (Distributed Cache & Lock Manager)
* **Gerçek Zamanlı İletişim:** `Microsoft.AspNetCore.SignalR`
* **Güvenlik & Kimlik Doğrulama:** `JWT Bearer Token`, Argon2/BCrypt parola güvenliği, Claims-based multi-tenancy çözümleyici middleware
* **Dökümantasyon:** Swagger / OpenAPI UI + JWT Authorization entegrasyonu

---

### Frontend (Web Uygulaması)
* **Kütüphane & Runtime:** React 18, TypeScript, Vite
* **Stil & Tasarım:** Tailwind CSS, PostCSS, Lucide Icons, Headless UI
* **Durum Yönetimi:** `Zustand` (Global Auth, Proje, Tema ve Modal state store'ları)
* **Veri Yönetimi & Caching:** `@tanstack/react-query` v5 (Optimistic UI updates, automatic cache invalidation)
* **Sürükle-Bırak (DnD):** `@hello-pangea/dnd` ile akıcı Kanban kart taşıma ve sütun sıralama
* **Gerçek Zamanlı İstemci:** `@microsoft/signalr` istemci entegrasyonu
* **Grafik & Analitik:** `Recharts` (Haftalık görev tamamlama eğrileri, sprint hız grafikleri)
* **Router:** `React Router DOM` v6 (Korumalı rotalar, rol denetimli sayfalar)

---

### Mobile (Mobil Uygulama)
* **SDK & Dil:** Flutter 3.x, Dart 3.x
* **Mimari:** Feature-based Clean Architecture (Domain, Data, Presentation)
* **State Management:** `flutter_bloc` (BLoC Pattern & Cubit) + `equatable`
* **Network & HTTP:** `Dio` (JWT Interceptors, Token Injection, Response Parsing, Error Handling)
* **Tasarım & Responsive Motoru:** `ResponsiveContext` extension'ı, `AppDimensions` ve `AppColors` token tabanlı tasarım mimarisi
* **Yerelleştirme (i18n):** `AppTranslations` motoru (TR / EN tam dil anahtarı desteği)
* **Platform Uyumluluğu:** Android & iOS native derleme

---

## 📂 Monorepo Proje Yapısı

```text
FlowTask_Net_Core_Flutter_React_Fullstack/
├── backend/
│   ├── src/
│   │   ├── FlowTask.Domain/              # Varlıklar (Entities), Enums, Domain Exceptions
│   │   ├── FlowTask.Application/         # CQRS Commands & Queries, DTOs, Use Cases, Interfaces
│   │   ├── FlowTask.Infrastructure/      # EF Core DbContext, PostgreSQL Repositories, Redis, SignalR
│   │   └── FlowTask.Api/                 # Controllers, Middlewares, Hubs, Dependency Injection
│   ├── FlowTask.sln                      # .NET Solution dosyası
│   └── Dockerfile                        # Backend container konfigürasyonu
├── frontend/
│   ├── src/
│   │   ├── api/                          # Axios API istemcisi ve SignalR servisleri
│   │   ├── components/                   # Kanban Board, Modallar, Kartlar, Navigasyon bileşenleri
│   │   ├── pages/                        # Dashboard, Projects, Board, Backlog, Settings sayfaları
│   │   ├── store/                        # Zustand Store'ları (authStore, projectStore vb.)
│   │   └── types/                        # TypeScript domain ve DTO modelleri
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── mobile/
│   ├── lib/
│   │   ├── core/                         # Renkler (AppColors), Boyutlar (AppDimensions), Enums, i18n
│   │   ├── data/                         # Remote Data Sources, DTO Modelleri, Repository Impls
│   │   ├── domain/                       # Use Cases, Entities, Repository Sözleşmeleri
│   │   └── presentation/                 # BLoC state'leri, Sayfalar (Dashboard, Board, Profile), Widgetlar
│   └── pubspec.yaml
├── docs/
│   └── screenshots/                      # Web ve Mobil ekran görüntüleri
├── docker-compose.yml                    # PostgreSQL ve Redis servisleri
└── README.md                             # Kapsamlı proje dökümantasyonu
```

---

## ⚡ Temel Fonksiyonel Özellikler

1. **Çoklu Şirket & Departman Seçimi (Multi-Tenancy):**
   - Kullanıcılar bağlı oldukları şirket ve departman sınırları içinde çalışır.
   - Şirket yetkilileri yeni proje oluşturabilir, üye atayabilir ve rol yetkilendirmesi yapabilir.

2. **Dinamik Proje Anahtarı (Issue Key Generator):**
   - Her proje kendine has 2-5 karakterlik bir anahtar (`FLOW`, `INNO`, `DATA` vb.) tanımlar.
   - Her yeni görev, projenin mevcut en yüksek ID'sini referans alarak atomik olarak numaralandırılır (`FLOW-1`, `FLOW-2`).

3. **Kanban & Görev Akış Yönetimi:**
   - Görev Durumları: `Yapılacak (To Do)`, `Devam Ediyor (In Progress)`, `İncelemede (In Review)`, `Tamamlandı (Done)`.
   - Öncelik Kademeleri: `Düşük (Low)`, `Orta (Medium)`, `Yüksek (High)`, `Acil (Urgent)`.
   - Görev Tipleri: `Görev (Task)`, `Hata (Bug)`, `Kullanıcı Hikayesi (Story)`, `Büyük İş (Epic)`.

4. **Gerçek Zamanlı Yorum ve Aktivite Takibi:**
   - Görevlerin altına ekip içi yorumlar eklenebilir, görevin durum değişiklik geçmişi tarih sırasıyla izlenebilir.

---

## 🚀 Kurulum ve Çalıştırma Rehberi

### Ön Koşullar
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js (v18+) ve npm](https://nodejs.org/)
* [Flutter SDK (v3.19+)](https://flutter.dev/docs/get-started/install)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL & Redis için)

---

### 1. Veritabanı ve Redis (Docker)
Projenin kök dizininde yer alan `docker-compose.yml` ile PostgreSQL ve Redis servislerini başlatın:

```bash
docker-compose up -d
```

> **Varsayılan Bağlantı Bilgileri:**
> * PostgreSQL Port: `5432` | DB: `flowtask_db` | User: `postgres` | Password: `password123`
> * Redis Port: `6379`

---

### 2. Backend Çalıştırma

```bash
cd backend/src/FlowTask.Api

# Paketleri geri yükleyin
dotnet restore

# Veritabanı migration'larını uygulayın (Otomatik seed devreye girer)
dotnet ef database update --project ../FlowTask.Infrastructure

# API'yi başlatın
dotnet run
```

Backend API **`http://localhost:5000`** veya **`https://localhost:7001`** adresinde ayağa kalkacaktır.
* **Swagger UI:** `http://localhost:5000/swagger`

---

### 3. Frontend Web Çalıştırma

```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev
```

Web uygulaması **`http://localhost:5173`** adresinde açılacaktır.

---

### 4. Mobil Uygulama Çalıştırma

```bash
cd mobile

# Paketleri çekin
flutter pub get

# Kod analizini kontrol edin (0 issue)
flutter analyze

# Cihaz veya emülatörde çalıştırın
flutter run
```

> **Not:** Android Emülatör kullanıyorsanız `ApiClient` base URL'i otomatik olarak `10.0.2.2:5000` adresine, iOS Simülatör veya Web için `localhost:5000` adresine bağlanacak şekilde ayarlanmıştır.

---

## 🔑 Demo Kullanıcı Hesapları

Test süreçleri için sistem açılışında aşağıdaki demo kullanıcılar hazır olarak gelmektedir:

| Rol | E-Posta | Şifre | Şirket | Departman |
|:---|:---|:---|:---|:---|
| **Şirket Yetkilisi** | `manager@techflow.com` | `Password123!` | TechFlow Inc. | Yönetim & Teknoloji |
| **Kıdemli Geliştirici** | `dev@techflow.com` | `Password123!` | TechFlow Inc. | Yazılım Geliştirme |
| **QA Mühendisi** | `qa@techflow.com` | `Password123!` | TechFlow Inc. | Kalite & Test |
| **Şirket Yetkilisi** | `manager@innosoft.com` | `Password123!` | InnoSoft Bilişim | Ürün Yönetimi |

*(Giriş ekranlarında bulunan **"Hızlı Demo Girişi"** butonlarına tıklayarak tek tıkla oturum açabilirsiniz.)*

---

## 📄 Lisans & Katkı
Bu proje kurumsal kullanım ve eğitim amacıyla açık kaynak mimari standartlarına uygun olarak geliştirilmiştir. Katkıda bulunmak için lütfen bir *Pull Request* açın veya bir *Issue* bildirin.
