module.exports = {
  "extraMetadata": {
    "version": "1.0.0"
  },
  "productName": "Imhotep Tasks",
  "appId": "com.imhoteptech.imhotep-tasks",
  "directories": {
    "output": "dist"
  },
  "files": [
    "main.js",
    "preload.js",
    "package.json",
    "icon.png",
    "icon1.ico"
  ],
  "win": {
    "target": "nsis",
    "icon": "icon1.ico",
    "artifactName": "${productName}_Setup_${version}.${ext}"
  },
  "mac": {
    "target": "dmg",
    "icon": "icon.icns"
  },
  "linux": {
    "target": ["snap"],
    "icon": "icon.png",
    "category": "Utility",
    "maintainer": "Imhotep Tech <imhoteptech@outlook.com>"
  },
  "snap": {
    "confinement": "strict",
    "summary": "Task management application",
    "description": "Imhotep Tasks is a modern, intuitive task management system designed to help individuals organize, prioritize, and track their daily tasks with ease.",
    "grade": "stable"
  },
  "publish": [
    {
      "provider": "github",
      "owner": "Imhotep-Tech",
      "repo": "imhotep-tasks",
      "releaseType": "release"
    }
  ]
};