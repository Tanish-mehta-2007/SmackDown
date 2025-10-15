This folder contains Firebase Cloud Functions used to proxy API requests to the Render backend.

How to deploy the functions:

1. Install dependencies and deploy functions + hosting:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions,hosting
```

2. Optionally set the TARGET_BACKEND environment variable for the function in the Firebase console or using the Firebase CLI (so you can point to a different backend):

```bash
firebase functions:config:set backend.target="https://smackdown-r2qj.onrender.com"
```

Note: The function uses the environment variable `TARGET_BACKEND` at runtime if set, otherwise it defaults to `https://smackdown-r2qj.onrender.com`.
