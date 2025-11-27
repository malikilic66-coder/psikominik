# 🚀 Deployment Kılavuzu - Psikominik.com

## 📋 Genel Bakış

Bu proje GitHub Actions ile otomatik olarak GitHub Pages'e deploy edilecek şekilde yapılandırılmıştır.

## ⚙️ Yapılandırma Adımları

### 1. GitHub Repository Ayarları

#### GitHub Pages Aktivasyonu
1. Repository sayfanıza gidin
2. **Settings** → **Pages** bölümüne tıklayın
3. **Source** olarak **GitHub Actions** seçin

#### GitHub Secrets Ekleme
1. Repository sayfanıza gidin
2. **Settings** → **Secrets and variables** → **Actions** bölümüne tıklayın
3. **New repository secret** butonuna tıklayın
4. Secret ekleyin:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Gemini API anahtarınız
   - API Key almak için: https://aistudio.google.com/apikey

### 2. Workflow Özellikleri

#### Tetikleyiciler
- ✅ `main` branch'e push olduğunda otomatik çalışır
- ✅ Manuel olarak tetiklenebilir (workflow_dispatch)

#### Pipeline Aşamaları

**Build Job:**
- Node.js 20 kurulumu
- Bağımlılıkların yüklenmesi (`npm ci`)
- Production build oluşturma
- Build artifact'lerinin yüklenmesi

**Deploy Job:**
- Build başarılı olduktan sonra çalışır
- GitHub Pages'e otomatik deployment
- Deploy URL'i çıktı olarak verilir

### 3. Vite Yapılandırması

#### Önemli Ayarlar
```typescript
base: '/psikominik/'  // GitHub Pages base URL
```

#### Build Optimizasyonları
- Terser minification
- Code splitting (React, Router, Charts)
- Asset optimization
- Source map kapatıldı (production)

### 4. Environment Variables

#### Lokal Geliştirme
1. `.env.example` dosyasını kopyalayın:
   ```bash
   cp .env.example .env.local
   ```
2. `.env.local` dosyasına API key'inizi ekleyin:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### Production (GitHub Actions)
- Environment variables GitHub Secrets üzerinden yönetilir
- `GEMINI_API_KEY` secret olarak tanımlanmalıdır

## 🚀 Deployment Süreci

### Manuel Deploy

```bash
# Değişiklikleri commit edin
git add .
git commit -m "Deploy: site güncellemeleri"

# Main branch'e push edin
git push origin main
```

Workflow otomatik olarak tetiklenecek ve site deploy edilecektir.

### Workflow Durumunu İzleme

1. Repository **Actions** sekmesine gidin
2. En son workflow çalıştırmasını seçin
3. Build ve Deploy adımlarını izleyin
4. Deploy URL'i deployment job çıktısında görünür

## 📱 Site Erişimi

Deploy başarılı olduktan sonra site şu adreste yayında olacak:
```
https://malikilic66-coder.github.io/psikominik/
```

## 🔍 Sorun Giderme

### Build Hataları
- `npm ci` hatası: `package-lock.json` dosyasını kontrol edin
- TypeScript hataları: `tsc --noEmit` ile kontrol edin
- Environment variable eksik: GitHub Secrets'ı kontrol edin

### Deploy Hataları
- Pages ayarları: Repository Settings → Pages kontrol edin
- Permissions: Workflow permissions'ları kontrol edin
- Branch: `main` branch'e push yaptığınızdan emin olun

### Cache Problemleri
Tarayıcı cache'i nedeniyle değişiklikler görünmüyorsa:
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) veya `Cmd+Shift+R` (Mac)
- Cache'i temizleyin ve hard reload yapın

## 📊 Monitoring

### Build Süreleri
- Ortalama build süresi: ~2-3 dakika
- Deploy süresi: ~1 dakika

### Optimizasyon İpuçları
- Büyük bağımlılıkları lazy load edin
- Image'leri optimize edin
- Code splitting kullanın (mevcut yapılandırmada aktif)

## 🛠️ Geliştirme Komutları

```bash
# Lokal development server
npm run dev

# Production build (lokal test)
npm run build

# Build önizleme
npm run preview
```

## 📝 Notlar

- Her `main` branch'e push işlemi otomatik deploy tetikler
- Staging ortamı için farklı bir branch kullanabilirsiniz
- Environment variables asla commit edilmemelidir
- `.env.local` dosyası `.gitignore`'da bulunmaktadır

## 🔐 Güvenlik

- API keys asla kod içinde saklanmamalıdır
- GitHub Secrets kullanılmalıdır
- `.env` dosyaları `.gitignore`'a eklenmelidir
- Production build'lerde source map'ler kapatılmalıdır

## 📚 Kaynaklar

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Gemini API Documentation](https://ai.google.dev/docs)
