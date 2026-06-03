# Project Memory: Web Application Boilerplate (Next.js & FastAPI Stack)

## Project Overview
โครงสร้างเริ่มต้น (Boilerplate / Skeleton) สำหรับพัฒนาแอปพลิเคชันเว็บสมัยใหม่ที่ประกอบด้วย Frontend (Next.js App Router + TypeScript + Tailwind CSS v4) และ Backend (FastAPI + SQLAlchemy + SQLite) พร้อมสถาปัตยกรรม Clean Architecture สะอาด พร้อมใช้งานสำหรับต่อยอดสร้างฟีเจอร์อื่นๆ 

---

## Architectural Decisions (ADR)
1. **Frontend-Backend Decoupling (การแยกส่วนแบบเป็นอิสระ)**:
   - สื่อสารระหว่าง Frontend และ Backend ผ่าน RESTful API เท่านั้น ทำให้สามารถอัปเกรดหรือพัฒนาแยกส่วนได้ง่าย
   - หน้าหลักมีระบบตรวจจับและเชื่อมต่อตรวจสอบสถานะของ API (Live Connection Check) เพื่อเพิ่มความสะดวกในการตรวจระบบ
2. **Local Database Isolation**:
   - ใช้ SQLite เป็นฐานข้อมูลเริ่มต้นเพื่อความสะดวกรวดเร็วในการทำงานแบบ Local Dev สตาร์ตระบบได้ทันทีโดยไม่ต้องติดตั้ง Server DB เพิ่มเติม
   - ออกแบบระบบจัดการ SQLAlchemy Sessions แบบ Dependency Injection (`get_db`) เพื่อให้สลับไปใช้ Postgres หรือ MySQL ได้โดยง่ายในภายหลัง

---

## Technical Stack & Libraries
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React (Icons).
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Uvicorn, Pydantic v2.
- **Database**: SQLite (Local Dev).

---

## System Boundaries & Modules
- **Minimal Core Engine**: ให้บริการ API พื้นฐานและการเชื่อมต่อแบบเรียลไทม์
- **Dummy Resource Module (Items)**: ตัวอย่างการทำ CRUD (Create / Read) ผ่าน DB ที่สมบูรณ์แบบเพื่อใช้เป็นไกด์ไลน์สำหรับผู้พัฒนา
