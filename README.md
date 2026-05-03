# FreeAPI YouTube UI

A YouTube-style video browsing interface built with vanilla JavaScript.

## Features

- Video card grid layout
- Thumbnail, title, channel, view count & upload date
- Relative time formatting (e.g. "2 years ago")
- View count formatting (e.g. "1.2M views")
- Load more pagination
- Loading skeletons & error handling

## Tech Stack

- HTML, CSS, JavaScript (no frameworks)
- Tailwind CSS (CDN)
- FreeAPI YouTube Videos endpoint

## API Endpoint Used

```
GET https://api.freeapi.app/api/v1/public/youtube/videos
```

## Live Demo

[View Live](https://freeapi-youtube-ui.vercel.app/)

## Run Locally

```bash
npx serve .
```

Open `http://localhost:3000`