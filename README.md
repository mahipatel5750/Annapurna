# Annapurna - Tiffin Delivery Service

Annapurna is a modern web application designed for managing and tracking home-cooked meal (tiffin) subscriptions. It provides a seamless experience for both customers and administrators to handle daily food deliveries.

## 🚀 Features

### Customer Features
* **Authentication:** Secure Sign up and Login flows via Email/Password or Google account (powered by Firebase Auth).
* **Subscription Management:** Users can browse different tiffin plans, view pricing, and subscribe.
* **Live Delivery Tracking:** A dedicated real-time tracker in the "My Subscriptions" panel showing if today's meal is *Preparing*, *Out for Delivery*, or *Delivered*.
* **Pause/Resume:** Users can skip days and add notes to their specific delivery requests.

### Admin Features
* **Admin Dashboard:** A centralized view of all active/pending subscriptions across the platform.
* **Status Controls:** Manage the fulfillment process by ticking orders as *Out for Delivery* or *Delivered*.
* **Customer Management:** Keep track of skipped days and custom dietary notes left by subscribers.

## 🛠️ Technology Stack
* **Frontend:** React 18 with TypeScript
* **Styling:** Tailwind CSS for responsive and utility-first styling
* **Animations:** Framer Motion (`motion/react`)
* **Icons:** Lucide React
* **Backend / Database:** Firebase Authentication & Firestore (NoSQL Database)
* **Build Tool:** Vite

## 📁 Project Structure

```text
/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Modals, Trackers)
│   ├── contexts/           # React Context providers (AuthContext)
│   ├── pages/              # Main route pages (Login, Signup, Admin Panel)
│   ├── App.tsx             # Main application layout and routes
│   ├── firebase.ts         # Firebase initialization and setup
│   ├── main.tsx            # React application entry point
│   └── index.css           # Global stylesheet and Tailwind imports
├── .env.example            # Example file for environment variables
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite bundler configuration
```

## 💻 Workflow & How to Run in VS Code

This application is designed to be easily runnable out-of-the-box using the standard Node.js ecosystem. 

### Prerequisites
* [Node.js](https://nodejs.org/en/) installed on your machine.
* [Visual Studio Code](https://code.visualstudio.com/) installed.
* A [Firebase Project](https://console.firebase.google.com/) (Optional: Only if you're deploying your own DB, otherwise the environment settings will connect to the active backend).

### Setup Instructions

1. **Open the Project in VS Code:**
   * Launch VS Code.
   * Go to `File > Open Folder...` and select the directory containing this project.

2. **Open the Integrated Terminal:**
   * Go to `Terminal > New Terminal` in the top menu of VS Code, or press `` Ctrl + ` ``.

3. **Install Dependencies:**
   * In the terminal, run the following command to download all required packages:
     ```bash
     npm install
     ```

4. **Environment Configuration:**
   * Copy the `.env.example` file and rename it to `.env`.
   * Fill in your Firebase configuration keys inside the `.env` file. It should look like this:
     ```env
     VITE_FIREBASE_API_KEY="your-api-key"
     VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
     VITE_FIREBASE_PROJECT_ID="your-project-id"
     VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
     VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
     VITE_FIREBASE_APP_ID="your-app-id"
     ```

5. **Start the Development Server:**
   * Run the following command to start Vite's hot-reloading local server:
     ```bash
     npm run dev
     ```
   * VS Code's terminal will output a local URL (usually `http://localhost:3000` or `http://localhost:5173`). 
   * `Ctrl + Click` (or `Cmd + Click` on Mac) that URL to open the app in your local browser.

### Building for Production
Once you are ready to deploy your application:
```bash
npm run build
```
This will compile the TypeScript definitions and bundle the application into static HTML/CSS/JS files located in a new `dist/` directory, which can be deployed to Vercel, Netlify, or Firebase Hosting.

## 🤝 Workflow Lifecycle Explained
1. **Initial Visit:** A new user lands on the Home Page, browses menus, and decides to sign up.
2. **Authentication:** The `SignupPage` registers the user via Firebase Auth. The global state (`AuthContext`) updates to reflect the active user session.
3. **Purchasing & Firestore:** The user selects a tiffin plan, opening the checkout modal. Upon successful checkout, a new Document is created in the `subscriptions` Firestore collection natively mapping to the user's Unique ID (`uid`).
4. **Order Tracking:** The user opens "My Subscriptions". An active listener (`onSnapshot`) updates the client immediately whenever the `deliveryStatus` field changes in the database.
5. **Administration:** The admin opens `/admin`. They can modify the `deliveryStatus` field within the Admin dashboard, writing directly to the Firebase database and instantly triggering the user's interface to transition from *Preparing* to *Out for Delivery*.


Live Demo
```bash
https://mahipatel5750.github.io/Annapurna/
```
#Author

Mahi Patel

Computer Science Student | Full Stack Developer

License

This project is developed for academic and learning purposes.
