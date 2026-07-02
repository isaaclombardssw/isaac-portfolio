"use client";

import { ArrowRight, Check, ChevronDown, Loader2, Mail, Paperclip } from "lucide-react";
import {
    FaPersonArrowUpFromLine,
    FaPersonChalkboard,
    FaPersonHarassing,
    FaPersonMilitaryToPerson,
} from "react-icons/fa6";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { containsEmail } from "@/lib/email";
import { cn } from "@/lib/utils";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) textarea.style.height = `${minHeight}px`;
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

// Persona "models" — people/action icons instead of provider logos.
const MODELS = [
    "seo-geo-mini",
    "design-consultant-4-pro",
    "full-stack-isaac-o",
    "scrum-master-turbo",
];

const MODEL_ICONS: Record<string, React.ReactNode> = {
    "seo-geo-mini": <FaPersonArrowUpFromLine className="h-4 w-4" />,
    "design-consultant-4-pro": <FaPersonChalkboard className="h-4 w-4" />,
    "full-stack-isaac-o": <FaPersonMilitaryToPerson className="h-4 w-4" />,
    "scrum-master-turbo": <FaPersonHarassing className="h-4 w-4" />,
};

export function LeadCaptureChat() {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 72, maxHeight: 300 });
    const [selectedModel, setSelectedModel] = useState("full-stack-isaac-o");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [showEmail, setShowEmail] = useState(false);
    const [replyEmail, setReplyEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const lastMessage = useRef("");

    const post = (body: Record<string, string>) =>
        fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

    const send = async () => {
        const message = value.trim();
        if (!message || status === "sending") return;
        setStatus("sending");
        try {
            const res = await post({ message: `[${selectedModel}] ${message}` });
            if (!res.ok) throw new Error();
            lastMessage.current = message;
            setValue("");
            adjustHeight(true);
            setStatus("sent");
            if (!containsEmail(message)) setShowEmail(true);
        } catch {
            setStatus("error");
        }
    };

    const sendEmail = async () => {
        const email = replyEmail.trim();
        if (!email) return;
        try {
            await post({ message: `[${selectedModel}] ${lastMessage.current}`, replyEmail: email });
            setEmailSent(true);
            setShowEmail(false);
        } catch {
            /* keep the field open on failure */
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="w-full max-w-2xl py-4">
            <div className="rounded-2xl bg-black/5 p-1.5">
                <div className="relative flex flex-col">
                    <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                        <Textarea
                            id="lead-input"
                            value={value}
                            placeholder="What can I build for you?"
                            className={cn(
                                "w-full resize-none rounded-xl rounded-b-none border-none bg-black/5 px-4 py-3 placeholder:text-black/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                                "min-h-[72px]"
                            )}
                            ref={textareaRef}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                        />
                    </div>

                    <div className="flex h-14 items-center rounded-b-xl bg-black/5">
                        <div className="absolute bottom-3 left-3 right-3 flex w-[calc(100%-24px)] items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex h-8 items-center gap-1 rounded-md pl-1 pr-2 text-xs hover:bg-black/10 focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-0"
                                        >
                                            <div className="flex items-center gap-1">
                                                {MODEL_ICONS[selectedModel]}
                                                {/* Reserve the widest label's width (left-aligned) so the trigger never shifts. */}
                                                <span className="grid justify-items-start">
                                                    {MODELS.map((m) => (
                                                        <span
                                                            key={m}
                                                            aria-hidden
                                                            className="invisible col-start-1 row-start-1 whitespace-nowrap"
                                                        >
                                                            {m}
                                                        </span>
                                                    ))}
                                                    <span className="col-start-1 row-start-1 whitespace-nowrap">
                                                        {selectedModel}
                                                    </span>
                                                </span>
                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className={cn(
                                            "min-w-[13rem] border-black/10",
                                            "bg-gradient-to-b from-white via-white to-neutral-100"
                                        )}
                                    >
                                        {MODELS.map((model) => (
                                            <DropdownMenuItem
                                                key={model}
                                                onSelect={() => setSelectedModel(model)}
                                                className="flex items-center justify-between gap-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {MODEL_ICONS[model]}
                                                    <span>{model}</span>
                                                </div>
                                                {selectedModel === model && (
                                                    <Check className="h-4 w-4 text-brand" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <div className="mx-0.5 h-4 w-px bg-black/10" />
                                <label
                                    className={cn(
                                        "cursor-pointer rounded-lg bg-black/5 p-2 text-black/40",
                                        "hover:bg-black/10 hover:text-black focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-0"
                                    )}
                                    aria-label="Attach a brief"
                                >
                                    <input type="file" className="hidden" />
                                    <Paperclip className="h-4 w-4 transition-colors" />
                                </label>
                            </div>
                            <button
                                type="button"
                                className={cn(
                                    "group/send rounded-lg p-2 transition",
                                    value.trim() ? "bg-brand text-brand-foreground hover:brightness-110" : "bg-black/5"
                                )}
                                aria-label="Send message"
                                disabled={!value.trim() || status === "sending"}
                                onClick={send}
                            >
                                {status === "sending" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    // Arrow slides up and out on hover, revealing the email icon.
                                    <span
                                        className={cn(
                                            "relative block h-4 w-4 overflow-hidden transition-opacity duration-200",
                                            value.trim() ? "opacity-100" : "opacity-30"
                                        )}
                                    >
                                        <ArrowRight className="absolute inset-0 h-4 w-4 transition-transform duration-300 ease-out group-hover/send:-translate-y-full" />
                                        <Mail className="absolute inset-0 h-4 w-4 translate-y-full transition-transform duration-300 ease-out group-hover/send:translate-y-0" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status + optional email follow-up */}
            <AnimatePresence>
                {status === "sent" && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 px-1 text-sm text-foreground/70"
                    >
                        {emailSent ? (
                            "Got it — I'll be in touch."
                        ) : showEmail ? (
                            <div className="flex flex-col gap-2">
                                <span>Sent. Want to add an email so I can reply?</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        value={replyEmail}
                                        onChange={(e) => setReplyEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendEmail()}
                                        placeholder="you@email.com"
                                        className="flex-1 rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-foreground placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendEmail}
                                        disabled={!replyEmail.trim()}
                                        className="rounded-lg bg-brand px-3 py-2 text-brand-foreground disabled:opacity-40"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ) : (
                            "Sent — I'll be in touch."
                        )}
                    </motion.div>
                )}
                {status === "error" && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 px-1 text-sm text-red-600"
                    >
                        Something went wrong — try again?
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
