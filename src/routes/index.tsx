import { createFileRoute } from "@tanstack/react-router";
import { SvodApp } from "@/components/svod/SvodApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Свод — корпоративная вики" },
      { name: "description", content: "Свод: самохостящаяся корпоративная вики — пространства, решения, инструкции и поиск." },
      { property: "og:title", content: "Свод — корпоративная вики" },
      { property: "og:description", content: "Пространства, решения, инструкции и поиск в одном тихом инструменте." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SvodApp,
});
