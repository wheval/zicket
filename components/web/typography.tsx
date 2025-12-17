import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const typographyVariants = cva("text-foreground", {
    variants: {
        variant: {
            h1: " text-[40px] lg:text-[64px] font-bold tracking-[-5%] leading-[100%]",
            h2: "scroll-m-20 pb-2 text-[24px] lg:text-[40px] font-bold tracking-tight first:mt-0",
            h3: "scroll-m-20 text-[24px] lg:text-[32px] font-semibold tracking-tight",
            h4: "scroll-m-20 text-xl font-semibold tracking-tight",
            p: "leading-7 [&:not(:first-child)]:mt-6",
            blockquote: "mt-6 border-l-2 pl-6 italic",
            table: "w-full",
            list: "my-6 ml-6 list-disc [&>li]:mt-2",
            lead: "text-base text-[#A8ADBD] tracking-[-5%]",
            large: "text-lg font-semibold",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground",
        },
    },
    defaultVariants: {
        variant: "p",
    },
});

type VariantPropType = VariantProps<typeof typographyVariants>;
// Extract the variant keys to map to HTML tags
const variantToTag: Record<NonNullable<VariantPropType["variant"]>, React.ElementType> = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    p: "p",
    blockquote: "blockquote",
    table: "table",
    list: "ul",
    lead: "p",
    large: "div",
    small: "small",
    muted: "p",
};

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
    as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, as, ...props }, ref) => {
        const Component = as || (variant ? variantToTag[variant] : "p");

        return (
            <Component
                className={cn(typographyVariants({ variant, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
