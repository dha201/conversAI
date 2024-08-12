import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Message } from "ai/react";

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

interface ChatBubbleProps extends Partial<Message> {}

export function ChatBubble({
  role = "assistant",
  content,
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
      </Card>
    </div>
  );
}