# OET Self-Study Web Training Site

A web-based self-study platform for OET candidates with:
- Open access to every chapter, no registration or login required
- Video presentation section for each chapter
- Admin dashboard (login required) to upload custom local chapter videos (streamed from server)
- Generic certificate PDF generation (enter your name, no completion requirement)
- Practical quiz questions with auto-check
- Green feedback for correct answers and red feedback for incorrect answers

## CEO
Dr Awo Dompreh

## Run Locally

1. Install dependencies:
   npm install

2. Start server:
   npm start

3. Open browser:
   http://localhost:3000

## Admin Access

- Default username: admin
- Default password: oetadmin123

You can override these with environment variables:
- ADMIN_USERNAME
- ADMIN_PASSWORD

## Data Storage

- Custom chapter videos are mapped in `data/videos.json`
- Uploaded video files are saved in `uploads/`

The mapping file is created automatically on first run.

## Notes

- The course structure is based on chapter topics extracted from `OET Ready Study Guide.pdf`.
- Chapters can be browsed in any order to encourage feedback on course content.

