# 📝 Instant Assignments

**Automate your Assignments - Homeworks? No more!**  
Built with ❤️ for the [Next.js Hackathon](https://vercel.com/challenges/nextjs)

---

## 🚀 Overview

**Automated Assignments** is a powerful full-stack web application designed to help students automate, organize, and complete their assignments directly from Canvas LMS. Using AI-driven workflows, rich UI components, and real-time integrations, the app transforms the academic workload into a smarter, faster, and more efficient experience.

---

## ✨ Features

### 🔗 Canvas LMS Integration
- Securely connects to your Canvas LMS account via API.
- Auto-syncs assignments, deadlines, and course details in real-time.

### 🤖 AI-Powered Assignment Handling
- Uses **Google Gemini AI** to analyze instructions and generate:
  - Draft responses
  - Summaries
  - Personalized suggestions
- Accepts custom prompts to tailor the AI's output.
- Supports AI-based question answering and multi-format content generation.

### 📅 Smart Assignment Dashboard
- View assignments in calendar and list formats.
- Track due dates, completion status, and progress at a glance.
- Filter by course, due date, or priority.

### 📝 Built-in Rich Text Editor
- Edit AI responses with full Markdown & WYSIWYG support.
- Customize, format, and finalize submissions within the app.

### 📤 Direct Submission to Canvas
- Submit assignments directly to Canvas with one click.
- Attach files, links, and supporting documents.

### 📁 File Uploads
- Upload images, PDFs, and reference docs to guide AI or attach to tasks.

### 🔐 Authentication & Security
- Uses **NextAuth.js** for secure sign-in.
- Encrypted storage of API keys, tokens, and user data.
- Enforces privacy-first principles throughout the platform.

### 🎨 Stunning UI/UX
- Built with **shadcn/ui**, **Tailwind CSS**, and **GSAP** for fluid, responsive design.
- Dark/light themes for personalized user experience.

### 🔔 Smart Notifications
- Get reminders for upcoming deadlines.
- Notifications for assignment updates and status changes.

---

## 🧠 Tech Stack

| Layer        | Tech                                                  |
|--------------|--------------------------------------------------------|
| **Frontend** | Next.js 14, Tailwind CSS, shadcn/ui, GSAP             |
| **Backend**  | Next.js API Routes, Server Actions                    |
| **AI**       | Google Gemini API SDK                                 |
| **Database** | Neon Serverless Postgres                              |
| **Auth**     | NextAuth.js                                           |
| **LMS API**  | Canvas LMS API                                        |
| **Hosting**  | Vercel                                                |

---

## 🧭 Architecture Highlights

- ✅ Built with Next.js **App Router** & server components.
- 🌐 Scalable database with **Neon Postgres (serverless)**.
- 🔁 Fully integrated with **Canvas LMS** ecosystem.
- 🧱 Modular design with reusable components.
- ⚙️ Strong separation of concerns: AI logic, LMS sync, and UI flow.

---

## 📌 Ethical & Educational Focus

This project promotes responsible and ethical AI use in education. It is designed to **assist**—not replace—student effort. We encourage learners to use the tool as a productivity booster and a study companion.

---

## 🛠️ Local Development

```bash
git clone https://github.com/yourusername/automated-assignments.git
cd automated-assignments
bun install
bun run dev
```

## 🔐 Environment Variables

Set up environment variables in your `.env.local` file:


---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📣 Shoutout

Thanks to [Vercel](https://vercel.com) and the **Next.js Hackathon** team for empowering developers around the world to build amazing things.

> _"The future of learning is not just automated—it's intelligent, personal, and beautifully designed."_ ✨

## Authors
Arjav lamsal @arjavlamsal & Bibhav Adhikari @bibhav48
