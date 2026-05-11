# KaraOkay frontend
This is the frontend service for KaraOkay website.
## Prerequisites
 - npm
 - Node.js (v18 or later)
## Usage
```bash
git clone https://github.com/mxilia/CEE-Final.git
```
After that make sure your current directory is at the root of this project.
```bash
cd frontend
```

Run this to download dependencies:
```bash
npm install
```

Make .env file and fill in fields like this:
```yaml
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Write your own values for corresponding variables.

To run this project, execute:
```bash
npm run dev
```

