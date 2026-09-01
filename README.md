# Trosive

Trosive is an open-source project for AI-assisted document analysis. It is
designed to help people upload a PDF or another text-based document, understand
its contents, and ask questions through a conversational interface.

The project starts as a general-purpose tool rather than targeting a single
industry. More specialized workflows may be introduced later in response to
real-world use and community feedback.

Website: [trosive.com](https://trosive.com)

> **Project status:** Trosive is in early development. This repository currently
> contains the web application foundation; document ingestion, AI analysis,
> authentication, and usage credits are planned and are not production-ready.

## Planned features

- Upload PDFs and other text-based documents
- Generate summaries and plain-language explanations
- Highlight relevant clauses, risks, and important details
- Ask document-specific questions in chat
- Keep answers grounded in the uploaded content
- Manage hosted-service usage through free credits

## Principles

- **Always free:** no paid plan, subscription, or feature paywall is planned.
- **Open and self-hostable:** the project is intended to remain open source so
  anyone can inspect, fork, and run it independently.
- **General-purpose by default:** future specialization will be driven by actual
  needs rather than imposed from the start.
- **Transparent limits:** hosted usage will be capped only to keep AI operating
  costs sustainable.

## Hosted usage and credits

The hosted version is expected to include a free monthly credit allowance. The
initial target is 50 credits per month, although the final limit may change as
the cost model is validated.

Verified students and researchers will be able to request higher limits at no
cost. A separate, voluntary GitHub Sponsors model may be introduced later for
other users who need additional capacity.

If that sponsorship model is activated, the collected funds are intended to be
donated to [ENPA](https://www.enpa.org/) with public proof of each transfer. This
flow is not active and will not launch until the process has been agreed with
the organization.

## Technology

| Area                     | Technology                         | Status   |
| ------------------------ | ---------------------------------- | -------- |
| Web application          | Next.js 16, React 19, TypeScript   | In place |
| Interface                | Tailwind CSS 4, shadcn/ui, Base UI | In place |
| Data layer               | Prisma                             | Planned  |
| Authentication           | better-auth                        | Planned  |
| Document and AI pipeline | To be selected                     | Planned  |

## Local development

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the local development server |
| `npm run build`     | Create a production build          |
| `npm run start`     | Run the production build           |
| `npm run lint`      | Run ESLint                         |
| `npm run typecheck` | Check TypeScript types             |
| `npm run format`    | Format TypeScript and TSX files    |

## Roadmap

- Build document upload and text extraction
- Add grounded AI analysis and document chat
- Introduce persistence and authentication
- Implement hosted-service credits and usage limits
- Create the student and researcher verification flow
- Evaluate specialized use cases based on feedback
- Define the GitHub Sponsors integration after charity approval

## Disclaimer

AI-generated analysis can be incomplete or incorrect. Trosive is not a
substitute for legal or other professional advice; always verify important
information with a qualified professional.

## Contributing

Trosive is at an early stage. Focused issues and pull requests are welcome.
