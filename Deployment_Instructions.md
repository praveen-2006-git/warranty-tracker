# Complete Production Deployment Guide

This document outlines the exact steps to deploy your Warranty Tracker directly to **Render**, the modern Heroku replacement, operating against a live Cloud Database (**MongoDB Atlas**). The codebase has already been completely configured to handle this unified MERN architecture automatically.

## 1. Setup MongoDB Atlas (Database)
The repository currently points to `mongodb://localhost:27017` manually on your machine. To live on the web, it needs a cloud database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Build a **Free Cluster** (M0 Sandbox).
3. **Database Access:** Create a Database User (e.g., `admin`). Auto-generate a strong password and save it somewhere secure.
4. **Network Access:** Under Network Access, click "Add IP Address" and select **"Allow Access from Anywhere"** (`0.0.0.0/0`) so Render's dynamic IP machines can connect.
5. **Get URI String:** Go to your Clusters pane, click "**Connect**", then "**Connect your application**".
6. Copy the string. It will look like this:
   `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   *(Replace `<password>` with the password you saved from step 3).*

---

## 2. Deploy to Render (Hosting)
The application has been unified, meaning the backend Express logic (Port 5000) natively serves the compiled frontend React code. You only need ONE generic Web Service.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing this codebase.
4. Fill out the configuration form:
   - **Name:** `warranty-tracker`
   - **Environment:** `Node`
   - **Build Command:**
     `npm i && cd client && npm i --legacy-peer-deps && npm run build && cd ..`
   - **Start Command:**
     `npm start`
   - **Instance Type:** Free

---

## 3. Environment Environment (.env)
Before clicking 'Create Web Service', you must inject the production Environment Variables manually so Render knows how to interact with the web.

Scroll down and click "**Advanced -> Add Environment Variable**". Add the following pairs:

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Tells Express to serve the `/dist` html chunk. |
| `PORT` | `10000` | Render usually defaults to 10000. |
| `MONGO_URI` | `mongodb+srv://admin:<password>@cluster0.xxxxx...` | Paste your MongoDB Atlas string here. |
| `JWT_SECRET` | `your_super_secret_string_123` | Any long random string for encrypting user tokens. |
| `GOOGLE_CLIENT_ID`| *(Your Google OAuth Setup ID)* | Keep this identical to what you are using right now. |
| `SMTP_HOST` | `smtp.gmail.com` | Email notifications provider. |
| `SMTP_PORT` | `587` | Email port. |
| `SMTP_USER` | `youremail@gmail.com` | Email account for notifications. |
| `SMTP_PASS` | `abc_app_password_xyz` | Specific App-Password from Gmail. |

## 4. Launch!
Once the variables are locked in, hit **Create Web Service**. 
Render will read your `package.json`, trigger the Vite Production Build script, and finally launch `node index.js`. Your application will be live on the `.onrender.com` domain forever!
