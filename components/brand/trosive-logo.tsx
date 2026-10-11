import { cn } from "@/lib/utils"

/**
 * A page whose middle line is bracketed: the cited passage. Both variants share
 * one 200-unit grid; `public/brand/` and `app/icon.svg` carry the same paths.
 *
 * Light theme draws the outline, dark theme the solid page with the lines cut
 * out, so either way it reads as a light page with dark lines.
 */
const OUTLINE_PATH =
  "M27 0h100v14H41v67H31v58h10v47h118v-47h10V81h-10V46h14v154H27ZM136 0v37h37ZM55 57h90v16H55Zm0 45h90v16H55Zm0 45h90v16H55ZM38 88h19v7H45v30h12v7H38Zm124 0h-19v7h12v30h-12v7h19Z"
const SOLID_PATH =
  "M27 0h100v46h46v154H27ZM136 0v37h37ZM55 57h90v16H55Zm0 45h90v16H55Zm0 45h90v16H55ZM38 88h19v7H45v30h12v7H38Zm124 0h-19v7h12v30h-12v7h19Z"

function TrosiveMark({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn("size-8", className)}
      {...props}
    >
      <path d={OUTLINE_PATH} className="fill-foreground dark:hidden" />
      <path
        d={SOLID_PATH}
        fillRule="evenodd"
        className="hidden fill-foreground dark:inline"
      />
    </svg>
  )
}

const MARK_SIZES = {
  default: "size-8",
  sm: "size-7",
}

const WORDMARK_SIZES = {
  default: "text-lg",
  sm: "text-base",
}

function TrosiveLogo({
  size = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & { size?: keyof typeof MARK_SIZES }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)} {...props}>
      <TrosiveMark className={MARK_SIZES[size]} />
      <span
        className={cn(
          "font-heading font-bold tracking-tight",
          WORDMARK_SIZES[size]
        )}
      >
        Trosive
      </span>
    </span>
  )
}

export { TrosiveLogo, TrosiveMark }
