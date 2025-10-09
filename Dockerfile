FROM node:20-alpine
WORKDIR /app

# ติดตั้ง deps จาก lockfile (เร็วสุด)
COPY package*.json ./
RUN npm ci --no-audit --progress=false

# dev: โค้ดจะมาจาก bind-mount (volumes) ไม่ต้อง COPY .
EXPOSE 3000
CMD ["npm","run","dev"]
