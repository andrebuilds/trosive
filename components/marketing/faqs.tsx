import { PlusIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeading } from "@/components/marketing/section-heading"

const FAQS = [
  {
    question: "How does Trosive make sure answers are accurate?",
    answer:
      "Every claim in an answer links to the passage it came from. Open the source reader to see the exact highlighted text and the page it sits on. When your documents don't support an answer, Trosive says so instead of guessing.",
  },
  {
    question: "What file types can I upload?",
    answer:
      "Over 40 formats, including PDFs, Word documents, slides, spreadsheets, and plain text. Scanned files are run through OCR automatically, so image-only PDFs become searchable too.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your documents are encrypted in transit and at rest in an isolated, per-workspace vector store. They are never used to train models, and deleting a document removes its embeddings with it.",
  },
  {
    question: "Can Trosive search across many documents at once?",
    answer:
      "Yes. Ask a question against a single file or your entire library, and Trosive retrieves from the right documents by meaning rather than keyword matching alone.",
  },
  {
    question: "Does it integrate with my existing tools?",
    answer:
      "Trosive connects to Google Drive and Notion to keep sources in sync. Any conversation can be exported to Markdown or shared as a link.",
  },
  {
    question: "Why do I need my own API key?",
    answer:
      "Trosive is open source and free, with no plans and no limits. Answers come from Claude, on your own Anthropic API key, so you pay Anthropic directly at their prices with nothing added on top. The key is stored encrypted and you can remove it at any time.",
  },
]

function Faqs() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 lg:py-24">
      <SectionHeading
        className="items-center text-center"
        eyebrow="FAQ"
        title="Questions, answered."
      />

      <Accordion className="mt-10 border-t">
        {FAQS.map((faq) => (
          <AccordionItem
            key={faq.question}
            value={faq.question}
            className="border-b"
          >
            {/* The component ships a chevron; swap it for the plus the design
                uses, which rotates into a close icon when the panel opens. */}
            <AccordionTrigger className="cursor-pointer gap-6 py-4 text-base font-semibold hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
              {faq.question}
              <PlusIcon className="mt-0.5 ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-45" />
            </AccordionTrigger>
            <AccordionContent className="pr-10 pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export { Faqs }
