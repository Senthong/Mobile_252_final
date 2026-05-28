# 🚀 PocketFlow Backend — Hướng Dẫn Cài Đặt

## Yêu cầu
- Node.js >= 16
- PostgreSQL >= 13

---

## Bước 1 — Cài PostgreSQL

Tải và cài đặt tại: https://www.postgresql.org/download

> ⚠️ Nhớ lưu lại mật khẩu đặt cho user `postgres` — bạn sẽ cần dùng ở Bước 4.

---

## Bước 2 — Tạo database

Mở **pgAdmin** hoặc **psql terminal**, chạy lệnh sau:

```sql
CREATE DATABASE pocketflow;
```

---

## Bước 3 — Giải nén và cài dependencies

```bash
cd pocketflow-backend
npm install
```

---

## Bước 4 — Tạo file `.env`

Copy file `.env.example` thành `.env`, rồi điền vào các giá trị sau:

```env
DB_PASSWORD=mật_khẩu_postgres_của_bạn
JWT_SECRET=bất_kỳ_chuỗi_dài_nào_ví_dụ_abc123xyz789
```

> Các trường còn lại giữ nguyên mặc định là được.

---

## Bước 5 — Chạy migration (tạo bảng)

```bash
node src/db/migrate.js
```

✅ Thấy `"✅ Migration hoàn tất!"` là thành công.

---

## Bước 6 — Seed dữ liệu mặc định

```bash
node src/db/seed.js
```

✅ Thấy `"✅ Đã seed 8 categories mặc định"` là xong.

---

## Bước 7 — Khởi động server

```bash
npm run dev
```

✅ Thấy `"🚀 PocketFlow API chạy tại http://localhost:3000"` là backend đã sẵn sàng.

Kiểm tra nhanh bằng cách mở trình duyệt vào:

```
http://localhost:3000/health
```

Kết quả mong đợi: `{"status":"ok"}`

---

## Bước 8 — Kết nối app React Native

Mở file `src/services/api.ts` trong project PocketFlow, tìm dòng `API_BASE_URL` và đổi theo thiết bị:

| Thiết bị | URL |
|---|---|
| Android Emulator | `http://10.0.2.2:3000/api` *(giữ nguyên)* |
| iOS Simulator | `http://localhost:3000/api` |
| Điện thoại thật | `http://192.168.x.x:3000/api` *(IP máy trong mạng LAN)* |

> Xem IP máy tính: `ipconfig` trên Windows, `ifconfig` trên Mac/Linux.

---

## Bước 9 — Chạy app React Native

```bash
cd PocketFlow
npm install
npx react-native run-android   # hoặc run-ios
```

Sau khi đăng ký tài khoản, dữ liệu sẽ được lưu thật vào **PostgreSQL** — không còn dùng mock data nữa. 🎉
