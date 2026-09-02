# Frontend

repo นี่เป็น Frontend สำหรับระบบนัดหมายแพทย์ ใช้ Next.js โดยทั้งทีมจะใช้ repo frontend อันเดียวกัน แต่เชื่อมต่อกับหลาย backend service ที่แยก repo กัน:

- Authentication https://github.com/Doctor-Appointment-SA/Authentication-Service.git
- User Profile
- Appointment https://github.com/Doctor-Appointment-SA/Scheduling-Service.git
- Pharmacy
- Payment

# Tech Stack

Node.js (แนะนำ ≥ 18 LTS)
TypeScript ^5.7.3

# วิธีติดตั้ง

1. Clone Project
   git clone https://github.com/Doctor-Appointment-SA/Authentication-Service.git
   cd Authentication-Service

2. Dependency
   npm install

3. ตั้งค่า .env
   Environment Variables

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_URL=http://localhost:5001
NEXT_PUBLIC_PROFILE_URL=http://localhost:4002
NEXT_PUBLIC_APPOINTMENT_URL=http://localhost:4003
NEXT_PUBLIC_CARE_PHARMACY_URL=http://localhost:4004
NEXT_PUBLIC_PAYMENT_URL=http://localhost:4005
```

4. รันเซิร์ฟเวอร์ Development
   npm run dev

# Contribution

ทุกคนพัฒนา service ของตัวเอง **ทั้งหน้าบ้านและหลังบ้าน**

| ผู้พัฒนา | ส่วนที่รับผิดชอบ | Repository |
|---|---|---|
| **พสิษฐ์ พิศาลอัครเลิศกุล**<br>[@SwiftkeyX](https://github.com/SwiftkeyX) | Authentication, Payment | [Authentication-Service](https://github.com/Doctor-Appointment-SA/Authentication-Service) · [Payment-Service](https://github.com/Doctor-Appointment-SA/Payment-Service) |
| **มติ วรสิงห์**<br>[@gitrinz99](https://github.com/gitrinz99) | Profile (Doctor / Patient Homepage) | [svc-doctor-profile](https://github.com/Doctor-Appointment-SA/svc-doctor-profile) |
| **พัชรพล ธูปประสม**<br>[@PatcharapholTooprrasom](https://github.com/PatcharapholTooprrasom) | Appointment, Infrastructure | [Scheduling-Service](https://github.com/Doctor-Appointment-SA/Scheduling-Service) · [Infra](https://github.com/Doctor-Appointment-SA/Infra) |
| **กฤติน ชัยอุดมกิจ** | Pharmacy | [svc-pharmacy](https://github.com/Doctor-Appointment-SA/svc-pharmacy) |

# System Architecture

สถาปัตยกรรมที่ใช้คือ Service-based Architecture โดยแยก backend เป็น 5 บริการหลัก
และใช้ Next.js Frontend เป็น entry point เดียวสำหรับผู้ใช้งาน

- Frontend (Next.js): รับผิดชอบ UI/UX
- Authentication Service: จัดการยืนยันตัวตน login, register
- User Profile Service: เก็บข้อมูลผู้ป่วย/แพทย์
- Appointment Service: ระบบนัดหมายแพทย์
- Pharmacy Service: จัดการข้อมูลยา/การสั่งจ่ายยา
- Payment Service: การชำระเงิน

# Demo video

https://youtu.be/CeILyEaHyrs
