"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AttachmentIcon,
  BotIcon,
  UserIcon,
  VercelIcon,
} from "@/components/icons";
import { DragEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import React from "react";
import { SendIcon } from "lucide-react";
import { StopIcon } from "@radix-ui/react-icons";
import { createClient } from "@/libs/supabase/client";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

const getTextFromDataUrl = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1];
  return window.atob(base64);
};

function TextFilePreview({ file }: { file: File }) {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      setContent(typeof text === "string" ? text.slice(0, 100) : "");
    };
    reader.readAsText(file);
  }, [file]);

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  );
}

export default function Page() {
  const { toast } = useToast()
  const router = useRouter();
  const supabase = createClient();
  const { messages, input, handleSubmit, handleInputChange, isLoading, stop } =
    useChat({
      onError: () =>
        toast({
          title: "You've been rate limited, please try again later!",
          variant: "destructive",
        }),
    });

    useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signin");
          toast({
            title: "You've been rate limited, please try again later!",
            variant: "destructive",
          });
        }
      };
      checkUser();
    }, [router, supabase.auth]);

  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Reference for the hidden file input
  const [isDragging, setIsDragging] = useState(false);

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;

    if (items) {
      const files = Array.from(items)
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        const validFiles = files.filter(
          (file) =>
            file.type.startsWith("image/") || file.type.startsWith("text/")
        );

        if (validFiles.length === files.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          setFiles(dataTransfer.files);
        } else {
          toast({
            title: "Only image and text files are allowed",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    const droppedFilesArray = Array.from(droppedFiles);
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("text/")
      );

      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast({
          title: "Only image and text files are allowed!",
          variant: "destructive",
        });
      }

      setFiles(droppedFiles);
    }
    setIsDragging(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle file selection via the upload button
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle files selected from the file dialog
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("text/")
      );

      if (validFiles.length === selectedFiles.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast({
          title: "Only image and text files are allowed",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div
      className="flex flex-row justify-center bg-white dark:bg-zinc-900 pb-20 h-dvh"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="z-10 fixed flex flex-col justify-center items-center gap-1 bg-zinc-100/90 dark:bg-zinc-900/90 w-dvw h-dvh pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">
              {"(images and text)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col justify-between gap-4">
        {messages.length > 0 ? (
          <div className="flex flex-col items-center gap-2 w-dvw h-full overflow-y-scroll">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex flex-row gap-2 px-4 w-full md:w-[500px] md:px-0 ${index === 0 ? "pt-20" : ""
                  }`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex flex-col flex-shrink-0 justify-center items-center size-[24px] text-zinc-400">
                  {message.role === "assistant" ? <BotIcon /> : <UserIcon />}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-4 text-zinc-800 dark:text-zinc-300">
                    <Markdown>{message.content}</Markdown>
                  </div>
                  <div className="flex flex-row gap-2">
                    {message.experimental_attachments?.map((attachment) =>
                      attachment.contentType?.startsWith("image") ? (
                        <Image
                          className="mb-3 rounded-md w-40"
                          key={attachment.name}
                          src={attachment.url}
                          alt={attachment.name ?? "Attachment"}
                        />
                      ) : attachment.contentType?.startsWith("text") ? (
                        <div className="dark:bg-zinc-800 mb-3 p-2 border dark:border-zinc-700 rounded-md w-40 h-24 overflow-hidden text-zinc-400 text-xs">
                          {getTextFromDataUrl(attachment.url)}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading &&
              messages[messages.length - 1].role !== "assistant" && (
                <div className="flex flex-row gap-2 px-4 md:px-0 w-full md:w-[500px]">
                  <div className="flex flex-col flex-shrink-0 justify-center items-center size-[24px] text-zinc-400">
                    <BotIcon />
                  </div>
                  <div className="flex flex-col gap-1 text-zinc-400">
                    <div>hmm...</div>
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <motion.div className="px-4 md:px-0 pt-20 w-full md:w-[500px] h-[350px]">
            <div className="flex flex-col gap-4 p-6 border dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 text-sm">
              <p className="flex flex-row justify-center items-center gap-4 text-zinc-900 dark:text-zinc-50">
                <VercelIcon />
                <span>+</span>
                <AttachmentIcon />
              </p>
              <p>
                The useChat hook supports sending attachments along with
                messages as well as rendering previews on the client. This can
                be useful for building applications that involve sending images,
                files, and other media content to the AI provider.
              </p>
              <p>
                {" "}
                Learn more about the{" "}
                <Link
                  className="text-blue-500 dark:text-blue-400"
                  href="https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot#attachments-experimental"
                  target="_blank"
                >
                  useChat{" "}
                </Link>
                hook from Vercel AI SDK.
              </p>
            </div>
          </motion.div>
        )}

        <form
          className="relative flex flex-col items-center gap-2"
          onSubmit={(event) => {
            const options = files ? { experimental_attachments: files } : {};
            handleSubmit(event, options);
            setFiles(null);
          }}
        >
          <AnimatePresence>
            {files && files.length > 0 && (
              <div className="bottom-12 absolute flex flex-row gap-2 px-4 md:px-0 w-full md:w-[500px]">
                {Array.from(files).map((file) =>
                  file.type.startsWith("image") ? (
                    <div key={file.name}>
                      <motion.img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="rounded-md w-16"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{
                          y: -10,
                          scale: 1.1,
                          opacity: 0,
                          transition: { duration: 0.2 },
                        }}
                      />
                    </div>
                  ) : file.type.startsWith("text") ? (
                    <motion.div
                      key={file.name}
                      className="bg-white dark:bg-zinc-800 p-2 border dark:border-zinc-700 rounded-lg w-28 h-16 overflow-hidden text-[8px] text-zinc-500 dark:text-zinc-400 leading-1"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        y: -10,
                        scale: 1.1,
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <TextFilePreview file={file} />
                    </motion.div>
                  ) : null
                )}
              </div>
            )}
          </AnimatePresence>

          {/* Hidden file input */}
          <Input
            type="file"
            multiple
            accept="image/*,text/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 px-4 py-2 rounded-full w-full max-w-[calc(100dvw-32px)] md:max-w-[500px]">
            {/* Upload Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleUploadClick}
              aria-label="Upload Files"
            >
              <AttachmentIcon aria-hidden="true" />
            </Button>

            {/* Message Input */}
            <Input
              ref={inputRef}
              className="flex-grow bg-transparent shadow-none border-none outline-none focus:ring-0 text-zinc-800 dark:text-zinc-300 placeholder-zinc-400"
              placeholder="Send a message..."
              value={input}
              onChange={handleInputChange}
              onPaste={handlePaste}
            />

            {isLoading ? (
              <Button variant="default" onClick={stop}>
                <StopIcon />
              </Button>
            ) : (
              <Button type="submit" variant="default" disabled={isLoading || input.length < 1}>
                <SendIcon className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}