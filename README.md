# Frontend
repo นี่เป็น Frontend สำหรับระบบนัดหมายแพทย์ ใช้ Next.js โดยทั้งทีมจะใช้ repo frontend อันเดียวกัน แต่เชื่อมต่อกับหลาย backend service ที่แยก repo กัน:
Authentication
๊User Profile
Appointment
Pharmacy
Payment

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
🔐 Environment Variables
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_URL=http://localhost:4001
NEXT_PUBLIC_PROFILE_URL=http://localhost:4002
NEXT_PUBLIC_APPOINTMENT_URL=http://localhost:4003
NEXT_PUBLIC_CARE_PHARMACY_URL=http://localhost:4004
NEXT_PUBLIC_PAYMENT_URL=http://localhost:4005

4. รันเซิร์ฟเวอร์ Development
npm run dev

# Contribution
1. พสิษฐ์ พิศาลอัครเลิศกุล       https://github.com/Doctor-Appointment-SA/Authentication-Service.git
                            ทำ Service การทำ Authentication ทั้งหน้าบ้านหลังบ้าน
2. มติ วรสิงห์                 

3. พัชรพล ธูปประสม            https://github.com/Doctor-Appointment-SA/Scheduling-Service.git
                            ทำ Service การทำ Appointment ทั้งหน้าบ้านหลังบ้าน
4. กฤติน ชัยอุดมกิจ            

# System Architecture
สถาปัตยกรรมที่ใช้คือ Service-based Architecture โดยแยก backend เป็น 5 บริการหลัก
และใช้ Next.js Frontend เป็น entry point เดียวสำหรับผู้ใช้งาน

Frontend (Next.js):         รับผิดชอบ UI/UX, Routing, State
Authentication Service:     จัดการ login, register, JWT, refresh token
User Profile Service:       เก็บข้อมูลผู้ป่วย/แพทย์
Appointment Service:        ระบบนัดหมายแพทย์
Pharmacy Service:           จัดการข้อมูลยา/การสั่งจ่าย
Payment Service:            การชำระเงินและใบเสร็จ

# Demo video
