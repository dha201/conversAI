import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Message } from "ai/react";
import ReactMarkdown from "react-markdown";
import { formattedText } from "@/app/utils/utils";

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

interface ChatBubbleProps extends Partial<Message> {
  sources: string[];
}

export function ChatBubble({
  role = "assistant",
  content,
  sources,
}: ChatBubbleProps) {
  if (!content) {
    return null;
  }
  const formattedMessage = convertNewLines(content);

  return (
    <div>
      <Card className="mb-2">
        {/* Main container for the chat bubble */}
        {/* Header section displaying who the message is from (AI or You) */}
        <CardHeader>
            <CardTitle
                className={
                role != "assistant"
                    ? "text-amber-500 dark:text-amber-200"
                    : "text-blue-500 dark:text-blue-200"
                }
            >
                {role == "assistant" ? "AI" : "You"}
            </CardTitle>
        </CardHeader>

        {/* Content section displaying the formatted message */}
        <CardContent className="text-sm">
          <Balancer>{formattedMessage}</Balancer>
        </CardContent>

        {/* Footer section containing an accordion of sources, if provided */}
        <CardFooter>
          <CardDescription className="w-full">
            {sources && sources.length ? (
              <Accordion type="single" collapsible className="w-full">
                {sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <ReactMarkdown 
                        components={{
                          a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />
                        }}
                      >
                        {formattedText(source)}
                      </ReactMarkdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <></>
            )}
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
