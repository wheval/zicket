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

const DefaultSecondaryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.52356 9.73633L8.40868 10.6214M8.40868 10.6214L9.2938 11.5066M8.40868 10.6214L9.2938 9.73633M8.40868 10.6214L7.52356 11.5066" stroke="white" strokeWidth="1.32768" strokeLinecap="round"/>
  <path d="M3.0979 9.73633L3.98302 10.6214M3.98302 10.6214L4.86814 11.5066M3.98302 10.6214L4.86814 9.73633M3.98302 10.6214L3.0979 11.5066" stroke="white" strokeWidth="1.32768" strokeLinecap="round"/>
  <path d="M11.9491 9.73633L12.8342 10.6214M12.8342 10.6214L13.7193 11.5066M12.8342 10.6214L13.7193 9.73633M12.8342 10.6214L11.9491 11.5066" stroke="white" strokeWidth="1.32768" strokeLinecap="round"/>
  <path d="M16.3748 9.73633L17.2599 10.6214M17.2599 10.6214L18.145 11.5066M17.2599 10.6214L18.145 9.73633M17.2599 10.6214L16.3748 11.5066" stroke="white" strokeWidth="1.32768" strokeLinecap="round"/>
  <path d="M17.3783 14.162C15.8888 16.6432 13.3714 18.2527 11.8659 19.0473C11.3285 19.3309 11.0599 19.4727 10.6214 19.4727C10.1829 19.4727 9.9143 19.3309 9.37694 19.0473C7.8714 18.2527 5.35408 16.6432 3.86459 14.162M18.5874 7.08099C18.5863 5.79319 18.5665 5.1239 18.2298 4.67814C17.8722 4.2046 17.0634 3.97471 15.446 3.51493C14.3409 3.2008 13.3667 2.82235 12.5884 2.47685C11.5273 2.00579 10.9967 1.77026 10.6214 1.77026C10.2461 1.77026 9.71559 2.00579 8.65442 2.47685C7.87612 2.82235 6.902 3.20079 5.79691 3.51493C4.17944 3.97471 3.3707 4.2046 3.01301 4.67814C2.67631 5.1239 2.65656 5.79319 2.6554 7.08099" stroke="white" strokeWidth="1.32768" strokeLinecap="round"/>
  </svg>
  
)

const DefaultLinkIcon = () => <ArrowIcon color="#2C0A4A" />

const buttonVariants = cva(
  "focus-visible:border-ring hover:cursor-pointer focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-full border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-linear-to-b from-[#5E4BF3] to-[#9109D0] text-white border border-[#8F37DA] font-bold active:scale-99 transition-all hover:opacity-90",
        outline: "border-secondary text-secondary bg-transparent hover:text-foreground py-5! px-4! font-bold dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-[#6917AF] text-white hover:bg-[#6917AF]/90 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-[#2C0A4A] font-bold gap-1.5 [&>span]:border-b [&>span]:border-[#2C0A4A] [&>span]:border-b-[1px]",
        ticket: "border font-semibold gap-x-0! border-[#E3E3E3] py-1! px-2! rounded-[4px] bg-transparent h-[24.7px]"
      },
      size: {
        default: "h-8 gap-1.5 px-6 py-5.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
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
  hasShadow = false,
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    showIcon?: boolean
    hasShadow?: boolean
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
    if (variant === "secondary") {
      return <DefaultSecondaryIcon />
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
  ) : variant === "secondary" ? (
    <span className="inline-flex items-center gap-1.5">
      {iconElement}
      {children}
    </span> )
  : (
    <>
      {children}
      {iconElement}
    </>
  )

  const buttonElement = (
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

  if (variant === "default") {
    return (
      <div className={cn(
        "inline-block max-w-fit border border-b-2 border-[#4B107C] rounded-full p-0!",
        hasShadow && "shadow-[0_12px_16px_0_rgba(117,26,198,0.24)]",
        className 
      )}>
        {buttonElement}
      </div>
    )
  }

  return buttonElement
}

export { Button, buttonVariants }
