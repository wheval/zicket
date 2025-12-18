import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type ArrowIconProps = {
  color: string
}

const ArrowIcon = ({ color }: ArrowIconProps) => (
  <svg
    className="w-[22px]! h-[22px]!"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.047 6.1958L5.31067 15.9321"
      stroke={color}
      strokeWidth="1.32768"
      strokeLinecap="round"
    />
    <path
      d="M9.73633 5.42697C9.73633 5.42697 14.7227 5.00663 15.4794 5.76333C16.2361 6.52004 15.8157 11.5064 15.8157 11.5064"
      stroke={color}
      strokeWidth="1.32768"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DefaultArrowIcon = () => <ArrowIcon color="white" />

const DefaultTicketIcon = () => (
  <svg className="w-[17px]! h-[17px]!" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.26236 4.1748C6.26236 4.1748 10.437 7.24942 10.437 8.34952C10.437 9.4497 6.26233 12.5242 6.26233 12.5242" stroke="#2C0A4A" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>  
)

const DefaultLinkIcon = () => <ArrowIcon color="#2C0A4A" />

const buttonVariants = cva(
  "focus-visible:border-ring hover:cursor-pointer focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-full border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-secondary text-secondary bg-transparent hover:text-foreground py-5! px-4! font-bold dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-[#2C0A4A] font-bold gap-1.5 [&>span]:border-b [&>span]:border-[#2C0A4A] [&>span]:border-b-[1.5px]",
        ticket: "border font-semibold gap-x-0! border-[#E3E3E3] py-1 px-2 rounded-[4px] bg-transparent h-[24.7px]"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  showIcon = false,
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    showIcon?: boolean
    icon?: React.ReactNode
  }) {
  const Comp = asChild ? Slot.Root : "button"
  
  const getDefaultIcon = () => {
    if (variant === "ticket") {
      return <DefaultTicketIcon />
    }
    if (variant === "link" || variant === "outline") {
      return <DefaultLinkIcon />
    }
    return <DefaultArrowIcon />
  }
  
  // Link & outline variants always show icon by default
  const forceIcon = variant === "link" || variant === "outline"
  const shouldShowIcon = forceIcon ? true : showIcon
  const iconElement = shouldShowIcon ? (icon || getDefaultIcon()) : null

  const content = variant === "link" ? (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {iconElement}
    </span>
  ) : (
    <>
      {children}
      {iconElement}
    </>
  )

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {content}
    </Comp>
  )
}

export { Button, buttonVariants }
