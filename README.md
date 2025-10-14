<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Cam40TXkrOwdDh2NkZRK1e65l_QYT-BT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Firebase Hosting

1. Install the Firebase CLI if you haven't already:
   `npm install -g firebase-tools`
2. Log in and initialize hosting (run this from the project root):
   `firebase login`
   `firebase init hosting`
   - When asked for the public directory, enter `dist`.
   - Choose to configure as a single-page app when prompted.
3. Build the app and deploy:
   `npm run build`
   `npm run deploy`

Note: update `.firebaserc` with your Firebase project id or run `firebase use --add` to select a project.
