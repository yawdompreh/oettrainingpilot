# OET Self-Study Web Training Site

A web-based self-study platform for OET candidates with:
- Student registration and login
- Server-side username/password storage (hashed passwords)
- Chapter-by-chapter progression lock
- Video presentation section for each chapter
- Admin dashboard to monitor all student progress
- Admin upload of custom local chapter videos (streamed from server)
- Certificate PDF generation after Chapter 7 completion
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

- Users are stored in `data/users.json`
- Progress is stored in `data/progress.json`
- Custom chapter videos are mapped in `data/videos.json`
- Uploaded video files are saved in `uploads/`

Both files are created automatically on first run.

## Notes

- The course structure is based on chapter topics extracted from `OET Ready Study Guide.pdf`.
- Students must complete each chapter quiz correctly before moving to the next chapter.
