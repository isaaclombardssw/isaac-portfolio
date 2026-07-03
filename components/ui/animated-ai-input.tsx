"use client";

import { ArrowRight, Check, ChevronDown, Loader2, Mail, Paperclip } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FaPersonArrowUpFromLine,
    FaPersonChalkboard,
    FaPersonHarassing,
    FaPersonMilitaryToPerson,
} from "react-icons/fa6";
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

// Arrow that slides up on hover to reveal the mail icon — shared by both send buttons.
function ArrowMailIcon({ active }: { active: boolean }) {
    return (
        <span
            className={cn(
                "relative block h-4 w-4 overflow-hidden transition-opacity duration-200",
                active ? "opacity-100" : "opacity-30"
            )}
        >
            <ArrowRight className="absolute inset-0 h-4 w-4 transition-transform duration-300 ease-out group-hover/send:-translate-y-full" />
            <Mail className="absolute inset-0 h-4 w-4 translate-y-full transition-transform duration-300 ease-out group-hover/send:translate-y-0" />
        </span>
    );
}

export function LeadCaptureChat() {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 72, maxHeight: 300 });
    const [selectedModel, setSelectedModel] = useState("full-stack-isaac-o");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    // A message with no email HOLDS (nothing sent) and opens an email field that
    // grows out of the box's bottom — it only sends once the email is filled in.
    const [needEmail, setNeedEmail] = useState(false);
    const [replyEmail, setReplyEmail] = useState("");
    const emailRef = useRef<HTMLInputElement>(null);

    const post = (body: Record<string, string>) =>
        fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

    // Focus the email field the moment it opens.
    useEffect(() => {
        if (needEmail) emailRef.current?.focus();
    }, [needEmail]);

    // The single place a message actually goes out — with a reply email if we have one.
    const doSend = async (email?: string) => {
        const message = value.trim();
        if (!message || status === "sending") return;
        setStatus("sending");
        try {
            const body: Record<string, string> = { message: `[${selectedModel}] ${message}` };
            if (email) body.replyEmail = email;
            const res = await post(body);
            if (!res.ok) throw new Error();
            setValue("");
            setReplyEmail("");
            setNeedEmail(false);
            adjustHeight(true);
            setStatus("sent");
        } catch {
            setStatus("error");
        }
    };

    // Main button: send straight away if the message already has an email, otherwise
    // open the email field and wait — nothing is sent until it's filled in.
    const send = () => {
        const message = value.trim();
        if (!message || status === "sending" || needEmail || status === "sent") return;
        if (containsEmail(message)) doSend();
        else setNeedEmail(true);
    };

    // Email button: sends the held message together with the reply email.
    const sendEmail = () => {
        if (!replyEmail.trim() || status === "sending") return;
        doSend(replyEmail.trim());
    };

    // Editing after a send drops back to a fresh compose state.
    const onMessageChange = (v: string) => {
        setValue(v);
        adjustHeight();
        if (status === "sent" || status === "error") {
            setStatus("idle");
            setNeedEmail(false);
            setReplyEmail("");
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
                <div className="relative flex flex-col overflow-hidden rounded-xl">
                    <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                        <Textarea
                            id="lead-input"
                            value={value}
                            placeholder="What can I build for you?"
                            className={cn(
                                "w-full resize-none border-none bg-black/5 px-4 py-3 placeholder:text-black/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                                "min-h-[72px]"
                            )}
                            ref={textareaRef}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => onMessageChange(e.target.value)}
                        />
                    </div>

                    <div className="relative flex h-14 items-center bg-black/5">
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
                                    needEmail || status === "sent"
                                        ? "bg-emerald-500 text-white"
                                        : value.trim()
                                          ? "bg-brand text-brand-foreground hover:brightness-90"
                                          : "bg-black/5"
                                )}
                                aria-label="Send message"
                                disabled={!value.trim() || status === "sending" || needEmail || status === "sent"}
                                onClick={send}
                            >
                                {needEmail || status === "sent" ? (
                                    // Arrow has become a green tick — message captured; add the email to send.
                                    <Check className="h-4 w-4" />
                                ) : status === "sending" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowMailIcon active={!!value.trim()} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Email — expands out of the box's bottom border in the same grey area. */}
                    <AnimatePresence initial={false}>
                        {needEmail && (
                            <motion.div
                                key="email-row"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: "easeOut" }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-1.5 border-t border-black/10 bg-black/5 py-1.5 pl-4 pr-3">
                                    <input
                                        ref={emailRef}
                                        type="email"
                                        value={replyEmail}
                                        onChange={(e) => setReplyEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                sendEmail();
                                            }
                                        }}
                                        placeholder="you@email.com"
                                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-black/50 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        className={cn(
                                            "group/send rounded-lg p-2 transition",
                                            replyEmail.trim() ? "bg-brand text-brand-foreground hover:brightness-90" : "bg-black/5"
                                        )}
                                        aria-label="Send email"
                                        disabled={!replyEmail.trim() || status === "sending"}
                                        onClick={sendEmail}
                                    >
                                        {status === "sending" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowMailIcon active={!!replyEmail.trim()} />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Below the box: a matching email box with its own send button, or a status line. */}
            <AnimatePresence initial={false} mode="popLayout">
                {status === "sent" && (
                    <motion.p
                        key="sent"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 px-1 text-sm text-foreground/70"
                    >
                        Sent — I&apos;ll be in touch.
                    </motion.p>
                )}

                {status === "error" && (
                    <motion.p
                        key="error"
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
