# PocketFlow 💰
Ứng dụng quản lý chi tiêu cá nhân — React Native + TypeScript

---

## Yêu cầu cài đặt

### 1. Node.js
- Tải tại: https://nodejs.org
- Chọn phiên bản **LTS (18 trở lên)**
- Cài xong kiểm tra bằng lệnh:
```bash
node --version
```

---

### 2. JDK 17
- Tải tại: https://adoptium.net
- Chọn **Temurin 17 (LTS)**
- Cài xong kiểm tra bằng lệnh:
```bash
java --version
```

---

### 3. Android Studio
- Tải tại: https://developer.android.com/studio
- Cài đặt bình thường, **tick chọn tất cả** các component được đề xuất
- Sau khi cài xong, mở Android Studio → **More Actions → SDK Manager**
- Đảm bảo đã cài **Android SDK Platform 34** và **Android SDK Build-Tools**

---

### 4. Tạo máy ảo Android (Emulator)

1. Mở Android Studio
2. Click **More Actions → Virtual Device Manager**
3. Click **Create Device**
4. Chọn **Pixel 7** → Next
5. Chọn hệ điều hành **Android 14 (API 34)** → Download nếu chưa có → Next
6. Click **Finish**

---

### 5. Cài đặt biến môi trường (Windows)

Tìm kiếm **"Environment Variables"** trong Start Menu → **Edit the system environment variables** → **Environment Variables**

Thêm vào **System variables**:

| Tên biến | Giá trị |
|---|---|
| `ANDROID_HOME` | `C:\Users\TênBạn\AppData\Local\Android\Sdk` |

Thêm vào **Path**:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

Kiểm tra bằng lệnh:
```bash
adb --version
```

---

## Chạy ứng dụng

### Bước 1: Cài dependencies

Mở Command Prompt, di chuyển vào thư mục project:
```bash
cd đường-dẫn-tới-thư-mục-PocketFlow
npm install
```

### Bước 2: Khởi động Emulator

Mở Android Studio → **Virtual Device Manager** → nhấn nút ▶️ cạnh thiết bị để khởi động

### Bước 3: Chạy app

```bash
npx react-native run-android
```

Lần đầu build mất khoảng **3-5 phút**. Khi thấy `BUILD SUCCESSFUL` là app sẽ tự mở trên emulator.

---

## Chạy lại lần sau

Lần sau không cần build lại từ đầu, chỉ cần:

1. Bật Emulator trong Android Studio
2. Chạy lệnh:
```bash
npx react-native run-android
```

---

## Lỗi thường gặp

**`adb: command not found`**
→ Chưa thêm biến môi trường, làm lại Bước 5 ở trên

**`SDK location not found`**
→ Vào thư mục `android/` trong project, tạo file `local.properties` với nội dung:
```
sdk.dir=C:\\Users\\TênBạn\\AppData\\Local\\Android\\Sdk
```

**`Metro bundler error`**
→ Mở terminal mới, chạy:
```bash
npx react-native start --reset-cache
```
Rồi chạy lại `npx react-native run-android` ở terminal khác